const express = require("express");
const path = require("path");

const app = express();

// First it controls the default port,
// if the default port is not available then it tries to run the appliacation on 5000
const PORT = process.env.PORT || 5000;

app.use(express.static(path.join(__dirname, "src/public")));

app.listen(PORT);