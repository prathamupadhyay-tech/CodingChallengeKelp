const csvToJsonRouter = require("./CsvToJson/routes");
const express = require("express");
const app = express();
const fs = require("fs");
const port = 3000;
const dotenv = require("dotenv");

app.get("/", (req, res) => {
  res.send("Hello world");
});
app.use(express.json());

app.use("/api/csvToJson", csvToJsonRouter);

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
