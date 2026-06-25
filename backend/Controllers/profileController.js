const Users = require("../Models/Users");
const redisService = require("../Services/redisService");

exports.getMyProfile = async (req, res) => {
  const userId = req.session.user._id;
  const cacheKey = `profile:${userId}`;

  try {
    // 1️⃣ Check Redis
    const cachedProfile = await redisService.get(cacheKey);

    if (cachedProfile) {
      return res.json(JSON.parse(cachedProfile));
    }

    // 2️⃣ Fetch from MongoDB
    const user = await Users.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 3️⃣ Save to Redis (5 minutes)
    await redisService.setEx(
      cacheKey,
      300,
      JSON.stringify(user)
    );

    res.json(user);
  } catch (err) {
    console.error("getMyProfile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateProfile = async (req, res) => {
  const { name, about } = req.body;
  const update = {};

  if (name) update.name = name;
  if (about) update.about = about;
  if (req.file) {
    update.avatar = `/uploads/profile/${req.file.filename}`;
  }

  const user = await Users.findByIdAndUpdate(
    req.session.user._id,
    update,
    { new: true }
  ).select("-password");

  // 🔥 Update session
  req.session.user = {
    ...req.session.user,
    name: user.name,
    avatar: user.avatar
  };

  // 🔥 Clear profile cache
  await redisService.del(`profile:${req.session.user._id}`);

  res.json(user);
};
