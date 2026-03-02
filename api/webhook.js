export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).send("Gemini Bot running");
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
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + process.env.GEMINI_API_KEY,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: userText }
                ]
              }
            ]
          })
        }
      );

      const data = await response.json();

      if (
        data &&
        data.candidates &&
        data.candidates[0] &&
        data.candidates[0].content &&
        data.candidates[0].content.parts
      ) {
        reply = data.candidates[0].content.parts[0].text;
      }

    } catch (err) {
      console.log("Gemini error:", err);
    }

    await fetch(
      "https://api.telegram.org/bot" + process.env.BOT_TOKEN + "/sendMessage",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: reply.substring(0, 4000)
        })
      }
    );

    return res.status(200).end();

  } catch (error) {
    console.error("Fatal error:", error);
    return res.status(200).end();
  }
}
