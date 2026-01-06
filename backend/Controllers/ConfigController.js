const Configuration = require('../Models/ConfigModel');
const redisClient = require("../Config/redis");

exports.saveConfig = async (req, res) => {
  try {
    const { userId } = req.params;
    const { storageConfig, desktopApps, ipAddress, perplexity_API } = req.body;

    console.log('=== Save Config Backend Debug ===');
    console.log('User ID:', userId);
    console.log('Desktop Apps received:', desktopApps);
    console.log('Storage Config:', storageConfig);
    console.log('IP Address:', ipAddress);
    console.log('Perplexity API Key:', perplexity_API ? '***' + perplexity_API.slice(-4) : 'Not provided');

    let config = await Configuration.findOne({ userId });

    if (!config) {
      // Create new configuration
      config = new Configuration({
        userId,
        ipAddress: ipAddress || '',
        perplexity_API: perplexity_API || '',
        storageConfigs: storageConfig ? [storageConfig] : [],
        desktopApps: desktopApps || []
      });
      console.log('Creating new config');
    } else {
      console.log('Existing config found');
      
      // Update IP Address if provided
      if (ipAddress !== undefined) {
        config.ipAddress = ipAddress;
      }

      // Update Perplexity API Key if provided
      if (perplexity_API !== undefined) {
        config.perplexity_API = perplexity_API;
        console.log('Updated Perplexity API key');
      }

      // Update or Add Storage Config (only if provided)
      if (storageConfig) {
        const index = config.storageConfigs.findIndex(
          (s) => s.type === storageConfig.type
        );

        if (index !== -1) {
          config.storageConfigs[index] = storageConfig;
        } else {
          config.storageConfigs.push(storageConfig);
        }
      }

      // Update Desktop Apps if provided
      // IMPORTANT: Check for undefined, not just truthy value (empty array [] is valid)
      if (desktopApps !== undefined) {
        config.desktopApps = desktopApps;
        console.log('Updated desktop apps to:', config.desktopApps);
      }
    }

    await config.save();
    await redisClient.del(`config:${userId}`);

    console.log('Config saved successfully');
    console.log('=== End Save Config Backend ===');
    
    // Don't send the full API key back in response
    const responseConfig = config.toObject();
    if (responseConfig.perplexity_API) {
      responseConfig.perplexity_API = '***' + responseConfig.perplexity_API.slice(-4);
    }
    
    res.status(200).json({ 
      message: 'Configuration saved successfully', 
      config: responseConfig,
      desktopApps: config.desktopApps 
    });
  } catch (error) {
    console.error('❌ Error saving configuration:', error);
    res.status(500).json({ 
      message: 'Error saving configuration', 
      error: error.message 
    });
  }
};

exports.getConfig = async (req, res) => {
  try {
    const { userId } = req.params;
    const cacheKey = `config:${userId}`;

    // 1️⃣ Check Redis
    let cachedConfig;
    try {
      cachedConfig = await redisClient.get(cacheKey);
    } catch {
      console.warn("Redis unavailable, skipping config cache");
    }

    if (cachedConfig) {
      const config = JSON.parse(cachedConfig);
      // Mask API key in response
      if (config.perplexity_API) {
        config.perplexity_API_masked = '***' + config.perplexity_API.slice(-4);
        config.perplexity_API_exists = true;
        delete config.perplexity_API; // Don't send full key to frontend
      } else {
        config.perplexity_API_exists = false;
      }
      return res.status(200).json(config);
    }

    // 2️⃣ Fetch from MongoDB
    const config = await Configuration.findOne({ userId });

    if (!config) {
      return res.status(404).json({ message: 'No configuration found' });
    }

    // 3️⃣ Cache for 10 minutes
    await redisClient.setEx(
      cacheKey,
      600,
      JSON.stringify(config)
    );

    // Mask API key in response
    const responseConfig = config.toObject();
    if (responseConfig.perplexity_API) {
      responseConfig.perplexity_API_masked = '***' + responseConfig.perplexity_API.slice(-4);
      responseConfig.perplexity_API_exists = true;
      delete responseConfig.perplexity_API; // Don't send full key to frontend
    } else {
      responseConfig.perplexity_API_exists = false;
    }

    res.status(200).json(responseConfig);
  } catch (error) {
    console.error('Error fetching configuration:', error);
    res.status(500).json({
      message: 'Error fetching configuration',
      error: error.message
    });
  }
};

// Delete Configuration
exports.deleteConfig = async (req, res) => {
  try {
    const { userId } = req.params;
    const config = await Configuration.findOneAndDelete({ userId });

    if (!config) {
      return res.status(404).json({ message: 'No configuration found to delete' });
    }

    await redisClient.del(`config:${userId}`);

    res.status(200).json({ 
      message: 'Configuration deleted successfully',
      deletedConfig: config 
    });
  } catch (error) {
    console.error('Error deleting configuration:', error);
    res.status(500).json({ 
      message: 'Error deleting configuration', 
      error: error.message 
    });
  }
};