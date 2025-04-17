import { CosmosClient } from "@azure/cosmos";

// Environment variables from .env file
const endpoint = import.meta.env.VITE_COSMOS_ENDPOINT;
const key = import.meta.env.VITE_COSMOS_KEY;

// Cosmos DB configuration
const databaseId = "mediaMetaDB";
const containerId = "files";

// Create Cosmos client instance
const client = new CosmosClient({ endpoint, key });

// Access database and container
const database = client.database(databaseId);
const container = database.container(containerId);

// Export container for queries (CRUD)
export default container;
