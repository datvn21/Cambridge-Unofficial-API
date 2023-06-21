const express = require("express");
const cors = require("cors");

const crawl = require("./routes/crawl");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(cors());

app.get("/", async (req, res) => {
  res.json({
    status: "Running!",
    howToUse: `/dict/:word | ?useCache=true is default`,
    docs: "I'm so lazy right now 😝",
    contact: "Contact me via telegram 'Enoofzeniko' !",
    bonus: "Thanks for using it 😍",
  });
});

app.use("/api/crawl", crawl);

app.listen(PORT, () => {
  console.log("RUN ON PORT " + PORT);
});
