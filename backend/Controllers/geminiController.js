const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Chat with Gemini
exports.chatWithGemini = async (req, res) => {
    const { message, conversationHistory } = req.body;

    try {
        if (!message) {
            return res.status(400).json({ 
                success: false,
                error: 'Message is required' 
            });
        }

        // Get the model
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // If there's conversation history, use chat with history
        if (conversationHistory && conversationHistory.length > 0) {
            // Format history for Gemini
            const formattedHistory = conversationHistory.map(msg => ({
                role: msg.role, // 'user' or 'model'
                parts: [{ text: msg.content }]
            }));

            const chat = model.startChat({
                history: formattedHistory,
                generationConfig: {
                    maxOutputTokens: 2000,
                    temperature: 0.7,
                }
            });

            const result = await chat.sendMessage(message);
            const response = result.response.text();

            return res.status(200).json({
                success: true,
                message: 'Response generated successfully',
                response: response,
                conversationHistory: [
                    ...conversationHistory,
                    { role: 'user', content: message },
                    { role: 'model', content: response }
                ]
            });
        } else {
            // Simple single message generation
            const result = await model.generateContent(message);
            const response = result.response.text();

            return res.status(200).json({
                success: true,
                message: 'Response generated successfully',
                response: response,
                conversationHistory: [
                    { role: 'user', content: message },
                    { role: 'model', content: response }
                ]
            });
        }

    } catch (err) {
        console.error('Gemini API Error:', err);
        
        // Handle specific Gemini errors
        if (err.message?.includes('API key not valid')) {
            return res.status(401).json({
                success: false,
                error: 'Invalid API key. Please check your Gemini API key.'
            });
        }
        
        if (err.message?.includes('quota')) {
            return res.status(429).json({
                success: false,
                error: 'API quota exceeded. Please try again later.'
            });
        }

        return res.status(500).json({
            success: false,
            error: 'Failed to generate response',
            details: err.message
        });
    }
};

// Stream chat response (for real-time streaming)
exports.streamChatWithGemini = async (req, res) => {
    const { message } = req.body;

    try {
        if (!message) {
            return res.status(400).json({ 
                success: false,
                error: 'Message is required' 
            });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Set headers for SSE (Server-Sent Events)
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const result = await model.generateContentStream(message);

        // Stream the response
        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
        }

        res.write('data: [DONE]\n\n');
        res.end();

    } catch (err) {
        console.error('Gemini Streaming Error:', err);
        res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
        res.end();
    }
};

// Analyze text/document
exports.analyzeWithGemini = async (req, res) => {
    const { text, prompt } = req.body;

    try {
        if (!text) {
            return res.status(400).json({ 
                success: false,
                error: 'Text is required' 
            });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const analysisPrompt = prompt || 
            `Analyze the following text and provide insights:\n\n${text}`;

        const result = await model.generateContent(analysisPrompt);
        const response = result.response.text();

        return res.status(200).json({
            success: true,
            message: 'Analysis completed successfully',
            analysis: response
        });

    } catch (err) {
        console.error('Gemini Analysis Error:', err);
        return res.status(500).json({
            success: false,
            error: 'Failed to analyze text',
            details: err.message
        });
    }
};