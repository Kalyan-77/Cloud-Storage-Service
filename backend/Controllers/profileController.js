const Users = require("../Models/Users");

exports.getMyProfile = async (req, res) => {
  const user = await Users.findById(req.session.user._id).select("-password");
  res.json(user);
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

  res.json(user);
};
