const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const db = require("../db/database");
const { sendVerificationEmail } = require("../emailSender"); // Adjust the path accordingly

const bodyParser = require("body-parser");

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.post("/register", (req, res) => {
  const { email, firstName, lastName, password } = req.body;
  console.log(req.body, "REQ>BODY");

  try {
    // 1. Email Check: Verify if the email already exists in the database.
    const sql = "SELECT * FROM users WHERE email = ?";
    db.query(sql, [email], (error, results) => {
      if (error) {
        console.error("Error querying database:", error);
        return res
          .status(500)
          .json({ success: false, message: "Server error." });
      }

      if (results.length > 0) {
        // 2. If User Exists:
        return res
          .status(400)
          .json({ success: false, message: "Email already exists." });
      }

      // 3. If User Does Not Exist:
      // Encrypt the user's password using bcrypt.
      bcrypt.hash(password, 10, (hashError, hashedPassword) => {
        if (hashError) {
          console.error("Error hashing password:", hashError);
          return res
            .status(500)
            .json({ success: false, message: "Server error." });
        }

        // Insert the new user into the database.
        const creationDate = new Date();
        const sql =
          "INSERT INTO users (email, first_name, last_name, password, creation_date) VALUES (?, ?, ?, ?, ?)";
        db.query(
          sql,
          [email, firstName, lastName, hashedPassword, creationDate],
          (insertError) => {
            if (insertError) {
              console.error("Error inserting user into database:", insertError);
              return res
                .status(500)
                .json({ success: false, message: "Server error." });
            }

            // Send a verification email to the user's email address using the emailSender module.
            sendVerificationEmail(email, (mailError) => {
              if (mailError) {
                return res.status(500).json({
                  success: false,
                  message: "Failed to send verification email.",
                });
              }

              console.log("Verification email sent successfully.");

              // Send a true value for success to the frontend.
              return res.status(201).json({
                success: true,
                message: "User registered successfully.",
              });
            });
          }
        );
      });
    });
  } catch (e) {
    console.error("Error in register route:", e);
    return res.status(500).json({ success: false, message: "Server error." });
  }
});

router.post("/resendVerificationEmail", (req, res) => {
  const { email } = req.body;
  sendVerificationEmail(email, (mailError) => {
    if (mailError) {
      return res.status(500).json({
        success: false,
        message: "Failed to send verification email.",
      });
    }

    console.log("Verification email sent successfully.");

    // Send a true value for success to the frontend.
    return res.status(201).json({
      success: true,
      message: "User registered successfully.",
    });
  });
});

router.get("/verify", (req, res) => {
  const { email } = req.query;
  const loginLink = "http://localhost:3000/login";

  if (!email) {
    return res.status(400).send("Email is required for verification.");
  }

  const verificationPage = `
          <!DOCTYPE html>
          <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Email Verification</title>
              <style>
                body {
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  height: 100vh;
                  background-color: #f4f6f8; /* Background color */
                  margin: 0;
                  font-family: Arial, sans-serif;
                }
                .card {
                  padding: 20px;
                  border: 1px solid #ccc;
                  border-radius: 10px;
                  text-align: center;
                  background-color: #ffffff; /* Paper color */
                  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                }
                button {
                  padding: 10px 20px;
                  border: none;
                  border-radius: 5px;
                  background-color: #00796b; /* Teal color */
                  color: white;
                  cursor: pointer;
                  font-size: 16px;
                }
                button:hover {
                  background-color: #004d40; /* Darker teal for hover */
                }
                .success {
                  display: none;
                }
              </style>
            </head>
            <body>
              <div class="card">
                <div class="verification">
                  <h2>Please Verify Your Email</h2>
                  <p>Click the button below to verify your email address.</p>
                  <button id="verifyButton">Verify</button>
                </div>
                <div class="success">
                  <div class="success-icon" style="font-size: 50px; color: green;">✔️</div>
                  <h2>Your account has been verified successfully!</h2>
                  <a href=${loginLink}>
                    <button>Login</button>
                  </a>
                </div>
              </div>
              <script>
                document.getElementById('verifyButton').onclick = function() {
                  fetch('/registration/verifyEmail', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email: '${email}' }),
                  })
                  .then(response => {
                    if (response.ok) {
                      document.querySelector('.verification').style.display = 'none';
                      document.querySelector('.success').style.display = 'block';
                    } else {
                      alert('Verification failed. Please try again.');
                    }
                  })
                  .catch(error => {
                    console.error('Error during verification:', error);
                    alert('An error occurred. Please try again.');
                  });
                };
              </script>
            </body>
          </html>
        `;

  res.send(verificationPage);
});

router.post("/verifyEmail", (req, res) => {
  const { email } = req.body;

  const sql = `update users set verified = 1 where email = ?`;
  db.query(sql, [email], (error, results) => {
    if (error) {
      console.error("Error updating user in database:", error);
      return res.status(500).json({ success: false, message: "Server error." });
    }
    return res.status(201).json({
      success: true,
      message: "User registered successfully.",
    });
  });
});

module.exports = router;
