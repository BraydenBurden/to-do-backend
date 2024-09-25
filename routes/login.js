const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const db = require("../db/database");

const bodyParser = require("body-parser");

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.post("/testConnection", (req, res) => {
  console.log("Successfully Executed Test Connection");
});

router.post("/login", (req, res) => {
  const { email, password } = req.body; // Get email and password from request body

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required.",
    });
  }

  // 1. Email Check: Verify if the user's email exists in the database.
  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], (error, results) => {
    if (error) {
      console.error("Error querying database:", error);
      return res.status(500).json({
        success: false,
        message: "Server error.",
      });
    }

    if (results.length === 0) {
      // User does not exist
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const user = results[0]; // Get the user object from the results

    // 2. Password Validation: Compare the entered password with the stored password using bcrypt.
    bcrypt.compare(password, user.password, (compareError, isMatch) => {
      if (compareError) {
        console.error("Error comparing passwords:", compareError);
        return res.status(500).json({
          success: false,
          message: "Server error.",
        });
      }

      if (!isMatch) {
        // Password does not match
        return res.status(401).json({
          success: false,
          message: "Invalid email or password.",
        });
      }

      const loginDate = new Date();
      const sql = `update users set last_sign_in = ? where email = ?`;
      db.query(sql, [loginDate, email], (updateError) => {
        if (updateError) {
          console.error("Error updating last sign in date:", updateError);
        }

        // If everything is fine, return success and user details (excluding password)
        const { password: _, ...userDetails } = user; // Exclude password from user details

        return res.status(200).json({
          success: true,
          user: userDetails,
        });
      });
    });
  });
});

module.exports = router;
