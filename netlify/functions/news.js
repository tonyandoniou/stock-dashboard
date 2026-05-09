export default async (request) => {
  const { name, ticker } = await request.json();

  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      messages: [{
        role: 'user',
        content: `Find the 3 most recent news stories about ${name} (ticker ${ticker}) from reputable sources: Reuters, Bloomberg, WSJ, CNBC, Financial Times, AP, AFR. Return ONLY a JSON array of exactly 3 objects with keys: headline, source, url, age (e.g. "2h ago", "1d ago"). No markdown, no preamble, no extra text.`
      }]
    })
  });

  const data = await resp.json();
  const text = data.content.filter(c => c.type === 'text').map(c => c.text).join('');
  const articles = JSON.parse(text.replace(/```json|```/g, '').trim());

  return new Response(JSON.stringify({ articles }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    }
  });
};

export const config = { path: '/.netlify/functions/news' };
