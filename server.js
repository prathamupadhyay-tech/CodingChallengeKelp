const csvToJsonRouter = require("./csvToJson/routes");
const express = require("express");
const app = express();
const port = 3000;


app.get("/", (req, res) => {
  res.send("Hello world");
});
app.use(express.json());

app.use("/api/csvToJson", csvToJsonRouter);

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
