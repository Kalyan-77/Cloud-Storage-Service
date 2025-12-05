const App = require("../Models/AppsModel");

// --------------------------------------
// Create a new app
// --------------------------------------
exports.createApp = async (req, res) => {
  try {
    const newApp = new App(req.body);
    await newApp.save();

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
  try {
    const apps = await App.find();

    res.status(200).json({
      success: true,
      count: apps.length,
      data: apps
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// --------------------------------------
// Get app by ID
// --------------------------------------
exports.getAppById = async (req, res) => {
  try {
    const app = await App.findById(req.params.id);

    if (!app) {
      return res.status(404).json({
        success: false,
        message: "App not found"
      });
    }

    res.status(200).json({
      success: true,
      data: app
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Invalid App ID"
    });
  }
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
