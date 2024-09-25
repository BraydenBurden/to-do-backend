const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const db = require("./db/database");
const port = process.env.PORT || 3000;

app.use(cors());

const RegistrationRoute = require("./routes/registration");
const LoginRoute = require("./routes/login");

app.use("/registration", RegistrationRoute);
app.use("/login", LoginRoute);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
