/**
 * citation-auditor.js
 *
 * Audits NAP (Name, Address, Phone) consistency across all citation directories
 * listed in data/directories.json. Uses axios for HTTP requests and cheerio for
 * HTML parsing. Generates a color-coded console report and saves JSON results.
 *
 * Usage:
 *   const { runCitationAudit } = require('./agents/citation-auditor');
 *   await runCitationAudit();
 */

'use strict';

const axios    = require('axios');
const cheerio  = require('cheerio');
const chalk    = require('chalk');
const ora      = require('ora');
const path     = require('path');
const fs       = require('fs-extra');
const { BUSINESS } = require('../config');

// Paths
const DIRS_PATH    = path.join(__dirname, '../data/directories.json');
const REPORTS_DIR  = path.join(__dirname, '../reports');

// NAP fragments to search for in page HTML
// We use partial matches to account for formatting differences across sites.
const NAP_TARGETS = {
  name:    ['Disaster Response by Ryan'],
  phone:   ['(616) 822-1978', '616-822-1978', '6168221978', '616.822.1978'],
  address: ['3707 Northridge', 'Northridge Dr NW'],
};

// HTTP headers to mimic a real browser and avoid bot-blocks
const REQUEST_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
    '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
};

/**
 * searchHtmlForField
 * Searches the raw HTML string for any of the given patterns (case-insensitive).
 * Returns { found: bool, matchedPattern: string|null }
 */
function searchHtmlForField(html, patterns) {
  const lowerHtml = html.toLowerCase();
  for (const pattern of patterns) {
    if (lowerHtml.includes(pattern.toLowerCase())) {
      return { found: true, matchedPattern: pattern };
    }
  }
  return { found: false, matchedPattern: null };
}

/**
 * auditDirectory
 * Fetches the checkUrl for a single directory entry and checks for NAP presence.
 * Returns a result object with found/missing status for each NAP field.
 */
async function auditDirectory(directory) {
  const result = {
    name:      directory.name,
    checkUrl:  directory.checkUrl,
    priority:  directory.priority,
    timestamp: new Date().toISOString(),
    reachable: false,
    httpStatus: null,
    nap: {
      name:    { found: false, matchedPattern: null },
      phone:   { found: false, matchedPattern: null },
      address: { found: false, matchedPattern: null },
    },
    napScore:  0,   // 0–3 fields found
    status:    'error', // 'correct' | 'partial' | 'missing' | 'unreachable' | 'error'
    error:     null,
  };

  try {
    const response = await axios.get(directory.checkUrl, {
      headers: REQUEST_HEADERS,
      timeout: 15000,
      maxRedirects: 5,
      // Don't throw on 4xx/5xx — we still want to read the HTML
      validateStatus: () => true,
    });

    result.httpStatus = response.status;
    result.reachable  = response.status < 500;

    if (!result.reachable) {
      result.status = 'unreachable';
      return result;
    }

    const html = typeof response.data === 'string'
      ? response.data
      : JSON.stringify(response.data);

    // Check each NAP field
    result.nap.name    = searchHtmlForField(html, NAP_TARGETS.name);
    result.nap.phone   = searchHtmlForField(html, NAP_TARGETS.phone);
    result.nap.address = searchHtmlForField(html, NAP_TARGETS.address);

    const foundCount = [result.nap.name, result.nap.phone, result.nap.address]
      .filter(f => f.found).length;

    result.napScore = foundCount;

    if (foundCount === 3) {
      result.status = 'correct';
    } else if (foundCount > 0) {
      result.status = 'partial';
    } else {
      result.status = 'missing';
    }

  } catch (err) {
    result.status = 'error';
    result.error  = err.message;
  }

  return result;
}

/**
 * printConsoleTable
 * Prints a color-coded summary table to the console.
 * Green = all NAP fields found, Yellow = partial, Red = missing/unreachable/error.
 */
function printConsoleTable(results) {
  console.log('\n' + chalk.bold.white('═'.repeat(80)));
  console.log(chalk.bold.white('  CITATION AUDIT RESULTS'));
  console.log(chalk.bold.white('═'.repeat(80)));

  const colW = { name: 30, status: 14, name_: 7, phone: 7, addr: 7, priority: 8 };

  // Header row
  console.log(
    chalk.bold.gray(
      'Directory'.padEnd(colW.name) +
      'Status'.padEnd(colW.status) +
      'Name'.padEnd(colW.name_) +
      'Phone'.padEnd(colW.phone) +
      'Addr'.padEnd(colW.addr) +
      'Priority'
    )
  );
  console.log(chalk.gray('─'.repeat(80)));

  for (const r of results) {
    // Pick row color based on status
    let statusStr;
    let rowColor;
    switch (r.status) {
      case 'correct':
        statusStr = chalk.green('✔ Correct');
        rowColor  = chalk.green;
        break;
      case 'partial':
        statusStr = chalk.yellow('⚠ Partial');
        rowColor  = chalk.yellow;
        break;
      case 'missing':
        statusStr = chalk.red('✘ Missing');
        rowColor  = chalk.red;
        break;
      case 'unreachable':
        statusStr = chalk.magenta('? Unreachable');
        rowColor  = chalk.magenta;
        break;
      default:
        statusStr = chalk.gray('! Error');
        rowColor  = chalk.gray;
    }

    const nameFound  = r.nap.name.found    ? chalk.green('✔') : chalk.red('✘');
    const phoneFound = r.nap.phone.found   ? chalk.green('✔') : chalk.red('✘');
    const addrFound  = r.nap.address.found ? chalk.green('✔') : chalk.red('✘');

    const priorityColor = r.priority === 'high'   ? chalk.red :
                          r.priority === 'medium' ? chalk.yellow : chalk.gray;

    console.log(
      rowColor(r.name.slice(0, 29).padEnd(colW.name)) +
      statusStr.padEnd(colW.status + 10) + // +10 for ANSI codes
      nameFound + '      ' +
      phoneFound + '      ' +
      addrFound + '      ' +
      priorityColor(r.priority || '')
    );
  }
  console.log(chalk.gray('─'.repeat(80)));
}

/**
 * runCitationAudit
 * Main entry point. Loads directories, audits each one, generates report,
 * saves JSON to reports/, and prints results to console.
 */
async function runCitationAudit() {
  console.log(chalk.bold.cyan('\n📋 Starting Citation NAP Audit...\n'));

  // Load directories list
  let directories;
  try {
    directories = await fs.readJson(DIRS_PATH);
  } catch (err) {
    console.error(chalk.red(`Failed to load directories.json: ${err.message}`));
    throw err;
  }

  const results   = [];
  const spinner   = ora({ text: '', color: 'cyan' });

  for (let i = 0; i < directories.length; i++) {
    const dir = directories[i];
    spinner.text = `Auditing ${i + 1}/${directories.length}: ${dir.name}`;
    spinner.start();

    const result = await auditDirectory(dir);
    results.push(result);

    // Brief delay to be respectful to target servers and avoid rate-limiting
    await new Promise(r => setTimeout(r, 1200));

    spinner.stop();
  }

  // ── Compile summary statistics ──────────────────────────────────────────────
  const correct     = results.filter(r => r.status === 'correct').length;
  const partial     = results.filter(r => r.status === 'partial').length;
  const missing     = results.filter(r => r.status === 'missing').length;
  const unreachable = results.filter(r => r.status === 'unreachable').length;
  const errors      = results.filter(r => r.status === 'error').length;
  const total       = results.length;

  // Score: directories with correct NAP as % of reachable directories
  const reachable   = total - unreachable - errors;
  const overallScore = reachable > 0
    ? Math.round((correct / reachable) * 100)
    : 0;

  // ── High-priority directories with issues ──────────────────────────────────
  const highPriorityIssues = results.filter(
    r => r.priority === 'high' && r.status !== 'correct'
  );

  // ── Build report object ────────────────────────────────────────────────────
  const report = {
    type:       'citation-audit',
    timestamp:  new Date().toISOString(),
    business:   BUSINESS.name,
    summary: {
      total,
      correct,
      partial,
      missing,
      unreachable,
      errors,
      overallScore: `${overallScore}%`,
      highPriorityIssues: highPriorityIssues.length,
    },
    results,
    actionItems: highPriorityIssues.map(r => ({
      directory: r.name,
      status:    r.status,
      checkUrl:  r.checkUrl,
      action:    r.status === 'missing'
        ? 'Create or claim listing and ensure NAP matches exactly'
        : 'Update listing to ensure all 3 NAP fields match exactly',
    })),
  };

  // ── Save report ────────────────────────────────────────────────────────────
  await fs.ensureDir(REPORTS_DIR);
  const timestamp  = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = path.join(REPORTS_DIR, `citation-audit-${timestamp}.json`);

  try {
    await fs.writeJson(reportPath, report, { spaces: 2 });
    console.log(chalk.gray(`\nReport saved: ${reportPath}`));
  } catch (err) {
    console.error(chalk.yellow(`Warning: could not save report — ${err.message}`));
  }

  // ── Print table ────────────────────────────────────────────────────────────
  printConsoleTable(results);

  // ── Print summary ──────────────────────────────────────────────────────────
  console.log('\n' + chalk.bold.white('SUMMARY'));
  console.log(
    `  Overall NAP Score: ${overallScore >= 80 ? chalk.green(overallScore + '%') : overallScore >= 50 ? chalk.yellow(overallScore + '%') : chalk.red(overallScore + '%')}`
  );
  console.log(`  Correct: ${chalk.green(correct)}  Partial: ${chalk.yellow(partial)}  Missing: ${chalk.red(missing)}  Unreachable: ${chalk.magenta(unreachable)}`);

  if (highPriorityIssues.length > 0) {
    console.log(chalk.red.bold(`\n⚠  ${highPriorityIssues.length} HIGH-PRIORITY directories need attention:`));
    highPriorityIssues.forEach(r => {
      console.log(chalk.red(`   • ${r.name} — ${r.status}`));
    });
  } else {
    console.log(chalk.green('\n✔ All high-priority directories look good!'));
  }

  console.log('');
  return report;
}

module.exports = { runCitationAudit };
