// api/send-notification.js
//
// Serverless function (Vercel auto-detects anything inside /api).
// This is the ONLY place the Base API key is ever used — it reads it
// from an environment variable, so it never reaches the browser.
//
// The front-end (index.html) calls THIS endpoint, never Base directly.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.BASE_API_KEY;
  const appUrl = process.env.APP_URL; // e.g. "https://your-app.vercel.app"

  if (!apiKey || !appUrl) {
    console.error('Missing BASE_API_KEY or APP_URL environment variable');
    return res.status(500).json({ error: 'Server not configured' });
  }

  const { wallet_addresses, title, message, target_path } = req.body || {};

  if (!Array.isArray(wallet_addresses) || wallet_addresses.length === 0) {
    return res.status(400).json({ error: 'wallet_addresses is required' });
  }
  if (!title || title.length > 30) {
    return res.status(400).json({ error: 'title is required and must be <= 30 characters' });
  }
  if (!message || message.length > 200) {
    return res.status(400).json({ error: 'message is required and must be <= 200 characters' });
  }

  try {
    const response = await fetch('https://dashboard.base.org/api/v1/notifications/send', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        app_url: appUrl,
        wallet_addresses,
        title,
        message,
        target_path,
      }),
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err) {
    console.error('Failed to send notification:', err);
    return res.status(500).json({ error: 'Failed to send notification' });
  }
}
