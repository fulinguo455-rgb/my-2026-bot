export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(200).send('Bot is running');
  }

  try {
    const body = req.body;
    const message = body.message;

    if (message && message.text) {
      const chatId = message.chat.id;
      const text = message.text;

      await fetch(
        `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: `你说的是: ${text}`
          })
        }
      );
    }

    return res.status(200).json({ status: 'ok' });

  } catch (error) {
    console.error(error);
    return res.status(200).json({ error: 'error' });
  }
}
