const express = require("express");
const cors = require("cors");
const { OpenAI } = require("openai");

const port = 3300;
const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);

const https = require("https");
const SUBSCRIPTION_KEY = "680531e54bd24bd6bdcfaa55cccffb11";

const openai = new OpenAI({
  apiKey: "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",
});

app.post("/gpt", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      //model: "gpt-3.5-turbo-0613",
      model: "gpt-4",
    });

    const response = completion.choices[0].message.content.trim();

    res.json({ response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// function bingWebSearch(query) {
//     return new Promise((resolve, reject) => {
//         https.get({
//             hostname: 'api.bing.microsoft.com',
//             path: '/v7.0/search?q=' + encodeURIComponent(query),
//             headers: { 'Ocp-Apim-Subscription-Key': SUBSCRIPTION_KEY },
//         }, res => {
//             let body = '';
//             res.on('data', part => body += part);
//             res.on('end', () => {
//                 const searchResults = JSON.parse(body);
//                 resolve(searchResults);
//             });
//         }).on('error', e => {
//             reject(e);
//         });
//     });
// }

// app.post('/search2', async (req, res) => {
//     try {
//         const { query } = req.body;

//         const searchResult = await bingWebSearch(query);

//         if (searchResult && searchResult.webPages && searchResult.webPages.value.length > 0) {
//             const topResult = searchResult.webPages.value[0];
//             const topic = topResult.name; // Extracting the topic from Bing search result

//             const images = searchResult.images && searchResult.images.value ? searchResult.images.value : [];
//             const imageLinks = images.map(image => image.thumbnailUrl);

//             const completion = await openai.chat.completions.create({
//                 model: "gpt-4",
//                 messages: [
//                     { role: "system", content: `Here are the search results for '${query}':` },
//                     { role: "system", content: `**${topic}**` },
//                     { role: "system", content: `Here is an image related to the topic:` },
//                     { role: "system", content: imageLinks.length > 0 ? imageLinks[0] : "No image available" }
//                 ],
//             });
//             const response = completion.choices[0].message.content.trim();

//             res.json({ response, imageLinks });
//         } else {
//             res.status(404).json({ error: 'No search results found' });
//         }
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Something went wrong' });
//     }
// });

function bingWebSearch(query) {
  return new Promise((resolve, reject) => {
    https
      .get(
        {
          hostname: "api.bing.microsoft.com",
          path: "/v7.0/search?q=" + encodeURIComponent(query),
          headers: { "Ocp-Apim-Subscription-Key": SUBSCRIPTION_KEY },
        },
        (res) => {
          let body = "";
          res.on("data", (part) => (body += part));
          res.on("end", () => {
            for (var header in res.headers) {
              if (
                header.startsWith("bingapis-") ||
                header.startsWith("x-msedge-")
              ) {
                console.log(header + ": " + res.headers[header]);
              }
            }
            console.log("\nJSON Response:\n");
            console.dir(JSON.parse(body), { colors: false, depth: null });

            const searchResults = JSON.parse(body);
            // console.dir(searchResults)
            resolve(searchResults);
          });
        }
      )
      .on("error", (e) => {
        reject(e);
      });
  });
}

// app.post('/search2', async (req, res) => {
//     try {
//         const { query } = req.body;

//         const searchResult = await bingWebSearch(query);

//         if (searchResult && searchResult.webPages && searchResult.webPages.value.length > 0) {
//             const topResult = searchResult.webPages.value[0];
//             const topic = topResult.name; // Extracting the topic from Bing search result
//             const articleLink = topResult.url; // Extracting the article link

//             const images = searchResult.images && searchResult.images.value ? searchResult.images.value : [];
//             const imageLinks = images.map(image => image.thumbnailUrl);

//             const completion = await openai.chat.completions.create({
//                 model: "gpt-4", // Adjust the model according to your preference
//                 messages: [
//                     { role: "system", content: `Here are the search results from bing search '${topic}' Based on this search results and information create a beautiful response and as long as possible and the prompt inpt by the user is : '${query}'` },
//                     { role: "system", content: `**${topic}**` },
//                     // { role: "system", content: `You can read more about this topic here: ${articleLink}` },
//                     // { role: "system", content: `Here is an image related to the topic:` },
//                     { role: "system", content: imageLinks.length > 0 ? imageLinks[0] : "No image available" }
//                 ],
//                 max_tokens: 150, // Adjust token count as needed
//                 temperature: 0.7 // Adjust temperature as needed
//             });

//             const response = completion.choices[0].message.content.trim();
//             res.json({ response, articleLink, imageLinks });
//         } else {
//             res.status(404).json({ error: 'No search results found' });
//         }
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Something went wrong' });
//     }
// });

app.post("/search2", async (req, res) => {
  try {
    const { query } = req.body;

    const searchResult = await bingWebSearch(query);

    if (
      searchResult &&
      searchResult.webPages &&
      searchResult.webPages.value.length > 0
    ) {
      const searchInfo = [];
      const newsInfo = [];

      const topResults = searchResult.webPages.value;
      if (
        searchResult &&
        searchResult.webPages &&
        searchResult.webPages.value.length > 0
      ) {
        for (const result of topResults) {
          const topic = result.name; // Extracting the topic from Bing search result
          const description = result.snippet; // Extracting the topic from Bing search result
          const articleLink = result.url; // Extracting the article link

          const images = result.image && result.image ? result.image : [];

          searchInfo.push({ topic, description, articleLink, images });
        }
      }

      if (
        searchResult &&
        searchResult.news &&
        searchResult.news.value.length > 0
      ) {
        const topNews = searchResult.news.value;

        for (const result of topNews) {
          const topic = result.name; // Extracting the topic from Bing search result
          const articleLink = result.url; // Extracting the article link
          const description = result.description; // Extracting the article link
          const provider = result.provider; // Extracting the article link
          const images = result.image && result.image ? [result.image] : [];

          newsInfo.push({ topic, description, articleLink, images, provider });
        }
      }

      const completion = await openai.chat.completions.create({
        model: "gpt-4", // Adjust the model according to your preference
        messages: [
          {
            role: "system",
            content: `Here are the search results from Bing for '${query}'. Based on these search results and information, create a beautiful response as long as possible.`,
          },
          { role: "system", content: `Topics and related information:` },
          ...searchInfo
            .map((info) => {
              return [
                { role: "system", content: `**${info.description}**` },
                {
                  role: "system",
                  content: `You can read more about this topic here: ${info.articleLink}`,
                },
                {
                  role: "system",
                  content: `Here is an image related to the topic:`,
                },
                {
                  role: "system",
                  content:
                    info.images.length > 0
                      ? info.images[0]
                      : "No image available",
                },
              ];
            })
            .flat(),
        ],
      });

      const response = completion.choices[0].message.content.trim();
      res.json({ response, searchInfo, newsInfo });
      // res.json({ searchInfo, newsInfo });
      // res.json({  newsInfo });
    } else {
      res.status(404).json({ error: "No search results found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
