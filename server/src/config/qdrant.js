const { QdrantClient } = require("@qdrant/js-client-rest")
const env = require("./env");


const qdrantClient =  new QdrantClient({
    url:env.qdrant.url,
    apiKey:env.qdrant.apiKey,
});

module.exports = qdrantClient;