const App = require("../Models/AppsModel");
const redisClient = require("../Config/redis");

// --------------------------------------
// Create a new app
// --------------------------------------
exports.createApp = async (req, res) => {
  try {
    const newApp = new App(req.body);
    await newApp.save();
    await redisClient.del("apps:all");


    res.status(201).json({
      success: true,
      message: "App created successfully",
      data: newApp
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// --------------------------------------
// Get all apps
// --------------------------------------
exports.getAllApps = async (req, res) => {

  const cacheKey = "apps:all";

  try{
     // 1️⃣ Check Redis
     let cacheApps;
    try{
      cacheApps = await redisClient.get(cacheKey);
    }catch{
      console.warn("Redis unavailable, skipping apps cache");
    }

    if (cacheApps) {
      return res.json({
        success: true,
        source: "redis",
        data: JSON.parse(cacheApps)
      });
    }

    // 2️⃣ Fetch from MongoDB
    const apps = await App.find();

    // 3️⃣ Save to Redis (10 minutes)
    await redisClient.setEx(
      cacheKey,
      600,
      JSON.stringify(apps)
    );

    res.json({
      success: true,
      source: "mongodb",
      data: apps
    });
  } catch (error) {
    console.error("getAllApps error:", error);
    res.status(500).json({ message: "Server error" });
  }
  // try {
  //   const apps = await App.find();

  //   res.status(200).json({
  //     success: true,
  //     count: apps.length,
  //     data: apps
  //   });
  // } catch (error) {
  //   res.status(500).json({
  //     success: false,
  //     message: error.message
  //   });
  // }
};

// --------------------------------------
// Get app by ID
// --------------------------------------
exports.getAppById = async (req, res) => {

  const { id } = req.params;
  const cacheKey = `apps:${id}`;

  try {
    // 1️⃣ Redis check
    let cachedApp;
    try {
      cachedApp = await redisClient.get(cacheKey);
    } catch {}

    if (cachedApp) {
      return res.json({
        success: true,
        source: "redis",
        data: JSON.parse(cachedApp)
      });
    }

    // 2️⃣ DB fetch
    const app = await App.findById(id);
    if (!app) {
      return res.status(404).json({ message: "App not found" });
    }

    // 3️⃣ Cache result
    await redisClient.setEx(
      cacheKey,
      600,
      JSON.stringify(app)
    );

    res.json({
      success: true,
      source: "mongodb",
      data: app
    });
  } catch (error) {
    res.status(500).json({ message: "Invalid App ID" });
  }
  // try {
  //   const app = await App.findById(req.params.id);

  //   if (!app) {
  //     return res.status(404).json({
  //       success: false,
  //       message: "App not found"
  //     });
  //   }

  //   res.status(200).json({
  //     success: true,
  //     data: app
  //   });
  // } catch (error) {
  //   res.status(500).json({
  //     success: false,
  //     message: "Invalid App ID"
  //   });
  // }
};


// --------------------------------------
// Update app by ID
// --------------------------------------
exports.updateApp = async (req, res) => {
  try {
    const updatedApp = await App.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedApp) {
      return res.status(404).json({
        success: false,
        message: "App not found"
      });
    }

    await redisClient.del("apps:all");
    await redisClient.del(`apps:${req.params.id}`);


    res.status(200).json({
      success: true,
      message: "App updated successfully",
      data: updatedApp
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


// --------------------------------------
// Delete app by ID
// --------------------------------------
exports.deleteApp = async (req, res) => {
  try {
    const deletedApp = await App.findByIdAndDelete(req.params.id);

    if (!deletedApp) {
      return res.status(404).json({
        success: false,
        message: "App not found"
      });
    }

    await redisClient.del("apps:all");
    await redisClient.del(`apps:${req.params.id}`);


    res.status(200).json({
      success: true,
      message: "App deleted successfully"
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid App ID"
    });
  }
};
