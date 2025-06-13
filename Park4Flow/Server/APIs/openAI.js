const { OpenAI } = require("openai");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const allowedModels = {
    "gpt-3.5": "gpt-3.5-turbo",
    "gpt-4": "gpt-4",
    "gpt-4-turbo": "gpt-4-turbo",
};

const flexibleOpenAIRequest = async (req, res) => {
    try {
        let {
            model = "gpt-4",
            temperature = 0.5,
            max_tokens = 1000,
            systemPrompt,
            query,
            data,
            format,
            messages,
        } = req.body;

        if (allowedModels[model]) model = allowedModels[model];

        let finalMessages = [];

        if (messages && Array.isArray(messages)) {
            finalMessages = messages;
        } else {
            const system = systemPrompt || "Ты — эксперт по анализу парковок и прогнозированию.";
            const userPrompt = `
${query ? `Задача: ${query}` : ""}
${format ? `Формат: ${format}` : ""}
${data ? `Данные:\n${typeof data === "object" ? JSON.stringify(data, null, 2) : data}` : ""}
      `.trim();

            finalMessages = [
                { role: "system", content: system },
                { role: "user", content: userPrompt },
            ];
        }

        const response = await openai.chat.completions.create({
            model,
            messages: finalMessages,
            temperature,
            max_tokens,
        });

        const aiMessage = response.choices[0].message.content;
        res.json({ result: aiMessage });
    } catch (err) {
        console.error("OpenAI API error:", err);
        res.status(500).json({ error: err.message || "Ошибка при обращении к OpenAI" });
    }
};

module.exports = { flexibleOpenAIRequest };
