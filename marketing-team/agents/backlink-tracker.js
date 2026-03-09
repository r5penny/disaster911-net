/**
 * backlink-tracker.js
 *
 * Tracks citation directory listing status and generates an outreach priority list
 * for directories where the business is not yet listed.
 *
 * Functions exported:
 *   generateOutreachList()   — Returns sorted array of directories to submit to
 *   runBacklinkAudit()       — Full audit + saves report to reports/
 */

'use strict';

const axios   = require('axios');
const cheerio = require('cheerio');
const chalk   = require('chalk');
const ora     = require('ora');
const path    = require('path');
const fs      = require('fs-extra');
const { BUSINESS } = require('../config');

const DIRS_PATH   = path.join(__dirname, '../data/directories.json');
const REPORTS_DIR = path.join(__dirname, '../reports');

// Terms to search for when checking if business is listed
const LISTING_SIGNALS = [
  'disaster911.net',
  'disaster911',
  BUSINESS.phone,
  BUSINESS.phone.replace(/[()-\s]/g, ''),   // 6168221978
  '3707 Northridge',
  'Disaster Response by Ryan',
];

// Per-directory submission tips and instructions
const SUBMISSION_TIPS = {
  'Google Business Profile': {
    steps: [
      '1. Go to https://business.google.com',
      '2. Sign in with your Google account',
      '3. Click "Manage now" and search for your business',
      '4. If not found, click "Add your business to Google"',
      '5. Complete all sections: hours, services, photos, description',
    ],
    timeEstimate: '20 minutes',
    freeToList: true,
  },
  'Yelp': {
    steps: [
      '1. Go to https://biz.yelp.com/claim',
      '2. Search for your business name and phone',
      '3. If not found, click "Add your business"',
      '4. Verify ownership via phone call or postcard',
      '5. Complete profile with photos and service description',
    ],
    timeEstimate: '30 minutes',
    freeToList: true,
  },
  'Bing Places': {
    steps: [
      '1. Go to https://www.bingplaces.com',
      '2. Click "Get started" and sign in with Microsoft account',
      '3. Import from Google Business Profile (fastest option) OR create new',
      '4. Verify via phone or postcard',
    ],
    timeEstimate: '15 minutes',
    freeToList: true,
  },
  'Apple Maps': {
    steps: [
      '1. Go to https://mapsconnect.apple.com',
      '2. Sign in with Apple ID',
      '3. Click "+" to add a new place',
      '4. Fill in business details and submit for review',
      '5. Apple reviews take 3–5 business days',
    ],
    timeEstimate: '20 minutes',
    freeToList: true,
  },
  'BBB (Better Business Bureau)': {
    steps: [
      '1. Go to https://www.bbb.org/business-profile-application',
      '2. Select your BBB chapter (Grand Rapids area)',
      '3. Submit business info for a free basic listing',
      '4. Consider paid accreditation for the BBB Seal',
    ],
    timeEstimate: '25 minutes',
    freeToList: true,
    paid: 'Accreditation available for additional trust signals',
  },
  'Facebook Business': {
    steps: [
      '1. Go to https://www.facebook.com/pages/create',
      '2. Choose "Local Business or Place"',
      '3. Select category: "Restoration Service"',
      '4. Complete all business info fields',
      '5. Add photos, cover image, and services',
    ],
    timeEstimate: '30 minutes',
    freeToList: true,
  },
  'IICRC Certified Firm Directory': {
    steps: [
      '1. Go to https://www.iicrc.org/page/FindaCertifiedFirmCompany',
      '2. Verify your firm certification is current',
      '3. Contact IICRC at custserv@iicrc.org to ensure listing is active',
      '4. Renew certification annually to stay listed',
    ],
    timeEstimate: '15 minutes',
    freeToList: true,
    requirement: 'Must maintain active IICRC Certified Firm status',
  },
  'Angi (formerly Angie\'s List)': {
    steps: [
      '1. Go to https://pro.angi.com',
      '2. Sign up as a pro service provider',
      '3. Select "Water/Fire/Mold Restoration" categories',
      '4. Set your service area to Grand Rapids metro',
      '5. Upload license, insurance, and IICRC certification',
    ],
    timeEstimate: '45 minutes',
    freeToList: false,
    paid: 'Subscription + pay-per-lead model',
  },
  'HomeAdvisor': {
    steps: [
      '1. Go to https://pro.homeadvisor.com',
      '2. Register as a service professional',
      '3. Verify credentials and insurance',
      '4. Set budget for lead generation',
    ],
    timeEstimate: '30 minutes',
    freeToList: false,
    paid: 'Pay-per-lead model; background check required',
  },
  'Thumbtack': {
    steps: [
      '1. Go to https://www.thumbtack.com/pro',
      '2. Create a business profile',
      '3. Select your services and service area',
      '4. Set your budget — you pay to respond to leads',
    ],
    timeEstimate: '30 minutes',
    freeToList: true,
    paid: 'Pay to respond to leads',
  },
  'Nextdoor Business': {
    steps: [
      '1. Go to https://business.nextdoor.com',
      '2. Create a free Business Page',
      '3. Verify your business address',
      '4. Post to neighborhoods in your service area',
    ],
    timeEstimate: '20 minutes',
    freeToList: true,
  },
  'Yellow Pages': {
    steps: [
      '1. Go to https://www.yellowpages.com/free-listing',
      '2. Search for existing listing first',
      '3. Create or claim your listing',
      '4. Add description, photos, and services',
    ],
    timeEstimate: '20 minutes',
    freeToList: true,
  },
  'Houzz': {
    steps: [
      '1. Go to https://www.houzz.com/for-professionals/overview',
      '2. Create a Pro account',
      '3. Choose "Water Damage Restoration" category',
      '4. Add project photos and business description',
    ],
    timeEstimate: '40 minutes',
    freeToList: true,
  },
  'Manta': {
    steps: [
      '1. Go to https://www.manta.com/claim',
      '2. Search for existing listing',
      '3. Claim or create listing',
      '4. Complete all profile fields',
    ],
    timeEstimate: '15 minutes',
    freeToList: true,
  },
  'Foursquare': {
    steps: [
      '1. Go to https://business.foursquare.com',
      '2. Add or claim your business',
      '3. Verify via phone or email',
    ],
    timeEstimate: '15 minutes',
    freeToList: true,
  },
  'Citysearch': {
    steps: [
      '1. Visit http://www.citysearch.com',
      '2. Search for your business',
      '3. Add or update your listing',
    ],
    timeEstimate: '10 minutes',
    freeToList: true,
  },
};

// Priority order for outreach (high before medium before low)
const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

/**
 * checkDirectoryForListing
 * Fetches a directory's check URL and looks for signals that the business is listed.
 * Returns { listed: bool, signalsFound: string[], error: string|null }
 */
async function checkDirectoryForListing(directory) {
  const result = {
    listed:       false,
    signalsFound: [],
    httpStatus:   null,
    reachable:    false,
    error:        null,
  };

  try {
    const response = await axios.get(directory.checkUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
          '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,*/*;q=0.8',
      },
      timeout: 15000,
      maxRedirects: 5,
      validateStatus: () => true,
    });

    result.httpStatus = response.status;
    result.reachable  = response.status < 500;

    if (!result.reachable) return result;

    const html      = typeof response.data === 'string' ? response.data : String(response.data);
    const lowerHtml = html.toLowerCase();

    for (const signal of LISTING_SIGNALS) {
      if (lowerHtml.includes(signal.toLowerCase())) {
        result.signalsFound.push(signal);
      }
    }

    // Consider "listed" if at least 2 signals found (reduces false positives)
    result.listed = result.signalsFound.length >= 2;

  } catch (err) {
    result.error = err.message;
  }

  return result;
}

/**
 * generateOutreachList
 * Loads directories.json, loads last audit if available, and returns
 * a sorted array of un-listed directories with submission instructions.
 *
 * Returns: Array of { name, url, submitUrl, priority, tips, ... }
 */
async function generateOutreachList() {
  let directories;
  try {
    directories = await fs.readJson(DIRS_PATH);
  } catch (err) {
    throw new Error(`Could not load directories.json: ${err.message}`);
  }

  // Filter to directories that are either confirmed not listed or unchecked
  const needsOutreach = directories
    .filter(d => !d.listed || d.napStatus === 'unchecked' || d.napStatus === 'missing')
    .sort((a, b) => (PRIORITY_ORDER[a.priority] || 2) - (PRIORITY_ORDER[b.priority] || 2));

  const outreachList = needsOutreach.map(dir => ({
    name:        dir.name,
    url:         dir.url,
    submitUrl:   dir.submitUrl || dir.url,
    priority:    dir.priority,
    napStatus:   dir.napStatus,
    tips:        SUBMISSION_TIPS[dir.name] || { steps: ['Visit the directory website and add/claim your listing'], timeEstimate: 'Variable', freeToList: null },
    notes:       dir.notes || '',
  }));

  return outreachList;
}

/**
 * runBacklinkAudit
 * Audits all high-priority directories to check for listing signals.
 * Updates the directories.json in memory for the report.
 * Saves a detailed report to reports/.
 */
async function runBacklinkAudit() {
  console.log(chalk.bold.cyan('\n🔗 Starting Backlink / Directory Audit...\n'));

  let directories;
  try {
    directories = await fs.readJson(DIRS_PATH);
  } catch (err) {
    console.error(chalk.red(`Failed to load directories.json: ${err.message}`));
    throw err;
  }

  const spinner = ora({ text: '', color: 'cyan' });
  const results = [];

  // Only actively check high-priority directories (to save time)
  const toCheck     = directories.filter(d => d.priority === 'high');
  const skipCheck   = directories.filter(d => d.priority !== 'high');

  console.log(chalk.gray(`Checking ${toCheck.length} high-priority directories...`));
  console.log(chalk.gray(`Skipping live check for ${skipCheck.length} medium/low priority (use citation auditor for full check)\n`));

  for (let i = 0; i < toCheck.length; i++) {
    const dir = toCheck[i];
    spinner.text = `Checking ${i + 1}/${toCheck.length}: ${dir.name}`;
    spinner.start();

    const checkResult = await checkDirectoryForListing(dir);
    spinner.stop();

    const statusSymbol = checkResult.listed      ? chalk.green('✔ Listed') :
                         !checkResult.reachable   ? chalk.magenta('? Unreachable') :
                         checkResult.error        ? chalk.gray('! Error') :
                                                    chalk.red('✘ Not Found');

    console.log(`  ${dir.name.padEnd(35)} ${statusSymbol}`);
    if (checkResult.signalsFound.length > 0) {
      console.log(chalk.gray(`    Signals: ${checkResult.signalsFound.slice(0, 3).join(', ')}`));
    }

    results.push({
      name:         dir.name,
      url:          dir.url,
      checkUrl:     dir.checkUrl,
      submitUrl:    dir.submitUrl || dir.url,
      priority:     dir.priority,
      listed:       checkResult.listed,
      signalsFound: checkResult.signalsFound,
      reachable:    checkResult.reachable,
      httpStatus:   checkResult.httpStatus,
      error:        checkResult.error,
    });

    await new Promise(r => setTimeout(r, 1000));
  }

  // Add skipped directories to results (status: unchecked)
  for (const dir of skipCheck) {
    results.push({
      name:      dir.name,
      url:       dir.url,
      submitUrl: dir.submitUrl || dir.url,
      priority:  dir.priority,
      listed:    dir.listed,
      checked:   false,
      note:      'Not checked (medium/low priority — run citation audit for full check)',
    });
  }

  // ── Outreach priority list ─────────────────────────────────────────────────
  const outreachNeeded = results
    .filter(r => !r.listed)
    .sort((a, b) => (PRIORITY_ORDER[a.priority] || 2) - (PRIORITY_ORDER[b.priority] || 2));

  // ── Summary ────────────────────────────────────────────────────────────────
  const listed      = results.filter(r => r.listed).length;
  const notListed   = results.filter(r => !r.listed && r.checked !== false).length;
  const unchecked   = results.filter(r => r.checked === false).length;
  const highPrioMissing = results.filter(r => r.priority === 'high' && !r.listed).length;

  const report = {
    type:      'backlink-audit',
    timestamp: new Date().toISOString(),
    business:  BUSINESS.name,
    summary: {
      totalDirectories:  results.length,
      listed,
      notListed,
      unchecked,
      highPriorityMissing: highPrioMissing,
    },
    results,
    outreachPriorityList: outreachNeeded.map(r => ({
      name:      r.name,
      priority:  r.priority,
      submitUrl: r.submitUrl,
      tips:      SUBMISSION_TIPS[r.name] || null,
    })),
  };

  // ── Save report ────────────────────────────────────────────────────────────
  await fs.ensureDir(REPORTS_DIR);
  const timestamp  = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = path.join(REPORTS_DIR, `backlink-audit-${timestamp}.json`);

  try {
    await fs.writeJson(reportPath, report, { spaces: 2 });
    console.log(chalk.gray(`\nReport saved: ${reportPath}`));
  } catch (err) {
    console.warn(chalk.yellow(`Could not save report: ${err.message}`));
  }

  // ── Print summary ──────────────────────────────────────────────────────────
  console.log('\n' + chalk.bold.white('BACKLINK AUDIT SUMMARY'));
  console.log(`  Listed:     ${chalk.green(listed)} directories`);
  console.log(`  Not Found:  ${chalk.red(notListed)} directories`);
  console.log(`  Unchecked:  ${chalk.gray(unchecked)} directories (medium/low priority)`);

  if (highPrioMissing > 0) {
    console.log(chalk.red.bold(`\n⚠ ${highPrioMissing} HIGH-PRIORITY directories need listings:`));
    outreachNeeded
      .filter(r => r.priority === 'high')
      .forEach(r => console.log(chalk.red(`  • ${r.name}`)));
  }

  if (outreachNeeded.length > 0) {
    console.log(chalk.bold.yellow(`\nOutreach Priority Order:`));
    outreachNeeded.slice(0, 8).forEach((r, i) => {
      const priorityColor = r.priority === 'high' ? chalk.red : r.priority === 'medium' ? chalk.yellow : chalk.gray;
      console.log(`  ${i + 1}. ${r.name} ${priorityColor('[' + r.priority + ']')}`);
    });
  }

  console.log('');
  return report;
}

module.exports = {
  generateOutreachList,
  runBacklinkAudit,
};
