const cheerio = require("cheerio");
const axios = require("axios");
const express = require("express");
const NodeCache = require("node-cache");
const wordCache = new NodeCache({ stdTTL: 0, checkperiod: 0 });
const app = express();
const PORT = process.env.PORT || 3000;

const crawl = async (word, link, data) => {
  const $ = cheerio.load(data);
  let dataWord = [];
  let recommend = [];
  $(".dlink").each((index, groupWord) => {
    const word = $(groupWord).find(".di-title").text();
    const dipa = $(groupWord).find(".dipa").text();
    const pos = $(groupWord).find(".dpos").text();
    let description = [];
    $(groupWord)
      .find(".dsense")
      .each((index, groupDescription) => {
        const instruct = $(groupDescription).find(".ddef_d").text();
        const translate = $(groupDescription).find(".dtrans").text();
        const example = $(groupDescription).find(".deg").text();
        description.push({ instruct, translate, example });
      });
    let example = [];
    $(".degs .deg").each((index, groupExample) => {
      example.push(
        $(groupExample)
          .text()
          .trim()
          .replace(/(?:\r\n|\r|\n)/g, "")
      );
    });

    dataWord.push({ word, dipa, pos, description, example });
  });
  $(".lmb-12 .haf").each((index, groupRecommends) => {
    let re = $(groupRecommends)
      .text()
      .replace(/(?:\r\n|\r|\n)/g, "");
    recommend.push({
      word: re,
      link:
        "https://dictionary.cambridge.org/us/dictionary/english-vietnamese/" +
        $(groupRecommends).text().trim().replace(" ", "-"),
    });
  });
  let wordJson = {
    status: "Done!",
    word,
    link,
    data: dataWord,
    recommend,
  };
  if (dataWord == []) {
    wordJson = { status: "Not Found 404 🙄" };
  } else {
    success = wordCache.set(word, wordJson);
  }
  return wordJson;
};

app.get("/", async (req, res) => {
  res.json({
    status: "Running!",
    howToUse: `/dict/:word | ?useCache=true is default`,
    docs: "I'm so lazy right now 😝",
    contact: "Contact me via telegram 'Enoofzeniko' !",
    bonus: "Thanks for using it 😍",
  });
});

app.get("/dict/:word", async (req, res) => {
  const word = req.params.word;
  const usecache = req.query.usecache;
  const link =
    "https://dictionary.cambridge.org/us/dictionary/english-vietnamese/" + word;
  console.log("Word: " + word);
  let value = wordCache.get(word);
  if (usecache == "false") {
    value = undefined;
  }
  if (value == undefined) {
    const data = await axios.get(link).then((data) => {
      return data.data;
    });
    const wordJson = await crawl(word, link, data);
    res.json(wordJson);
  } else {
    console.log("==> Had cache!");
    res.json(value);
  }
});

app.listen(PORT, () => {
  console.log("RUN ON PORT " + PORT);
});
