export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).send("Bot running");
  }

  try {
    const body = req.body || {};
    const message = body.message;

    if (!message || !message.text) {
      return res.status(200).end();
    }

    const chatId = message.chat.id;
    const userText = message.text;

    let reply = "AI 暂时不可用";

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + (process.env.OPENROUTER_API_KEY || "")
        },
        body: JSON.stringify({
          model: "openchat/openchat-7b",
          messages: [
            { role: "user", content: userText }
          ]
        })
      });

      const data = await response.json();

      if (data && data.choices && data.choices.length > 0) {
        reply = data.choices[0].message.content;
      }

    } catch (err) {
      console.log("AI error:", err);
    }

    await fetch("https://api.telegram.org/bot" + process.env.BOT_TOKEN + "/sendMessage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: reply.substring(0, 4000)
      })
    });

    return res.status(200).end();

  } catch (error) {
    console.error("Fatal error:", error);
    return res.status(200).end();
  }
}
