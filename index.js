const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const port = process.env.ElasticSearch_API_Port || 4001;
const { Client } = require("@elastic/elasticsearch");

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "*",
    credentials: true,
    exposedHeaders: [],
  })
);
app.use(compression());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.listen(port, () => console.log(`API server running on localhost:${port}`));
// const client = new Client({
//   // node: "http://localhost:9200",
//   // auth: {
//   //   username: "elastic",
//   //   password: "sudhakar"
//   // }
//   // node: "https://ml.sizecorner.com/elastic",
//   node: "https://gra1.logs.ovh.com:9200",
//   auth: {
//     username: "logs-cy-32623",
//     password: "SizeInterface123!"
//   }
// });

const client = new Client({
  node: 'http://localhost:9200'
})

app.get("/gethealth", (req, res) => {
  client.ping({}, (error) => {
    if (error) {
      console.trace(error);
      res.send({
        message: "error",
        response: "cluster is down!",
      });
    } else {
      res.send({ message: "success", response: "cluster is up!" });
    }
  });
});

app.post("/getSearchResult", (req, res) => {
  const response = client.search({
    index: req.body.index,
    body: req.body.query,
  });
  response
    .then((data) => {
      res.send(data);
    })
    .catch((error) => {
      res.send({ message: "error", response: error });
    });
});

app.put("/updateWatchlist", (req, res) => {
  const response = client.index({
    index: req.body.index,
    type: "_doc",
    id: req.body.id,
    body: { doc: req.body.data },
  });
  response
    .then((data) => {
      res.send(data);
    })
    .catch((error) => {
      res.send({ message: "error", response: error });
    });
});

