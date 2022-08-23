var express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const port = process.env.ElasticSearch_API_Port || 4001;
const { Client } = require("@elastic/elasticsearch");
const {
  QueryBuild,
  queryLogic,
  getSizeCode,
} = require("../controller/QueryBuild");
const { ListBrands } = require("../controller/Brands");
const { FitQueryBuild, queryFittedLogic } = require("../controller/fitQuery");
const { TopQueryBuild, queryTopLogic } = require("../controller/TopDress");
const { lastQueryBuild, lastqueryLogic } = require("../controller/LastBuild");
let cat = [
  "Men",
  "Women",
  "WOMENS",
  "WOMENS",
  "Men'S Shirts",
  "Men'S Shirts",
  "Men'S Trousers",
  "Men'S Trousers",
  "Women'S Kurtas",
  "Women'S Kurtas",
  "Men'S Jeans",
  "Men'S Jeans",
  "Women'S T-Shirts",
  "Women'S T-Shirts",
  "Women'S Jeans",
  "Women'S Jeans",
  "MENS",
  "MENS",
  "Men'S T-Shirts",
  "Men'S T-Shirts",
  "Women'S Capris",
  "Women'S Capris",
  "Women'S Tops",
  "Women'S Tops",
  "Men'S Shorts",
  "Men'S Shorts",
  "Women'S Shirts",
  "Women'S Shirts",
  "Women'S Dresses",
  "Women'S Dresses",
  "Men'S Cargos",
  "Men'S Cargos",
  "Women'S Shorts",
  "Women'S Shorts",
  "Women'S Trousers",
  "Women'S Trousers",
  "Men'S Three-Fourths",
  "Men'S Three-Fourths",
  "Women'S Tights",
  "Women'S Tights",
  "Women'S Skirts",
  "Women'S Skirts",
  "Men's Shirts",
  "Men's Shirts",
  "Men's Pants",
  "Men's Pants",
  "Mens Shirts",
  "Mens Shirts",
  "Mens Shorts",
  "Mens Shorts",
  "Men's Shorts",
  "Men's Shorts",
  "Womens Pants",
  "Womens Pants",
  "Mens Swimwear",
  "Mens Swimwear",
  "Mens",
  "Mens",
  "Mens Pants",
  "Mens Pants",
  "Womens Leggings",
  "Womens Leggings",
  "Men's Gilets",
  "Men's Gilets",
  "Men's Overcoats",
  "Men's Overcoats",
  "Womens Workwear",
  "Womens Workwear",
  "Men's Bottoms",
  "Men's Bottoms",
  "Men's Hoodies",
  "Men's Hoodies",
  "Men's Jeans",
  "Men's Jeans",
  "Womens",
  "Womens",
  "Womens Jumpsuits",
  "Womens Jumpsuits",
  "Womens Playsuits",
  "Womens Playsuits",
  "Mens Businesswear",
  "Mens Businesswear",
  "Mens Jeans",
  "Mens Jeans",
  "Mens Workwear",
  "Mens Workwear",
  "Men's",
  "Men's",
  "Mens Chinos",
  "Mens Chinos",
  "Neck",
  "Set",
  "bottom",
  "activewear",
  "Mesh",
  "Neck",
  "DRESSES",
  "Clothing",
  "Bottomwear",
  "Topwear",
  "SALE",
  "Basic",
  "Printed",
  "Briefs",
  "Logo",
  "tops",
  "Activewear",
  "Active",
  "Camo",
  "Training",
  "Mesh",
  "Neck",
  "Long",
  "bottoms",
  "T-shirt",
  "top",
  "shirts",
  "Running",
  "Print",
  "Zip",
  "'T-Shirts",
  "3",
  "3/4",
  "Colour-Blockedjacket",
  "Business",
  "Distressed",
  "Through",
  "dress",
  "Frontier",
  "Flex",
  "Everyday",
  "Fluro",
  "Dress",
  "Core",
  "&",
  "Aviator",
  "Basketball",
  "Bonded",
  "Industrial",
  "Levi's",
  "Parkas",
  "Core",
  "Bonded",
  "Innerwear",
  "Micro",
  "Over",
  "New",
  "Larger",
  "Length",
  "Flannel",
  "Hotpants",
  "On",
  "Oversized",
  "Panel",
  "Pack",
  "Half",
  "Looks",
  "ACTIVEWEAR",
  "Singlets",
  "Culottes",
  "Parka",
  "Performance",
  "Protection",
  "Quilted",
  "Tee",
  "Trail",
  "V",
  "Pull",
  "Everlast",
  "Maternity",
  "Fluorescent",
  "TOPS",
  "T-shirts",
  "Stripe",
  "Animal",
  "Short",
  "Crew",
  "Fleece",
  "Street",
  "Top",
  "Interlock",
  "Size",
  "Skinny",
  "Skorts",
  "Solidjeans",
  "Studio",
  "Woven",
  "and",
  "nighties",
  "Utility",
  "Shell",
  "Reflective",
  "Shirt",
  "T-Shirts",
];
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

header = {
  "Content-Type": "application/json",
  Authorization: "Basic " + process.env.Elastic_Auth_Token,
};
const client = new Client({
  node: "https://elasticsearch.kasadara.kasadara.use1.k8g8.com/"
});
/* GET home page. */
app.get("/", async function (req, res, next) {
  res.status(200).json({
    Title: "Size Corner",
    name: "https://elasticsearch.kasadara.kasadara.use1.k8g8.com/",
  });
});
app.get("/gethealth", (req, res) => {
  client.ping({}, (error) => {
    if (error) {
      console.trace(error);
      res.status(500).json({
        message: "errorrrrrr",
        response: "cluster is down!",
      });
    } else {
      res.status(200).json({ message: "successssss", response: "cluster is up!" });
    }
  });
});

app.post("/getSearchResult", async (req, res) => {
  try {
    let sizeQuery = await getSizeCode({ country: req.body.location });
    const sizeCodeResponse = await client.search({
      index: process.env.ELasic_Node_Index,
      body: sizeQuery,
    });
    req.body.sizeCode = sizeCodeResponse?.body?.aggregations?.size.buckets.map(
      (e) => e.key
    );

    let res_query = await QueryBuild(req.body);
    
    const responseValue = await client.search({
      index: process.env.ELasic_Node_Index,
      body: JSON.stringify(res_query.query),
    });
    
    let allProducts = [];
    let productsTotal;
    let aggregations;
    if (res_query.allSearch.length !== 0) {
      let allProductsResult = await queryLogic(
        responseValue,
        res_query.measurementsUnit,
        res_query.allSearch,
        res_query.choosenList,
        res_query.NoSortInidicator
      );
      productsTotal = allProductsResult.body.hits.total;
      aggregations = allProductsResult.body.aggregations;
      allProductsResult.body.hits.hits.forEach((data) => {
        allProducts.push(data);
      });
    } else {
      responseValue.body.hits.hits.forEach(({ _source }) => {
        allProducts.push(_source);
      });
      productsTotal = responseValue.body.hits.total;
      aggregations = responseValue.body.aggregations;
    }

    res.status(200).json({
      products: allProducts,
      productsTotal: productsTotal,
      aggergation: aggregations,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      error: true,
      message: err,
    });
  }
});
app.post("/lastPurchaseResult", async (req, res) => {
  try {
    let res_query = await lastQueryBuild(req.body);
    const responseValue = await client.search({
      index: process.env.ELasic_Node_Index,
      body: JSON.stringify(res_query.query),
    });

    let allProducts = [];
    let productsTotal;
    let aggregations;
    responseValue.body.hits.hits.forEach(({ _source }) => {
      allProducts.push(_source);
    });
    productsTotal = responseValue.body.hits.total;
    aggregations = responseValue.body.aggregations;

    // }

    res.status(200).json({
      products: allProducts,
      productsTotal: productsTotal,
      aggergation: aggregations,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      error: true,
      message: err,
    });
  }
});
app.post("/getFittedSizeResult", async (req, res) => {
  try {
    let sizeQuery = await getSizeCode({ country: req.body.location });
    const sizeCodeResponse = await client.search({
      index: process.env.ELasic_Node_Index,
      body: sizeQuery,
    });
    req.body.sizeCode = sizeCodeResponse?.body?.aggregations?.size.buckets.map(
      (e) => e.key
    );

    let res_query = await FitQueryBuild(req.body);
    const responseValue = await client.search({
      index: process.env.ELasic_Node_Index,
      body: JSON.stringify(res_query.query),
    });

    let allProducts = [];

    if (res_query.allSearch.length !== 0) {
      let allProductsResult = await queryFittedLogic(
        responseValue,
        res_query.measurementsUnit,
        res_query.allSearch,
        res_query.choosenList,
        res_query.indicator
      );

      allProductsResult.body.hits.hits.forEach((data) => {
        allProducts.push(data);
      });
    } else {
      responseValue.body.hits.hits.forEach(({ _source }) => {
        allProducts.push(_source);
      });
    }

    res.status(200).json({
      products: allProducts,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      error: true,
      message: err,
    });
  }
});
app.post("/getTopDressesResult", async (req, res) => {
  try {
    let sizeQuery = await getSizeCode({ country: req.body.location });
    const sizeCodeResponse = await client.search({
      index: process.env.ELasic_Node_Index,
      body: sizeQuery,
    });
    req.body.sizeCode = sizeCodeResponse?.body?.aggregations?.size.buckets.map(
      (e) => e.key
    );
    req.body.categoriesList =
      sizeCodeResponse?.body?.aggregations?.categories.buckets
        .filter((e) => e.key.split(" ").length < 2 && !cat.includes(e.key))
        .map((e) => e.key);
    req.body.brandsList =
      sizeCodeResponse?.body?.aggregations?.brand.buckets.map((e) => e.key);

    let res_query = await TopQueryBuild(req.body);
    let allProducts = [];
    res_query.forEach(async (topQuery) => {
      topQuery.query.query.bool.filter[1] = topQuery.terms;

      let responsevalue = await client.search({
        index: process.env.ELasic_Node_Index,
        body: JSON.stringify(topQuery.query),
      });
      let allProductsResult = await queryTopLogic(
        responsevalue,
        topQuery.categorie
      );

      if (allProductsResult?._source) {
        delete allProductsResult?._source?.gender;
        delete allProductsResult?._source?.measurements;
        allProducts.push({
          source: allProductsResult?._source,
          TopCategory: allProductsResult?.TopCategory,
        });
      }
    });

    setTimeout(() => {
      res.status(200).json({
        products: allProducts,
      });
    }, [5000]);
  } catch (err) {
    console.log(err);
    res.status(400).json({
      error: true,
      message: err,
    });
  }
});
app.get("/listBrands", async (req, res) => {
  try {
    let res_brands = await ListBrands();

    const { body } = await client.search({
      index: process.env.ELasic_Node_Index,
      body: JSON.stringify(res_brands),
    });
    res.status(200).json({
      brands: body.aggregations.brand.buckets.map((brand) => brand.key),
    });
  } catch (err) {
    res.status(400).json({
      error: true,
      message: err,
    });
  }
});
app.get("/listPlatforms", async (req, res) => {
  try {
    let res_brands = await ListBrands();

    const { body } = await client.search({
      index: process.env.ELasic_Node_Index,
      body: JSON.stringify(res_brands),
    });

    res.status(200).json({
      platforms: body.aggregations.platform.buckets.map(
        (platform) => platform.key
      ),
    });
  } catch (err) {
    res.status(400).json({
      error: true,
      message: err,
    });
  }
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
