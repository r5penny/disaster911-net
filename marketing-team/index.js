/**
 * index.js — Disaster911 Marketing Team Agent Dashboard
 *
 * Master orchestrator / CLI for all marketing automation agents.
 *
 * Usage:
 *   node index.js            — Interactive menu
 *   node index.js audit      — Run full audit (citations + SEO + backlinks + reviews)
 *   node index.js gbp        — GBP management submenu
 *   node index.js citations  — Citation NAP audit only
 *   node index.js seo        — SEO health check only
 *   node index.js generate   — Content generation submenu
 *   node index.js full       — Full marketing audit (same as audit)
 *   node index.js schedule   — Start scheduled cron jobs
 */

'use strict';

const readline = require('readline');
const path     = require('path');
const fs       = require('fs-extra');
const chalk    = require('chalk');
const ora      = require('ora');

// ── Banner ───────────────────────────────────────────────────────────────────

function printBanner() {
  console.log('\n' + chalk.bold.cyan('╔══════════════════════════════════════════════════════════╗'));
  console.log(chalk.bold.cyan('║') + chalk.bold.white('    DISASTER911 MARKETING TEAM — Agent Dashboard          ') + chalk.bold.cyan('║'));
  console.log(chalk.bold.cyan('║') + chalk.gray('    disaster911.net  |  (616) 822-1978  |  Walker, MI      ') + chalk.bold.cyan('║'));
  console.log(chalk.bold.cyan('╚══════════════════════════════════════════════════════════╝'));
  console.log(chalk.gray(`    ${new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}\n`));
}

// ── Agent lazy-loaders ────────────────────────────────────────────────────────
// Load agents on demand to avoid crashing the CLI if one module has an issue.

function loadAgent(name) {
  try {
    return require(`./agents/${name}`);
  } catch (err) {
    console.error(chalk.red(`Failed to load agent "${name}": ${err.message}`));
    return null;
  }
}

// ── Readline helper ───────────────────────────────────────────────────────────

function createRL() {
  return readline.createInterface({
    input:  process.stdin,
    output: process.stdout,
  });
}

function question(rl, prompt) {
  return new Promise(resolve => rl.question(prompt, resolve));
}

// ── Report viewer ─────────────────────────────────────────────────────────────

async function viewLastReport() {
  const reportsDir = path.join(__dirname, 'reports');
  try {
    const files = await fs.readdir(reportsDir);
    const jsonFiles = files
      .filter(f => f.endsWith('.json') && f !== '.gitkeep')
      .map(f => ({ name: f, mtime: fs.statSync(path.join(reportsDir, f)).mtime }))
      .sort((a, b) => b.mtime - a.mtime);

    if (jsonFiles.length === 0) {
      console.log(chalk.yellow('No reports found yet. Run an audit first.'));
      return;
    }

    console.log(chalk.bold('\nRecent Reports:'));
    jsonFiles.slice(0, 5).forEach((f, i) => {
      const age = Math.round((Date.now() - f.mtime) / 60000);
      const ageStr = age < 60 ? `${age}m ago` : `${Math.round(age / 60)}h ago`;
      console.log(`  ${i + 1}. ${chalk.cyan(f.name)} ${chalk.gray('(' + ageStr + ')')}`);
    });

    const rl     = createRL();
    const choice = await question(rl, chalk.white('\nEnter report number to view (or Enter to skip): '));
    rl.close();

    const idx = parseInt(choice, 10) - 1;
    if (isNaN(idx) || idx < 0 || idx >= Math.min(jsonFiles.length, 5)) return;

    const reportPath = path.join(reportsDir, jsonFiles[idx].name);
    const data       = await fs.readJson(reportPath);

    console.log(chalk.bold.cyan(`\n── Report: ${jsonFiles[idx].name} ──`));
    console.log(JSON.stringify(data.summary || data, null, 2));
  } catch (err) {
    console.error(chalk.red(`Error reading reports: ${err.message}`));
  }
}

// ── Individual agent runners ──────────────────────────────────────────────────

async function runFullAudit() {
  console.log(chalk.bold.cyan('\n═══ FULL MARKETING AUDIT ═══\n'));

  // 1. Citation audit
  const citAgent = loadAgent('citation-auditor');
  if (citAgent) {
    try { await citAgent.runCitationAudit(); }
    catch (e) { console.error(chalk.red(`Citation audit error: ${e.message}`)); }
  }

  // 2. SEO audit
  const seoAgent = loadAgent('seo-monitor');
  if (seoAgent) {
    try { await seoAgent.runFullSEOAudit(); }
    catch (e) { console.error(chalk.red(`SEO audit error: ${e.message}`)); }
  }

  // 3. Backlink audit
  const blAgent = loadAgent('backlink-tracker');
  if (blAgent) {
    try { await blAgent.runBacklinkAudit(); }
    catch (e) { console.error(chalk.red(`Backlink audit error: ${e.message}`)); }
  }

  // 4. Review check
  const rvAgent = loadAgent('review-responder');
  if (rvAgent) {
    try {
      const pending = await rvAgent.checkForNewReviews();
      if (pending.length > 0) {
        console.log(chalk.yellow(`\n${pending.length} reviews awaiting reply — run option 6 to draft responses`));
      }
      await rvAgent.flagNegativeReviews();
    } catch (e) { console.error(chalk.red(`Review check error: ${e.message}`)); }
  }

  console.log(chalk.bold.green('\n✔ Full Marketing Audit Complete!\n'));
}

async function runGBPSubmenu() {
  const gbp  = loadAgent('gbp-manager');
  const gen  = loadAgent('content-generator');
  if (!gbp && !gen) { console.log(chalk.red('GBP/Content agents not available')); return; }

  const rl = createRL();

  console.log(chalk.bold.cyan('\n═══ GBP MANAGEMENT ═══'));
  console.log('  1. Fetch location info');
  console.log('  2. Generate & publish a post');
  console.log('  3. View recent posts (last 10)');
  console.log('  4. Fetch insights');
  console.log('  0. Back');

  const choice = await question(rl, chalk.white('\nChoice: '));
  rl.close();

  switch (choice.trim()) {
    case '1':
      if (gbp) { try { const info = await gbp.getLocationInfo(); console.log(JSON.stringify(info, null, 2)); } catch(e){console.error(chalk.red(e.message));} }
      break;
    case '2':
      await generateAndPublishPost(gbp, gen);
      break;
    case '3':
      if (gbp) { try { const posts = await gbp.getRecentPosts(); console.log(JSON.stringify(posts, null, 2)); } catch(e){console.error(chalk.red(e.message));} }
      break;
    case '4':
      if (gbp) { try { const ins = await gbp.getInsights(); console.log(JSON.stringify(ins, null, 2)); } catch(e){console.error(chalk.red(e.message));} }
      break;
    default:
      break;
  }
}

async function generateAndPublishPost(gbp, gen) {
  const POST_TYPES = ['water_damage', 'fire_damage', 'mold', 'sewage', 'tip', 'testimonial', 'seasonal'];

  console.log(chalk.bold('\nSelect post type:'));
  POST_TYPES.forEach((t, i) => console.log(`  ${i + 1}. ${t.replace(/_/g, ' ')}`));

  const rl    = createRL();
  const typeChoice = await question(rl, chalk.white('\nPost type (1-7): '));
  const idx   = parseInt(typeChoice, 10) - 1;

  if (isNaN(idx) || idx < 0 || idx >= POST_TYPES.length) {
    console.log(chalk.yellow('Invalid choice.'));
    rl.close();
    return;
  }

  const postType = POST_TYPES[idx];

  if (!gen) {
    console.log(chalk.red('Content generator not available — cannot generate post.'));
    rl.close();
    return;
  }

  const spinner = ora('Generating post with Claude AI...').start();
  let postData;
  try {
    postData = await gen.generateGBPPost(postType);
    spinner.succeed('Post generated!');
  } catch (err) {
    spinner.fail(`Generation failed: ${err.message}`);
    rl.close();
    return;
  }

  // Show preview
  console.log(chalk.bold('\nPost Preview:'));
  console.log(chalk.white('─'.repeat(60)));
  console.log(chalk.bold('Title: ') + (postData.title || '(none)'));
  console.log(chalk.bold('Body:\n') + postData.summary);
  if (postData.callToAction) console.log(chalk.bold('CTA: ') + postData.callToAction + ' → ' + postData.callToActionUrl);
  console.log(chalk.white('─'.repeat(60)));

  const confirm = await question(rl, chalk.yellow('\nPublish this post to GBP? (y/N): '));
  rl.close();

  if (confirm.toLowerCase() !== 'y') {
    console.log(chalk.gray('Post not published.'));
    return;
  }

  if (!gbp) {
    console.log(chalk.red('GBP manager not available — cannot publish.'));
    return;
  }

  const pubSpinner = ora('Publishing to Google Business Profile...').start();
  try {
    await gbp.publishPost({
      summary:      postData.summary,
      topicType:    'STANDARD',
      callToAction: postData.callToActionUrl
        ? { actionType: 'LEARN_MORE', url: postData.callToActionUrl }
        : undefined,
    });
    pubSpinner.succeed('Post published to GBP!');
  } catch (err) {
    pubSpinner.fail(`Publish failed: ${err.message}`);
  }
}

async function runContentGenSubmenu() {
  const gen = loadAgent('content-generator');
  if (!gen) { console.log(chalk.red('Content generator not available')); return; }

  const rl = createRL();

  console.log(chalk.bold.cyan('\n═══ CONTENT GENERATION ═══'));
  console.log('  1. Generate GBP post');
  console.log('  2. Generate review reply');
  console.log('  3. Generate outreach email');
  console.log('  4. Generate FAQ answer');
  console.log('  0. Back');

  const choice = await question(rl, chalk.white('\nChoice: '));

  switch (choice.trim()) {
    case '1': {
      const types  = ['water_damage', 'fire_damage', 'mold', 'sewage', 'tip', 'testimonial', 'seasonal'];
      types.forEach((t, i) => console.log(`  ${i + 1}. ${t}`));
      const tc = await question(rl, 'Type (1-7): ');
      const ti = parseInt(tc, 10) - 1;
      if (!isNaN(ti) && ti >= 0 && ti < types.length) {
        try {
          const post = await gen.generateGBPPost(types[ti]);
          console.log(chalk.bold('\nGenerated Post:'));
          console.log(JSON.stringify(post, null, 2));
        } catch (e) { console.error(chalk.red(e.message)); }
      }
      break;
    }
    case '2': {
      const reviewText = await question(rl, 'Review text: ');
      const ratingStr  = await question(rl, 'Star rating (1-5): ');
      const rating     = parseInt(ratingStr, 10);
      try {
        const reply = await gen.generateReviewReply(reviewText, rating);
        console.log(chalk.bold('\nGenerated Reply:'));
        console.log(chalk.white(reply));
      } catch (e) { console.error(chalk.red(e.message)); }
      break;
    }
    case '3': {
      const dirName = await question(rl, 'Directory name (e.g. "Yelp"): ');
      try {
        const email = await gen.generateBacklinkOutreachEmail({ name: dirName, url: '', listed: false });
        console.log(chalk.bold('\nSubject:'), email.subject);
        console.log(chalk.bold('\nBody:\n') + email.body);
      } catch (e) { console.error(chalk.red(e.message)); }
      break;
    }
    case '4': {
      const q = await question(rl, 'Question: ');
      try {
        const answer = await gen.generateFAQAnswer(q);
        console.log(chalk.bold('\nAnswer:'));
        console.log(chalk.white(answer));
      } catch (e) { console.error(chalk.red(e.message)); }
      break;
    }
    default:
      break;
  }

  rl.close();
}

async function runReviewSubmenu() {
  const rvAgent = loadAgent('review-responder');
  if (!rvAgent) { console.log(chalk.red('Review responder not available')); return; }

  console.log(chalk.bold.cyan('\n═══ REVIEW MANAGEMENT ═══'));

  try {
    // Check pending reviews
    const pending = await rvAgent.checkForNewReviews();

    if (pending.length === 0) {
      console.log(chalk.green('✔ No pending reviews!'));
    } else {
      console.log(chalk.yellow(`\n${pending.length} review(s) need a reply:`));

      const rl = createRL();

      for (const review of pending) {
        const rating   = review.starRating;
        const reviewer = review.reviewer?.displayName || 'Anonymous';
        const text     = review.comment || '(no comment)';

        console.log(chalk.bold(`\n${rating}⭐ — ${reviewer}`));
        console.log(chalk.gray(`"${text.slice(0, 200)}"`));

        const draft = await question(rl, chalk.white('Draft a reply for this review? (y/N): '));
        if (draft.toLowerCase() === 'y') {
          try {
            const result = await rvAgent.autoRespondToReview(review);
            // Ask if they want to approve and post immediately
            const gbpManager = loadAgent('gbp-manager');
            if (gbpManager && result.draft) {
              const post = await question(rl, chalk.yellow('Post this reply now? (y/N): '));
              if (post.toLowerCase() === 'y') {
                await gbpManager.replyToReview(result.reviewId, result.draft);
                console.log(chalk.green('✔ Reply posted!'));
              }
            }
          } catch (e) {
            console.error(chalk.red(`Draft failed: ${e.message}`));
          }
        }
      }

      rl.close();
    }

    // Flag negatives
    await rvAgent.flagNegativeReviews();

  } catch (err) {
    console.error(chalk.red(`Review submenu error: ${err.message}`));
  }
}

// ── Scheduled tasks ───────────────────────────────────────────────────────────

async function startScheduler() {
  let cron;
  try {
    cron = require('node-cron');
  } catch (err) {
    console.error(chalk.red('node-cron not installed. Run: npm install'));
    return;
  }

  console.log(chalk.bold.cyan('\n═══ STARTING SCHEDULED MARKETING TASKS ═══\n'));

  // Citation audit — every Monday at 8:00 AM
  cron.schedule('0 8 * * 1', async () => {
    console.log(chalk.cyan(`[${new Date().toLocaleTimeString()}] Running scheduled citation audit...`));
    const agent = loadAgent('citation-auditor');
    if (agent) {
      try { await agent.runCitationAudit(); }
      catch (e) { console.error(chalk.red(`Scheduled citation audit failed: ${e.message}`)); }
    }
  }, { timezone: 'America/Detroit' });
  console.log(chalk.green('✔ Citation audit scheduled: Mondays at 8:00 AM ET'));

  // SEO audit — every Wednesday at 8:00 AM
  cron.schedule('0 8 * * 3', async () => {
    console.log(chalk.cyan(`[${new Date().toLocaleTimeString()}] Running scheduled SEO audit...`));
    const agent = loadAgent('seo-monitor');
    if (agent) {
      try { await agent.runFullSEOAudit(); }
      catch (e) { console.error(chalk.red(`Scheduled SEO audit failed: ${e.message}`)); }
    }
  }, { timezone: 'America/Detroit' });
  console.log(chalk.green('✔ SEO audit scheduled: Wednesdays at 8:00 AM ET'));

  // GBP post — every Friday at 9:00 AM
  cron.schedule('0 9 * * 5', async () => {
    console.log(chalk.cyan(`[${new Date().toLocaleTimeString()}] Running scheduled GBP post...`));
    const gen = loadAgent('content-generator');
    const gbp = loadAgent('gbp-manager');
    if (gen && gbp) {
      try {
        // Rotate through seasonal/tip/service types
        const types = ['seasonal', 'tip', 'water_damage', 'fire_damage', 'mold', 'sewage', 'testimonial'];
        const typeIdx = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000)) % types.length;
        const postData = await gen.generateGBPPost(types[typeIdx]);
        await gbp.publishPost({
          summary:      postData.summary,
          topicType:    'STANDARD',
          callToAction: postData.callToActionUrl
            ? { actionType: 'LEARN_MORE', url: postData.callToActionUrl }
            : undefined,
        });
        console.log(chalk.green(`Scheduled GBP post published: ${types[typeIdx]}`));
      } catch (e) {
        console.error(chalk.red(`Scheduled GBP post failed: ${e.message}`));
      }
    }
  }, { timezone: 'America/Detroit' });
  console.log(chalk.green('✔ GBP post scheduled: Fridays at 9:00 AM ET'));

  // Review check — daily at 7:00 AM
  cron.schedule('0 7 * * *', async () => {
    console.log(chalk.cyan(`[${new Date().toLocaleTimeString()}] Running scheduled review check...`));
    const agent = loadAgent('review-responder');
    if (agent) {
      try {
        const pending = await agent.checkForNewReviews();
        if (pending.length > 0) {
          console.log(chalk.yellow(`${pending.length} reviews need replies — check the dashboard`));
          await agent.flagNegativeReviews();
        }
      } catch (e) {
        console.error(chalk.red(`Scheduled review check failed: ${e.message}`));
      }
    }
  }, { timezone: 'America/Detroit' });
  console.log(chalk.green('✔ Review check scheduled: Daily at 7:00 AM ET'));

  console.log(chalk.bold.white('\nScheduler running. Press Ctrl+C to stop.\n'));
  console.log(chalk.gray('Tip: Use PM2 to keep this running as a background service.'));
  console.log(chalk.gray('     pm2 start index.js --name disaster911-marketing -- schedule\n'));

  // Keep process alive
  process.stdin.resume();
}

// ── Interactive menu ──────────────────────────────────────────────────────────

async function showInteractiveMenu() {
  const rl = createRL();

  // Handle Ctrl+C gracefully
  rl.on('SIGINT', () => {
    console.log(chalk.gray('\nExiting...'));
    rl.close();
    process.exit(0);
  });

  let running = true;

  while (running) {
    console.log(chalk.bold.white('\n─────────────────────────────────────────────────────────'));
    console.log(chalk.bold('  MAIN MENU'));
    console.log(chalk.bold.white('─────────────────────────────────────────────────────────'));
    console.log('  ' + chalk.cyan('1.') + ' Run Full Marketing Audit  (citations + SEO + backlinks + reviews)');
    console.log('  ' + chalk.cyan('2.') + ' Publish GBP Post          (AI-generate + confirm + post)');
    console.log('  ' + chalk.cyan('3.') + ' Citation NAP Audit        (check all directories)');
    console.log('  ' + chalk.cyan('4.') + ' SEO Health Check          (PageSpeed + schema + sitemap)');
    console.log('  ' + chalk.cyan('5.') + ' Backlink / Directory Audit');
    console.log('  ' + chalk.cyan('6.') + ' Check & Draft Review Replies');
    console.log('  ' + chalk.cyan('7.') + ' Generate Content          (post / reply / email / FAQ)');
    console.log('  ' + chalk.cyan('8.') + ' View Last Report');
    console.log('  ' + chalk.cyan('9.') + ' Schedule Recurring Tasks  (starts cron scheduler)');
    console.log('  ' + chalk.cyan('0.') + ' Exit');

    const choice = await question(rl, chalk.white('\n  Enter choice: '));

    switch (choice.trim()) {
      case '1':
        await runFullAudit();
        break;
      case '2':
        await runGBPSubmenu();
        break;
      case '3': {
        const agent = loadAgent('citation-auditor');
        if (agent) {
          try { await agent.runCitationAudit(); }
          catch (e) { console.error(chalk.red(e.message)); }
        }
        break;
      }
      case '4': {
        const agent = loadAgent('seo-monitor');
        if (agent) {
          try { await agent.runFullSEOAudit(); }
          catch (e) { console.error(chalk.red(e.message)); }
        }
        break;
      }
      case '5': {
        const agent = loadAgent('backlink-tracker');
        if (agent) {
          try { await agent.runBacklinkAudit(); }
          catch (e) { console.error(chalk.red(e.message)); }
        }
        break;
      }
      case '6':
        await runReviewSubmenu();
        break;
      case '7':
        await runContentGenSubmenu();
        break;
      case '8':
        await viewLastReport();
        break;
      case '9':
        rl.close();
        await startScheduler();
        return; // startScheduler keeps process alive
      case '0':
        running = false;
        break;
      default:
        console.log(chalk.yellow('Invalid choice. Enter a number 0–9.'));
    }
  }

  rl.close();
  console.log(chalk.gray('\nGoodbye!\n'));
}

// ── CLI dispatch ──────────────────────────────────────────────────────────────

async function main() {
  printBanner();

  const arg = process.argv[2]?.toLowerCase();

  switch (arg) {
    case 'audit':
    case 'full':
      await runFullAudit();
      break;
    case 'gbp':
      await runGBPSubmenu();
      break;
    case 'citations': {
      const agent = loadAgent('citation-auditor');
      if (agent) await agent.runCitationAudit();
      break;
    }
    case 'seo': {
      const agent = loadAgent('seo-monitor');
      if (agent) await agent.runFullSEOAudit();
      break;
    }
    case 'generate':
      await runContentGenSubmenu();
      break;
    case 'schedule':
      await startScheduler();
      break;
    default:
      // No arg or unknown arg — show interactive menu
      await showInteractiveMenu();
  }
}

// ── Error handling ────────────────────────────────────────────────────────────

process.on('unhandledRejection', (reason) => {
  console.error(chalk.red('\nUnhandled error:'), reason?.message || reason);
});

process.on('uncaughtException', (err) => {
  console.error(chalk.red('\nFatal error:'), err.message);
  process.exit(1);
});

main().catch(err => {
  console.error(chalk.red('Startup error:'), err.message);
  process.exit(1);
});
