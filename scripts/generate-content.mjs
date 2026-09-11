#!/usr/bin/env node
/**
 * P7 Reasoning Lift Content Generator
 * ─────────────────────────────────────
 * Reads content briefs from p7-briefs.json (extracted from the Asana P7 plan),
 * generates each article as an MDX file using the DeepSeek API, and writes
 * it to src/content/blog/. Optionally adds a Napkin diagram and posts a
 * completion comment to the matching Asana task.
 *
 * Usage:
 *   node scripts/generate-content.mjs                  # generate all weeks (2-8)
 *   node scripts/generate-content.mjs --week 2          # generate one week
 *   node scripts/generate-content.mjs --week 5,6        # generate multiple weeks
 *   node scripts/generate-content.mjs --dry-run         # print what would be generated, write nothing
 *   node scripts/generate-content.mjs --no-napkin       # skip napkin diagram generation
 *   node scripts/generate-content.mjs --asana           # post a completion comment to each Asana task
 *
 * Requires: DEEPSEEK_API_KEY in env.
 * Optional: ASANA_ACCESS_TOKEN for --asana flag.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const BLOG_DIR = path.join(ROOT, 'src', 'content', 'blog');
const BRIEFS_PATH = path.join(__dirname, 'p7-briefs.json');

const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY;
const ASANA_TOKEN = process.env.ASANA_ACCESS_TOKEN;

// ─── CLI parsing ──────────────────────────────────────────────
function parseArgs() {
  const args = { week: null, dryRun: false, noNapkin: false, asana: false };
  const raw = process.argv.slice(2);
  for (let i = 0; i < raw.length; i++) {
    if (raw[i] === '--week' || raw[i] === '-w') args.week = raw[++i];
    else if (raw[i] === '--dry-run') args.dryRun = true;
    else if (raw[i] === '--no-napkin') args.noNapkin = true;
    else if (raw[i] === '--asana') args.asana = true;
    else if (raw[i] === '--help' || raw[i] === '-h') {
      console.log(`Usage: node scripts/generate-content.mjs [--week N[,N...]] [--dry-run] [--no-napkin] [--asana]`);
      process.exit(0);
    }
  }
  if (args.week) args.weeks = args.week.split(',').map((s) => parseInt(s.trim(), 10));
  return args;
}

// ─── Brief loading ────────────────────────────────────────────
function loadBriefs() {
  return JSON.parse(fs.readFileSync(BRIEFS_PATH, 'utf-8'));
}

function flattenBriefs(briefs) {
  // Expand multi-page weeks into individual generation jobs
  const jobs = [];
  for (const w of briefs) {
    if (w.type === 'retrofit') continue; // week 1 — no new content
    if (w.pages) {
      for (const p of w.pages) {
        jobs.push({
          week: w.week,
          weekTitle: w.title,
          asanaTaskGid: w.asanaTaskGid,
          ...p,
        });
      }
    } else {
      jobs.push({
        week: w.week,
        weekTitle: w.title,
        asanaTaskGid: w.asanaTaskGid,
        title: w.title,
        slug: w.slug,
        type: w.type,
        mainKeyword: w.mainKeyword,
        secondaryKeywords: w.secondaryKeywords,
        targetLength: w.targetLength,
        schema: w.schema,
        brief: w.brief,
        internalLinks: w.internalLinks,
      });
    }
  }
  return jobs;
}

// ─── DeepSeek API ─────────────────────────────────────────────
async function callDeepSeek(systemPrompt, userPrompt, { json = false, temperature = 0.4 } = {}) {
  if (!DEEPSEEK_KEY) throw new Error('DEEPSEEK_API_KEY is not set in the environment.');
  const body = {
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature,
  };
  if (json) body.response_format = { type: 'json_object' };

  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${DEEPSEEK_KEY}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`DeepSeek API error ${res.status}: ${txt}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() ?? '';
}

// ─── Content generation ────────────────────────────────────────
const WRITER_SYSTEM = `You are a research-backed wellness editor for SoundDip, a sound bath practitioner directory. You write honest, epistemically humble content that earns citations from high-reasoning AI systems.

STYLE RULES (match the existing blog voice exactly):
- Direct, plain-spoken prose. No hype, no "discover the magic of" language.
- Lead with the honest answer. If the evidence is thin, say so. If something is unknown, say "we don't know yet."
- Cite real studies with researcher names and publication years when discussing evidence. Never use "many people report" or "studies show" without naming the study.
- Use H2 headings (## in MDX) for each sub-query. The first sentence under each H2 must directly answer the sub-query.
- Use H3 (###) sparingly, only for nested lists within a section.
- Internal links use this format: [anchor text](/blog/slug/) or [anchor text](/cities/slug/)
- No em dashes. Use commas, parentheses, or separate sentences instead.
- Write in third person or collective "you." Never first person singular.
- End with a practical section that links to city pages or the directory.

OUTPUT FORMAT:
Return ONLY the MDX body (no frontmatter, no code fences). Start with the first paragraph of the article, immediately after where the frontmatter would be.`;

function buildWriterPrompt(job) {
  const parts = [
    `TITLE: ${job.title}`,
    `SLUG: ${job.slug}`,
    `MAIN KEYWORD: ${job.mainKeyword || 'n/a'}`,
  ];
  if (job.secondaryKeywords) parts.push(`SECONDARY KEYWORDS: ${job.secondaryKeywords.join(', ')}`);
  if (job.targetLength) parts.push(`TARGET LENGTH: ${job.targetLength}`);
  if (job.schema) parts.push(`SCHEMA TO INCLUDE: ${job.schema.join(', ')}`);
  parts.push('', 'CONTENT BRIEF:', job.brief || job.brief || '');
  if (job.internalLinks) {
    parts.push('', 'INTERNAL LINKS TO REFERENCE:', job.internalLinks.join(', '));
  }
  parts.push('', 'EXISTING POSTS ON THE SITE (link to these where natural):');
  parts.push('- /blog/sound-healing-for-anxiety/ — "Sound Healing for Anxiety: What the Science Actually Says"');
  parts.push('- /blog/what-is-a-sound-bath/ — "What Is a Sound Bath? The Complete Guide" (if it exists)');
  parts.push('- /blog/sound-bath-benefits/ — "Sound Bath Benefits: What the Research Actually Shows" (if it exists)');
  parts.push('- /blog/are-sound-baths-safe/ — "Are Sound Baths Safe?" (if it exists)');
  parts.push('- /cities/los-angeles/ — Los Angeles city page');
  parts.push('- /cities/new-york-city/ — New York City page');
  parts.push('- /cities/asheville/ — Asheville page');
  return parts.join('\n');
}

function buildFrontmatter(job) {
  const today = new Date().toISOString().split('T')[0];
  const tags = [job.mainKeyword, 'sound bath', 'sound healing'].filter(Boolean);
  const uniqueTags = [...new Set(tags)];
  const fm = {
    title: job.title,
    description: '', // will be filled after generation
    pubDate: today,
    author: 'Sound Dip',
    tags: uniqueTags,
  };
  return fm;
}

const DESCRIPTION_SYSTEM = `You are an SEO meta-description writer. Given a blog post, write a single meta description (max 155 characters) that is honest, specific, and includes the main keyword. Return ONLY the description text, no quotes, no explanation.`;

async function generateDescription(body, mainKeyword) {
  const prompt = `Main keyword: ${mainKeyword}\n\nBlog post body:\n${body.slice(0, 3000)}\n\nWrite a meta description (max 155 chars) for this post.`;
  return await callDeepSeek(DESCRIPTION_SYSTEM, prompt, { temperature: 0.3 });
}

const NAPKIN_SYSTEM = `You are an editorial assistant that adds diagrams to blog posts. Given a Markdown blog post, choose ONE concept worth diagramming and return it as a single JSON object.

Respond with ONLY the JSON object — no explanation, no markdown fences — in exactly this shape:
{"anchor":"<exact text to insert after>","diagram":"<the diagram content>"}

Rules:
1. "anchor" MUST be an exact, verbatim substring of the post. Copy a full sentence or a heading line character-for-character (including punctuation). It must be unique enough to locate unambiguously in the post.
2. "diagram" is the content for a Napkin diagram. Format it based on the concept:
   - Step-by-step process -> "Create a flowchart:\nStep 1 -> Step 2 -> Step 3"
   - Repeating cycle -> "Create a circular flowchart:\nStage 1 -> Stage 2 -> Stage 3 -> Stage 1"
   - Categories/hierarchy -> "Create a mind map:\n- Core\n  - Category A\n  - Category B"
3. Pick the most visually diagrammable concept (a process, cycle, hierarchy, comparison, or step-by-step list). If nothing stands out, still choose the best paragraph and diagram it.
4. Output ONLY the JSON object.`;

async function generateNapkin(body) {
  const raw = await callDeepSeek(NAPKIN_SYSTEM, body, { json: true, temperature: 0.3 });
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!parsed.anchor || !parsed.diagram) return null;
  const idx = body.indexOf(parsed.anchor);
  if (idx === -1) return null;
  const anchorEnd = idx + parsed.anchor.length;
  const lineEnd = body.indexOf('\n', anchorEnd);
  const insertAt = lineEnd === -1 ? body.length : lineEnd + 1;
  const block = '```napkin\n' + parsed.diagram + '\n```';
  return body.slice(0, insertAt) + block + '\n\n' + body.slice(insertAt);
}

// ─── Asana integration ────────────────────────────────────────
async function postAsanaComment(taskGid, text) {
  if (!ASANA_TOKEN) {
    console.log('  (ASANA_ACCESS_TOKEN not set — skipping Asana comment)');
    return;
  }
  const res = await fetch(`https://app.asana.com/api/1.0/tasks/${taskGid}/stories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ASANA_TOKEN}`,
    },
    body: JSON.stringify({ data: { text } }),
  });
  if (!res.ok) {
    console.warn(`  Asana comment failed: ${res.status} ${await res.text()}`);
  }
}

// ─── Main ─────────────────────────────────────────────────────
async function main() {
  const args = parseArgs();
  if (!DEEPSEEK_KEY) {
    console.error('Error: DEEPSEEK_API_KEY environment variable is missing.');
    process.exit(1);
  }

  const allBriefs = loadBriefs();
  let jobs = flattenBriefs(allBriefs);
  if (args.weeks) {
    jobs = jobs.filter((j) => args.weeks.includes(j.week));
  }
  if (jobs.length === 0) {
    console.log('No generation jobs for the selected weeks. (Week 1 is an audit/retrofit task with no new content.)');
    return;
  }

  console.log(`\n  P7 Reasoning Lift Content Generator`);
  console.log(`  ${jobs.length} article(s) to generate${args.dryRun ? ' (DRY RUN)' : ''}\n`);

  let success = 0;
  let failed = 0;

  for (const job of jobs) {
    const outPath = path.join(BLOG_DIR, `${job.slug}.mdx`);
    console.log(`  Week ${job.week}: ${job.title}`);
    console.log(`    slug: ${job.slug}`);
    console.log(`    target: ${job.targetLength || 'n/a'}`);

    if (fs.existsSync(outPath) && !args.dryRun) {
      console.log(`    ⚠  File already exists — skipping. Delete it to regenerate.\n`);
      continue;
    }

    if (args.dryRun) {
      console.log(`    (dry run — would generate and write to ${path.relative(ROOT, outPath)})\n`);
      continue;
    }

    try {
      // 1. Generate article body
      console.log(`    generating article...`);
      const body = await callDeepSeek(WRITER_SYSTEM, buildWriterPrompt(job), { temperature: 0.5 });
      if (!body || body.length < 200) throw new Error('Article body too short — generation may have failed.');

      // 2. Generate meta description
      console.log(`    generating meta description...`);
      const description = await generateDescription(body, job.mainKeyword || 'sound bath');

      // 3. Assemble MDX
      const fm = buildFrontmatter(job);
      fm.description = description.replace(/^["']|["']$/g, '').slice(0, 155);
      const frontmatter = '---\n' + Object.entries(fm)
        .map(([k, v]) => {
          if (Array.isArray(v)) return `${k}: [${v.map((t) => `"${t}"`).join(', ')}]`;
          if (v instanceof Date || /^\d{4}-\d{2}-\d{2}$/.test(v)) return `${k}: ${v}`;
          return `${k}: "${String(v).replace(/"/g, '\\"')}"`;
        })
        .join('\n') + '\n---\n\n';

      let fullContent = frontmatter + body;

      // 4. Optionally add napkin diagram
      if (!args.noNapkin && !fullContent.includes('```napkin')) {
        console.log(`    generating napkin diagram...`);
        const withNapkin = await generateNapkin(fullContent);
        if (withNapkin) fullContent = withNapkin;
        else console.log(`    (napkin generation skipped — no suitable anchor)`);
      }

      // 5. Write file
      fs.writeFileSync(outPath, fullContent, 'utf-8');
      console.log(`    ✓ written to ${path.relative(ROOT, outPath)} (${fullContent.split(/\s+/).length} words)`);
      success++;

      // 6. Optional Asana comment
      if (args.asana && job.asanaTaskGid) {
        await postAsanaComment(
          job.asanaTaskGid,
          `Auto-generated and published: "${job.title}" → /blog/${job.slug}/\n${fullContent.split(/\s+/).length} words, ${job.targetLength || 'n/a'} target.`
        );
      }
    } catch (err) {
      console.error(`    ✗ failed: ${err.message}`);
      failed++;
    }

    console.log('');
    // Rate limit courtesy
    await new Promise((r) => setTimeout(r, 1500));
  }

  console.log(`  Done. ${success} generated, ${failed} failed.`);
  if (success > 0) {
    console.log(`  Run \`npm run build\` to verify the new posts compile.`);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
