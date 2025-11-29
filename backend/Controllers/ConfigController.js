const Configuration = require('../Models/ConfigModel');

exports.saveConfig = async (req, res) => {
  try {
    const { userId } = req.params;
    const { storageConfig, desktopApps, ipAddress } = req.body;

    console.log('=== Save Config Backend Debug ===');
    console.log('User ID:', userId);
    console.log('Desktop Apps received:', desktopApps);
    console.log('Storage Config:', storageConfig);
    console.log('IP Address:', ipAddress);

    let config = await Configuration.findOne({ userId });

    if (!config) {
      // Create new configuration
      config = new Configuration({
        userId,
        ipAddress: ipAddress || '',
        storageConfigs: storageConfig ? [storageConfig] : [],
        desktopApps: desktopApps || []
      });
      console.log('Creating new config:', config);
    } else {
      console.log('Existing config found:', config);
      
      // Update IP Address if provided
      if (ipAddress !== undefined) {
        config.ipAddress = ipAddress;
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
    console.log('Config saved successfully:', config);
    console.log('=== End Save Config Backend ===');
    
    res.status(200).json({ 
      message: 'Configuration saved successfully', 
      config,
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

// Get Configuration by User
exports.getConfig = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Fetching config for user:', userId);
    
    const config = await Configuration.findOne({ userId });

    if (!config) {
      console.log('No configuration found for user:', userId);
      return res.status(404).json({ message: 'No configuration found' });
    }

    console.log('Config found:', config);
    res.status(200).json(config);
  } catch (error) {
    console.error('Error fetching configuration:', error);
    res.status(500).json({ 
      message: 'Error fetching configuration', 
      error: error.message 
    });
  }
};

// Delete Configuration (optional - you mentioned deleteConfig in routes)
exports.deleteConfig = async (req, res) => {
  try {
    const { userId } = req.params;
    const config = await Configuration.findOneAndDelete({ userId });

    if (!config) {
      return res.status(404).json({ message: 'No configuration found to delete' });
    }

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