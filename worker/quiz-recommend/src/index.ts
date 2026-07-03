// Cloudflare Worker: quiz-recommend
// Receives quiz answers + shortlisted listings, calls DeepSeek API
// to generate personalized recommendation prose in the site's editorial voice.
//
// Deploy:
//   cd worker/quiz-recommend
//   npx wrangler deploy
//   npx wrangler secret put DEEPSEEK_API_KEY

interface QuizAnswers {
  experience: 'first' | 'few' | 'regular';
  goal: 'rest' | 'release' | 'curious' | 'ceremonial';
  setting: 'group' | 'small' | 'private' | 'outdoor';
  budget: 'under30' | '30to60' | 'unlimited';
  location: string;
}

interface ShortListing {
  name: string;
  city?: string;
  neighborhood?: string;
  modalityTags?: string[];
  sessionDescription?: string;
  price?: string;
  bookingUrl?: string;
}

interface RequestBody {
  answers: QuizAnswers;
  listings: ShortListing[];
}

const SYSTEM_PROMPT = `You are the editorial voice of Sound Dip, a sound bath directory.
Your writing style: short declarative sentences, concrete and sensory, not generic wellness marketing.
Match this tone exactly:
"A sound bath isn't a workout, a class, or a performance. You lie down. You close your eyes. Vibrations from bowls, gongs, and voice wash over you for an hour. Most people fall asleep at least a little — that's the point."

Given a user's quiz answers and 3-5 shortlisted sessions, write a 150-word personalized recommendation explaining why these sessions fit their answers. Reference specific session names, practitioners, and cities. Be direct. No hedging. No "perhaps" or "you might consider." No markdown headers. Just prose.`;

function buildUserPrompt(answers: QuizAnswers, listings: ShortListing[]): string {
  const answerTexts: Record<string, string> = {
    experience: {
      first: 'This would be their first sound bath',
      few: "They've been to a few sound baths",
      regular: "They're a regular practitioner",
    },
    goal: {
      rest: 'Deep rest — they want to zone out and maybe fall asleep',
      release: 'Something to move through — emotional release, catharsis',
      curious: 'Just curious what a sound bath is like',
      ceremonial: 'Something ceremonial and spiritual',
    },
    setting: {
      group: 'Group energy — shared space with others',
      small: 'Small and quiet — intimate, limited group',
      private: 'Private — 1-on-1 or with a partner',
      outdoor: 'Outdoors — under sky, in a garden, by water',
    },
    budget: {
      under30: 'Under $30 per session',
      '30to60': '$30 to $60 per session',
      unlimited: 'No budget ceiling — will pay for the right experience',
    },
  };

  const lines: string[] = ['User answers:'];
  lines.push(`- Experience: ${answerTexts.experience[answers.experience] || answers.experience}`);
  lines.push(`- Goal: ${answerTexts.goal[answers.goal] || answers.goal}`);
  lines.push(`- Setting: ${answerTexts.setting[answers.setting] || answers.setting}`);
  lines.push(`- Budget: ${answerTexts.budget[answers.budget] || answers.budget}`);
  lines.push(`- Location: ${answers.location === 'any' ? 'Open to traveling' : answers.location}`);
  lines.push('');
  lines.push('Shortlisted sessions (already scored and ranked):');

  listings.forEach((l, i) => {
    const tags = (l.modalityTags || []).join(', ');
    const parts = [
      `${i + 1}. ${l.name}`,
      l.city ? `   City: ${l.city}` : '',
      l.neighborhood ? `   Neighborhood: ${l.neighborhood}` : '',
      tags ? `   Modalities: ${tags}` : '',
      l.price ? `   Price: ${l.price}` : '',
      l.sessionDescription ? `   Description: ${l.sessionDescription}` : '',
    ].filter(Boolean);
    lines.push(parts.join('\n'));
  });

  lines.push('');
  lines.push('Write the 150-word recommendation now. Reference specific session names and cities. Explain why these fit the user\'s answers.');

  return lines.join('\n');
}

export default {
  async fetch(request: Request, env: Record<string, string>): Promise<Response> {
    // Only accept POST
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json', 'Allow': 'POST' },
      });
    }

    // Check API key
    const apiKey = env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Server misconfigured: missing API key' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Parse request body
    let body: RequestBody;
    try {
      body = await request.json() as RequestBody;
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!body.answers || !body.listings || !Array.isArray(body.listings)) {
      return new Response(JSON.stringify({ error: 'Missing answers or listings' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (body.listings.length === 0) {
      return new Response(JSON.stringify({ error: 'No listings provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Build prompt
    const userPrompt = buildUserPrompt(body.answers, body.listings);

    // Call DeepSeek API (OpenAI-compatible)
    try {
      const llmRes = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          max_tokens: 400,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
          ],
        }),
      });

      if (!llmRes.ok) {
        const errText = await llmRes.text();
        return new Response(JSON.stringify({ error: 'DeepSeek API error', detail: errText }), {
          status: 502,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const llmData = await llmRes.json();
      const prose = llmData?.choices?.[0]?.message?.content || '';

      return new Response(JSON.stringify({ prose }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-cache',
        },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Failed to reach DeepSeek API', detail: String(err) }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  },
};
