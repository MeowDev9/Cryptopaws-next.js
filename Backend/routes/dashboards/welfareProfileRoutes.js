const express = require("express");
const router = express.Router();
const verifyWelfareToken = require("../../middleware/welfaremiddleware");
const welfareProfileController = require("./welfareProfileController");

router.get("/profile", verifyWelfareToken, welfareProfileController.getProfile);
router.put("/profile/update", verifyWelfareToken, welfareProfileController.updateProfile);
router.post("/profile/upload", verifyWelfareToken, welfareProfileController.uploadProfilePicture);

module.exports = router;
