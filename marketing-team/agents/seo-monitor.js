/**
 * seo-monitor.js
 *
 * SEO health monitoring agent for disaster911.net.
 * Checks PageSpeed scores, Core Web Vitals, JSON-LD schema markup,
 * and sitemap health. Generates detailed reports saved to reports/.
 *
 * Functions exported:
 *   checkPageSpeed(url)       — PageSpeed Insights scores + opportunities
 *   checkSchemaMarkup(url)    — Validates JSON-LD schema tags on page
 *   checkSitemapHealth()      — Sitemap URL count + spot-check 5 URLs
 *   checkCoreVitals(url)      — LCP, CLS, INP field data grades
 *   runFullSEOAudit()         — Full audit across homepage + city pages
 */

'use strict';

const axios   = require('axios');
const cheerio = require('cheerio');
const chalk   = require('chalk');
const ora     = require('ora');
const path    = require('path');
const fs      = require('fs-extra');
const { config, BUSINESS, validateCredentials } = require('../config');

const REPORTS_DIR = path.join(__dirname, '../reports');

// Pages to audit in the full run
const AUDIT_PAGES = [
  { label: 'Homepage',              url: 'https://disaster911.net/' },
  { label: 'Water Damage (GR)',     url: 'https://disaster911.net/service-areas/grand-rapids/water-damage-restoration/' },
  { label: 'Water Damage (Kentwd)', url: 'https://disaster911.net/service-areas/kentwood/water-damage-restoration/' },
  { label: 'Water Damage (Wyomng)', url: 'https://disaster911.net/service-areas/wyoming/water-damage-restoration/' },
];

// Core Web Vitals thresholds (Google's official values)
const CWV_THRESHOLDS = {
  LCP: { good: 2500,  poor: 4000  }, // milliseconds
  CLS: { good: 0.1,   poor: 0.25  }, // unitless
  INP: { good: 200,   poor: 500   }, // milliseconds (replaces FID)
  FCP: { good: 1800,  poor: 3000  }, // milliseconds
  TTFB:{ good: 800,   poor: 1800  }, // milliseconds
};

// Request headers for page fetches
const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (compatible; Disaster911-SEO-Monitor/1.0)',
  'Accept': 'text/html,application/xhtml+xml,*/*;q=0.8',
};

/**
 * gradeMetric
 * Given a metric name and value, returns 'good' | 'needs improvement' | 'poor'.
 */
function gradeMetric(metricName, value) {
  const thresholds = CWV_THRESHOLDS[metricName];
  if (!thresholds) return 'unknown';
  if (value <= thresholds.good) return 'good';
  if (value <= thresholds.poor) return 'needs improvement';
  return 'poor';
}

/**
 * gradeColor
 * Returns a chalk-colored string for a CWV grade.
 */
function gradeColor(grade, text) {
  if (grade === 'good')             return chalk.green(text);
  if (grade === 'needs improvement') return chalk.yellow(text);
  if (grade === 'poor')             return chalk.red(text);
  return chalk.gray(text);
}

// ── PageSpeed / Core Web Vitals ───────────────────────────────────────────────

/**
 * checkPageSpeed
 * Calls the Google PageSpeed Insights API for both mobile and desktop.
 * Returns an object with scores and top opportunities for improvement.
 */
async function checkPageSpeed(url) {
  const { valid } = validateCredentials(['PAGESPEED_API_KEY']);

  const results = { url, mobile: null, desktop: null, error: null };

  for (const strategy of ['mobile', 'desktop']) {
    try {
      const apiUrl = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';
      const params = {
        url,
        strategy,
        category: ['performance', 'seo', 'accessibility', 'best-practices'],
      };

      // Add API key only if available — PageSpeed works without it but with lower quota
      if (valid) params.key = config.PAGESPEED_API_KEY;

      const response = await axios.get(apiUrl, {
        params,
        timeout: 60000, // PageSpeed can be slow
        validateStatus: () => true,
      });

      if (response.status !== 200) {
        results[strategy] = { error: `HTTP ${response.status}` };
        continue;
      }

      const data       = response.data;
      const categories = data.lighthouseResult?.categories || {};
      const audits     = data.lighthouseResult?.audits || {};

      // Extract top 5 opportunities (failed audits with savings)
      const opportunities = Object.values(audits)
        .filter(a => a.score !== null && a.score < 0.9 && a.details?.type === 'opportunity')
        .sort((a, b) => (a.score || 0) - (b.score || 0))
        .slice(0, 5)
        .map(a => ({
          id:          a.id,
          title:       a.title,
          description: a.description?.replace(/\[.*?\]\(.*?\)/g, '').slice(0, 120),
          score:       a.score,
          displayValue: a.displayValue,
        }));

      results[strategy] = {
        scores: {
          performance:    Math.round((categories.performance?.score  || 0) * 100),
          seo:            Math.round((categories.seo?.score          || 0) * 100),
          accessibility:  Math.round((categories.accessibility?.score || 0) * 100),
          bestPractices:  Math.round((categories['best-practices']?.score || 0) * 100),
        },
        opportunities,
        fetchTime: data.lighthouseResult?.fetchTime,
      };
    } catch (err) {
      results[strategy] = { error: err.message };
    }
  }

  return results;
}

/**
 * checkCoreVitals
 * Extracts Core Web Vitals from PageSpeed field data (real-user measurements).
 * Returns { LCP, CLS, INP, FCP, TTFB } each with value, unit, and grade.
 */
async function checkCoreVitals(url) {
  const { valid } = validateCredentials(['PAGESPEED_API_KEY']);

  try {
    const params = {
      url,
      strategy: 'mobile', // CWV field data is typically mobile-focused
      category: 'performance',
    };
    if (valid) params.key = config.PAGESPEED_API_KEY;

    const response = await axios.get(
      'https://www.googleapis.com/pagespeedonline/v5/runPagespeed',
      { params, timeout: 60000, validateStatus: () => true }
    );

    if (response.status !== 200) {
      return { url, error: `HTTP ${response.status}`, metrics: {} };
    }

    const fieldData = response.data?.loadingExperience?.metrics || {};
    const audits    = response.data?.lighthouseResult?.audits || {};

    const metrics = {};

    // LCP
    if (fieldData.LARGEST_CONTENTFUL_PAINT_MS) {
      const val = fieldData.LARGEST_CONTENTFUL_PAINT_MS.percentile;
      metrics.LCP = { value: val, unit: 'ms', grade: gradeMetric('LCP', val) };
    } else if (audits['largest-contentful-paint']) {
      const val = audits['largest-contentful-paint'].numericValue;
      metrics.LCP = { value: Math.round(val), unit: 'ms', grade: gradeMetric('LCP', val), source: 'lab' };
    }

    // CLS
    if (fieldData.CUMULATIVE_LAYOUT_SHIFT_SCORE) {
      const val = fieldData.CUMULATIVE_LAYOUT_SHIFT_SCORE.percentile / 100;
      metrics.CLS = { value: val.toFixed(3), unit: '', grade: gradeMetric('CLS', val) };
    } else if (audits['cumulative-layout-shift']) {
      const val = audits['cumulative-layout-shift'].numericValue;
      metrics.CLS = { value: val.toFixed(3), unit: '', grade: gradeMetric('CLS', val), source: 'lab' };
    }

    // INP (Interaction to Next Paint)
    if (fieldData.INTERACTION_TO_NEXT_PAINT) {
      const val = fieldData.INTERACTION_TO_NEXT_PAINT.percentile;
      metrics.INP = { value: val, unit: 'ms', grade: gradeMetric('INP', val) };
    }

    // FCP
    if (fieldData.FIRST_CONTENTFUL_PAINT_MS) {
      const val = fieldData.FIRST_CONTENTFUL_PAINT_MS.percentile;
      metrics.FCP = { value: val, unit: 'ms', grade: gradeMetric('FCP', val) };
    }

    // TTFB
    if (fieldData.EXPERIMENTAL_TIME_TO_FIRST_BYTE) {
      const val = fieldData.EXPERIMENTAL_TIME_TO_FIRST_BYTE.percentile;
      metrics.TTFB = { value: val, unit: 'ms', grade: gradeMetric('TTFB', val) };
    }

    return { url, metrics, fieldDataAvailable: Object.keys(fieldData).length > 0 };
  } catch (err) {
    return { url, error: err.message, metrics: {} };
  }
}

// ── Schema Markup ──────────────────────────────────────────────────────────────

// Expected schema types that should be present on disaster911.net pages
const EXPECTED_SCHEMA_TYPES = [
  'LocalBusiness',
  'Organization',
];
const OPTIONAL_SCHEMA_TYPES = [
  'FAQPage',
  'BreadcrumbList',
  'WebPage',
  'Service',
  'AggregateRating',
];

/**
 * checkSchemaMarkup
 * Fetches the page, extracts all JSON-LD script blocks, validates they parse
 * correctly, and checks for expected @type values.
 */
async function checkSchemaMarkup(url) {
  const result = {
    url,
    schemasFound:   [],
    expectedPresent: [],
    expectedMissing: [],
    optionalPresent: [],
    parseErrors:    [],
    valid:          false,
    error:          null,
  };

  try {
    const response = await axios.get(url, {
      headers: BROWSER_HEADERS,
      timeout: 20000,
      validateStatus: () => true,
    });

    if (response.status >= 400) {
      result.error = `HTTP ${response.status}`;
      return result;
    }

    const $ = cheerio.load(response.data);

    // Extract all JSON-LD blocks
    $('script[type="application/ld+json"]').each((i, el) => {
      const raw = $(el).html() || '';
      try {
        const parsed = JSON.parse(raw);
        // Handle both single objects and @graph arrays
        const schemas = Array.isArray(parsed)
          ? parsed
          : parsed['@graph']
            ? parsed['@graph']
            : [parsed];

        for (const schema of schemas) {
          const type = schema['@type'];
          if (type) {
            const typeStr = Array.isArray(type) ? type.join(', ') : type;
            result.schemasFound.push(typeStr);
          }
        }
      } catch (parseErr) {
        result.parseErrors.push(`Block ${i + 1}: ${parseErr.message}`);
      }
    });

    // Check expected types
    for (const expected of EXPECTED_SCHEMA_TYPES) {
      const found = result.schemasFound.some(t => t.includes(expected));
      if (found) {
        result.expectedPresent.push(expected);
      } else {
        result.expectedMissing.push(expected);
      }
    }

    // Check optional types
    for (const optional of OPTIONAL_SCHEMA_TYPES) {
      if (result.schemasFound.some(t => t.includes(optional))) {
        result.optionalPresent.push(optional);
      }
    }

    result.valid = result.parseErrors.length === 0 && result.expectedMissing.length === 0;
  } catch (err) {
    result.error = err.message;
  }

  return result;
}

// ── Sitemap ───────────────────────────────────────────────────────────────────

/**
 * checkSitemapHealth
 * Fetches sitemap.xml, counts URLs, and spot-checks 5 random URLs for 200 status.
 */
async function checkSitemapHealth() {
  const sitemapUrl = 'https://disaster911.net/sitemap.xml';
  const result = {
    sitemapUrl,
    accessible:   false,
    totalUrls:    0,
    sampledUrls:  [],
    allSamples200: false,
    error:        null,
  };

  try {
    // Fetch sitemap
    const response = await axios.get(sitemapUrl, {
      headers: BROWSER_HEADERS,
      timeout: 15000,
      validateStatus: () => true,
    });

    if (response.status !== 200) {
      result.error = `Sitemap returned HTTP ${response.status}`;
      return result;
    }

    result.accessible = true;
    const $     = cheerio.load(response.data, { xmlMode: true });
    const urls  = [];
    $('url loc, sitemap loc').each((_, el) => {
      urls.push($(el).text().trim());
    });

    result.totalUrls = urls.length;

    // Pick 5 random URLs to spot-check
    const shuffled = urls.sort(() => 0.5 - Math.random()).slice(0, 5);

    for (const pageUrl of shuffled) {
      try {
        const r = await axios.head(pageUrl, {
          headers: BROWSER_HEADERS,
          timeout: 10000,
          maxRedirects: 5,
          validateStatus: () => true,
        });
        result.sampledUrls.push({ url: pageUrl, status: r.status, ok: r.status === 200 });
      } catch (err) {
        result.sampledUrls.push({ url: pageUrl, status: 'error', ok: false, error: err.message });
      }
      // Brief delay between requests
      await new Promise(r => setTimeout(r, 500));
    }

    result.allSamples200 = result.sampledUrls.every(u => u.ok);
  } catch (err) {
    result.error = err.message;
  }

  return result;
}

// ── Full Audit ────────────────────────────────────────────────────────────────

/**
 * runFullSEOAudit
 * Runs all SEO checks on the homepage + 3 top city pages.
 * Saves consolidated report to reports/seo-audit-{timestamp}.json.
 */
async function runFullSEOAudit() {
  console.log(chalk.bold.cyan('\n🔍 Starting Full SEO Audit...\n'));

  const spinner = ora({ text: '', color: 'cyan' });
  const report  = {
    type:      'seo-audit',
    timestamp: new Date().toISOString(),
    business:  BUSINESS.name,
    website:   BUSINESS.website,
    sitemap:   null,
    pages:     [],
    summary:   {},
  };

  // ── 1. Sitemap health ────────────────────────────────────────────────────────
  spinner.text = 'Checking sitemap health...';
  spinner.start();
  report.sitemap = await checkSitemapHealth();
  spinner.stop();

  const sitemapStatus = report.sitemap.accessible
    ? chalk.green(`✔ ${report.sitemap.totalUrls} URLs found`)
    : chalk.red('✘ Sitemap not accessible');
  console.log(`Sitemap: ${sitemapStatus}`);

  if (report.sitemap.sampledUrls.length > 0) {
    const failed = report.sitemap.sampledUrls.filter(u => !u.ok);
    if (failed.length > 0) {
      console.log(chalk.yellow(`  ⚠ ${failed.length} sampled URLs returned non-200 status`));
    } else {
      console.log(chalk.green(`  ✔ All 5 sampled URLs return HTTP 200`));
    }
  }

  // ── 2. Per-page audits ───────────────────────────────────────────────────────
  for (const page of AUDIT_PAGES) {
    console.log(chalk.bold(`\n── ${page.label} ──────────────────────────────────`));

    const pageResult = {
      label:      page.label,
      url:        page.url,
      pageSpeed:  null,
      coreVitals: null,
      schema:     null,
    };

    // PageSpeed
    spinner.text = `PageSpeed: ${page.url}`;
    spinner.start();
    pageResult.pageSpeed = await checkPageSpeed(page.url);
    spinner.stop();

    const mob  = pageResult.pageSpeed.mobile;
    const desk = pageResult.pageSpeed.desktop;
    if (mob?.scores) {
      const perfColor = mob.scores.performance >= 90 ? chalk.green : mob.scores.performance >= 50 ? chalk.yellow : chalk.red;
      console.log(`  PageSpeed Mobile  — Performance: ${perfColor(mob.scores.performance)} | SEO: ${chalk.cyan(mob.scores.seo)}`);
    }
    if (desk?.scores) {
      const perfColor = desk.scores.performance >= 90 ? chalk.green : desk.scores.performance >= 50 ? chalk.yellow : chalk.red;
      console.log(`  PageSpeed Desktop — Performance: ${perfColor(desk.scores.performance)} | SEO: ${chalk.cyan(desk.scores.seo)}`);
    }

    // Core Web Vitals
    spinner.text = `Core Web Vitals: ${page.url}`;
    spinner.start();
    pageResult.coreVitals = await checkCoreVitals(page.url);
    spinner.stop();

    const { metrics } = pageResult.coreVitals;
    if (metrics.LCP) console.log(`  LCP: ${gradeColor(metrics.LCP.grade, metrics.LCP.value + 'ms')} (${metrics.LCP.grade})`);
    if (metrics.CLS) console.log(`  CLS: ${gradeColor(metrics.CLS.grade, metrics.CLS.value)} (${metrics.CLS.grade})`);
    if (metrics.INP) console.log(`  INP: ${gradeColor(metrics.INP.grade, metrics.INP.value + 'ms')} (${metrics.INP.grade})`);

    // Schema markup
    spinner.text = `Schema markup: ${page.url}`;
    spinner.start();
    pageResult.schema = await checkSchemaMarkup(page.url);
    spinner.stop();

    if (pageResult.schema.error) {
      console.log(`  Schema: ${chalk.red('Error — ' + pageResult.schema.error)}`);
    } else {
      const schemaStatus = pageResult.schema.valid ? chalk.green('✔ Valid') : chalk.yellow('⚠ Issues');
      console.log(`  Schema: ${schemaStatus} | Types: ${chalk.cyan(pageResult.schema.schemasFound.join(', ') || 'none')}`);
      if (pageResult.schema.expectedMissing.length > 0) {
        console.log(chalk.red(`  Missing expected schema: ${pageResult.schema.expectedMissing.join(', ')}`));
      }
      if (pageResult.schema.parseErrors.length > 0) {
        console.log(chalk.red(`  JSON-LD parse errors: ${pageResult.schema.parseErrors.join('; ')}`));
      }
    }

    report.pages.push(pageResult);

    // Respect rate limits between pages
    await new Promise(r => setTimeout(r, 2000));
  }

  // ── 3. Summary ───────────────────────────────────────────────────────────────
  const avgMobilePerf = report.pages
    .filter(p => p.pageSpeed?.mobile?.scores)
    .map(p => p.pageSpeed.mobile.scores.performance);

  report.summary = {
    totalPagesAudited: report.pages.length,
    avgMobilePerformance: avgMobilePerf.length
      ? Math.round(avgMobilePerf.reduce((a, b) => a + b, 0) / avgMobilePerf.length)
      : null,
    sitemapHealthy:  report.sitemap.accessible && report.sitemap.allSamples200,
    totalSitemapUrls: report.sitemap.totalUrls,
    pagesWithValidSchema: report.pages.filter(p => p.schema?.valid).length,
    issuesFound: report.pages.flatMap(p => {
      const issues = [];
      if (p.pageSpeed?.mobile?.scores?.performance < 50) issues.push(`${p.label}: low mobile performance`);
      if (p.schema?.expectedMissing?.length > 0) issues.push(`${p.label}: missing schema types`);
      if (p.coreVitals?.metrics?.LCP?.grade === 'poor') issues.push(`${p.label}: poor LCP`);
      if (p.coreVitals?.metrics?.CLS?.grade === 'poor') issues.push(`${p.label}: poor CLS`);
      return issues;
    }),
  };

  // ── 4. Save report ───────────────────────────────────────────────────────────
  await fs.ensureDir(REPORTS_DIR);
  const timestamp  = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = path.join(REPORTS_DIR, `seo-audit-${timestamp}.json`);

  try {
    await fs.writeJson(reportPath, report, { spaces: 2 });
    console.log(chalk.gray(`\nReport saved: ${reportPath}`));
  } catch (err) {
    console.warn(chalk.yellow(`Could not save report: ${err.message}`));
  }

  // ── 5. Final summary print ───────────────────────────────────────────────────
  console.log('\n' + chalk.bold.white('SEO AUDIT COMPLETE'));
  if (report.summary.avgMobilePerformance !== null) {
    const perfColor = report.summary.avgMobilePerformance >= 80 ? chalk.green :
                      report.summary.avgMobilePerformance >= 50 ? chalk.yellow : chalk.red;
    console.log(`  Avg Mobile Performance: ${perfColor(report.summary.avgMobilePerformance)}`);
  }
  console.log(`  Sitemap: ${report.summary.sitemapHealthy ? chalk.green('Healthy') : chalk.red('Issues found')} (${report.summary.totalSitemapUrls} URLs)`);
  console.log(`  Schema valid on ${chalk.cyan(report.summary.pagesWithValidSchema + '/' + report.pages.length)} pages`);

  if (report.summary.issuesFound.length > 0) {
    console.log(chalk.yellow(`\n⚠ Issues found:`));
    report.summary.issuesFound.forEach(i => console.log(chalk.yellow(`  • ${i}`)));
  } else {
    console.log(chalk.green('\n✔ No major SEO issues detected!'));
  }

  console.log('');
  return report;
}

module.exports = {
  checkPageSpeed,
  checkSchemaMarkup,
  checkSitemapHealth,
  checkCoreVitals,
  runFullSEOAudit,
};
