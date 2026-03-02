export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).send("Groq AI Bot Running");
  }

  try {
    const body = req.body || {};
    const message = body.message;

    if (!message || !message.text) {
      return res.status(200).end();
    }

    const chatId = message.chat.id;
    const userText = message.text;

    let reply = "AI 暂时不可用，请稍后再试。";

    try {
      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
          },
          body: JSON.stringify({
            model: "groq-llama2-chat-1.0", // Groq 的聊天模型名称，可根据文档调整
            messages: [
              { role: "system", content: "你是一个友好、有帮助的 AI 聊天助手。" },
              { role: "user", content: userText }
            ],
            max_tokens: 500,
            temperature: 0.7
          })
        }
      );

      const data = await response.json();

      if (
        data &&
        data.choices &&
        data.choices[0] &&
        data.choices[0].message &&
        data.choices[0].message.content
      ) {
        reply = data.choices[0].message.content;
      } else {
        console.log("Groq API 返回格式不标准:", data);
      }

    } catch (err) {
      console.error("Groq API 调用错误:", err);
      reply = "AI 服务异常，请稍后再试";
    }

    await fetch(
      `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: reply.substring(0, 4000) // Telegram 最大限制4096
        })
      }
    );

    return res.status(200).end();
  } catch (error) {
    console.error("整体处理异常:", error);
    return res.status(200).end();
  }
}
