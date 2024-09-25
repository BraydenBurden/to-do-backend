const mysql = require("mysql2");

// Create a connection to the MySQL database

const connection = mysql.createConnection({
  host: "localhost",
  user: "todo_user",
  password: "To@Do2024",
  database: "todo_db",
});

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL database");
  } else {
    console.log("Connected to MySQL database");
  }
});

module.exports = connection;
