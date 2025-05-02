const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const Admin = require("../models/Admin");

dotenv.config({ path: "/Users/hatim/CryptoPaws/CryptoPaws/Backend/.env" });


mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log("Connected to MongoDB");

 
    const hashedPassword = await bcrypt.hash("cryptopaws123", 10);

    
    const newAdmin = new Admin({
      name: "Hatim Bilal",
      email: "syedhb9@gmail.com",
      password: hashedPassword,
    });

    // Save the admin to the database
    await newAdmin.save();
    console.log("Admin created successfully!");

    // Close the connection
    mongoose.connection.close();
  })
  .catch(err => console.error("MongoDB connection error:", err));