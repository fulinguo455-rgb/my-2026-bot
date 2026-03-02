export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).send("AI Bot is running");
  }

  try {
    const body = req.body;
    const message = body.message;

    if (!message || !message.text) {
      return res.status(200).end();
    }

    const chatId = message.chat.id;
    const userText = message.text;

    // 调用 OpenRouter 免费模型
    const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://your-vercel-domain.vercel.app",
        "X-Title": "My Telegram AI Bot"
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct",
        messages: [
          { role: "system", content: "你是一个聪明、有帮助的AI助手，回答要清晰简洁。" },
          { role: "user", content: userText }
        ]
      })
    });

    const aiData = await aiResponse.json();

    let reply = "AI 暂时不可用，请稍后再试。";

    if (aiData.choices && aiData.choices.length > 0) {
      reply = aiData.choices[0].message.content;
    }

    // 发送回 Telegram
    await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: reply
      })
    });

    return res.status(200).end();

  } catch (error) {
    console.error("Error:", error);
    return res.status(200).end();
  }
}
