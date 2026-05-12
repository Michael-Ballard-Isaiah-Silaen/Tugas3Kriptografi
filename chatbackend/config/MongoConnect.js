const {MongoClient} = require("mongodb");

const connectionString = "mongodb://127.0.0.1:27017";
const client = new MongoClient(connectionString);

let db = null;

const MongoConnect = async () => {
  console.log("MONGODB | connecting to", connectionString);
  try{
    await client.connect();
    const database = client.db("Tucil3");
    db = database;
    console.log("MONGODB | connection okay");
    return database;
  } catch (err){
    console.error("MONGODB | connection failed");
    console.error(err);
    await client.close();
    return null;
  }
};

const MongoClose = async () => {
  try{
    console.log("MONGODB | closing connection");
    await client.close();
  } catch (error) {
    console.log("MONGODB | failed to close connection");
    // @ts-ignore
    console.error(err);
  }
};

const getDatabase = () => db;

module.exports = {MongoConnect, getDatabase, MongoClose};
