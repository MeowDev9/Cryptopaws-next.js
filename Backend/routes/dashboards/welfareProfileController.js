const path = require("path");
const multer = require("multer");
const WelfareOrganization = require("../../models/WelfareOrganization");

// 📌 Configure Multer for Image Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/welfare_profile_pics"); // Save images in 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, `${req.user.id}_${Date.now()}${path.extname(file.originalname)}`); // Unique filename
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png/;
    const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = fileTypes.test(file.mimetype);

    if (extName && mimeType) {
      return cb(null, true);
    } else {
      cb(new Error("Only .jpeg, .jpg, .png formats allowed!"));
    }
  },
}).single("profilePic");

// 📌 GET Welfare Profile
const getProfile = async (req, res) => {
  try {
    const welfare = await WelfareOrganization.findById(req.user.id).select("-password");
    if (!welfare) return res.status(404).json({ message: "Welfare not found" });

    res.json(welfare);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 📌 UPDATE Welfare Profile (Including Name Fix)
const updateProfile = async (req, res) => {
  try {
    const { organizationName, bio, socialLinks, phone, address, website } = req.body;

    // Fetch existing profile to ensure no unintended data loss
    const existingProfile = await WelfareOrganization.findById(req.user.id);
    if (!existingProfile) return res.status(404).json({ message: "Welfare not found" });

    // ✅ Ensure name updates properly while preserving existing data
    const updatedData = {
      organizationName: organizationName || existingProfile.name, // Preserve old name if new one is not provided
      bio,
      socialLinks,
      phone,
      address,
      website,
    };

    const updatedWelfare = await WelfareOrganization.findByIdAndUpdate(
      req.user.id,
      updatedData,
      { new: true, runValidators: true }
    );

    res.json({ message: "Profile updated successfully!", welfare: updatedWelfare });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 📌 UPLOAD Profile Picture
const uploadProfilePicture = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error("Multer Error:", err);
      return res.status(400).json({ message: err.message });
    }

    try {
      if (!req.file) {
        console.error("No file uploaded!");
        return res.status(400).json({ message: "No file uploaded" });
      }

      console.log("Uploaded File:", req.file);

      const updatedWelfare = await WelfareOrganization.findByIdAndUpdate(
        req.user.id,
        { profilePicture: `/uploads/welfare_profile_pics/${req.file.filename}` },
        { new: true, runValidators: true }
      );

      if (!updatedWelfare) {
        console.error("Welfare not found in DB!");
        return res.status(404).json({ message: "Welfare not found" });
      }

      console.log("Updated Welfare:", updatedWelfare);

      res.json({ message: "Profile picture updated!", profilePicture: updatedWelfare.profilePicture });
    } catch (error) {
      console.error("Database Update Error:", error);
      res.status(500).json({ message: "Server Error", error: error.message });
    }
  });
};


module.exports = { getProfile, updateProfile, uploadProfilePicture };
