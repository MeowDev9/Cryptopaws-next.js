const express = require("express");
const router = express.Router();
const Case = require("../models/Case");
const User = require("../models/User");


router.post("/donate", async (req, res) => {


    try {

        const donation = await Case.create(req.body);

        res.status(201).json({ message: "Ongoing Donation!" });
    } catch (error) {

        console.error("Error during donation:", error);

        res.status(500).json({ message: "Server error" });
    }
});
router.get("/donate", async (req, res) => {


    try {

        const donation = await Case.find({});

        res.status(201).json({ donation });
    } catch (error) {

        console.error("Error during donation:", error);

        res.status(500).json({ message: "Server error" });
    }
});
module.exports = router;