const Perplexity = require("@perplexity-ai/perplexity_ai");
const Configuration = require('../Models/ConfigModel');
const redisClient = require("../Config/redis");

// --------------------------------------
// @desc    Chat with Perplexity AI
// @route   POST /api/ai/chat/:userId
// @access  Private (requires userId)
// --------------------------------------
exports.perplexityChat = async (req, res) => {
  try {
    const { userId } = req.params;
    const { message } = req.body;

    // Validate input
    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required"
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    // Fetch user configuration from cache or database
    const cacheKey = `config:${userId}`;
    let userConfig;
    let apiKey;

    try {
      // Try to get from Redis cache first
      const cachedConfig = await redisClient.get(cacheKey);
      
      if (cachedConfig) {
        userConfig = JSON.parse(cachedConfig);
        apiKey = userConfig.perplexity_API;
      } else {
        // Fetch from MongoDB if not in cache
        userConfig = await Configuration.findOne({ userId });
        
        if (!userConfig) {
          return res.status(404).json({
            success: false,
            message: "User configuration not found. Please configure your API key first."
          });
        }

        apiKey = userConfig.perplexity_API;

        // Cache the config for future requests
        await redisClient.setEx(cacheKey, 600, JSON.stringify(userConfig));
      }
    } catch (cacheError) {
      console.warn("Redis error, falling back to MongoDB:", cacheError);
      
      // Fallback to MongoDB directly
      userConfig = await Configuration.findOne({ userId });
      
      if (!userConfig) {
        return res.status(404).json({
          success: false,
          message: "User configuration not found. Please configure your API key first."
        });
      }

      apiKey = userConfig.perplexity_API;
    }

    // Validate API key exists
    if (!apiKey || apiKey.trim() === '') {
      return res.status(400).json({
        success: false,
        message: "Perplexity API key not configured. Please add your API key in settings."
      });
    }

    // Initialize Perplexity client with user's API key
    const client = new Perplexity({
      apiKey: apiKey
    });

    // Make API call to Perplexity
    const completion = await client.chat.completions.create({
      model: "sonar-pro",
      messages: [
        { role: "user", content: message }
      ]
    });

    return res.status(200).json({
      success: true,
      message: "Response generated successfully",
      data: completion.choices[0].message.content
    });

  } catch (error) {
    console.error("Perplexity Chat Error:", error);

    // Handle specific Perplexity API errors
    if (error.message && error.message.includes('Invalid API key')) {
      return res.status(401).json({
        success: false,
        message: "Invalid Perplexity API key. Please update your API key in settings."
      });
    }

    if (error.message && error.message.includes('Rate limit')) {
      return res.status(429).json({
        success: false,
        message: "Rate limit exceeded. Please try again later."
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate response"
    });
  }
};