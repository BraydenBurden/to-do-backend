const express = require("express");
const app = express();
require("dotenv").config();
const db = require("./db/database");
const port = process.env.PORT || 3000;

console.log(process.env.PORT);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
