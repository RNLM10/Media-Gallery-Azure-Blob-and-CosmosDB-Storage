const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { CosmosClient } = require("@azure/cosmos");
require("dotenv").config();

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

const client = new CosmosClient({
  endpoint: process.env.COSMOS_ENDPOINT,
  key: process.env.COSMOS_KEY,
});

const database = client.database("mediaMetaDB");
const container = database.container("files");

app.post("/api/metadata", async (req, res) => {
  try {
    const metadata = req.body;
    const { resource } = await container.items.create(metadata);
    res.status(200).json(resource);
  } catch (error) {
    console.error("Cosmos DB Error:", error.message);
    res.status(500).json({ error: "Failed to store metadata" });
  }
});

app.get("/api/metadata", async (req, res) => {
  try {
    const querySpec = { query: "SELECT * FROM c" };
    const { resources } = await container.items.query(querySpec).fetchAll();
    res.json(resources);
  } catch (err) {
    res.status(500).json({ error: "Could not fetch metadata" });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
