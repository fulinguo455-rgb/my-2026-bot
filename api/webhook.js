export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).send("Groq Bot running");
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
      // 1️⃣ 调用 Groq API
      const response = await fetch("https://api.groq.ai/v1/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          prompt: userText,
          model: "groq-llama2",
          temperature: 0.7, // 生成文本的随机性
          max_tokens: 100, // 最长回复长度
        }),
      });

      const data = await response.json();

      if (data && data.choices && data.choices.length > 0) {
        reply = data.choices[0].text.trim();  // 获取 Groq API 的回复
      }

    } catch (err) {
      console.log("Groq error:", err);
      reply = "Groq AI 服务异常，请稍后再试";
    }

    // 2️⃣ 返回 Telegram 回复
    await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: reply.substring(0, 4000),  // 防止超过 Telegram 限制
      })
    });

    return res.status(200).end();

  } catch (error) {
    console.error("Fatal error:", error);
    return res.status(200).end();
  }
}
