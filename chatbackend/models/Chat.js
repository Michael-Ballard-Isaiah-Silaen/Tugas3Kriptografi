const {ObjectId} = require("mongodb");
const {getDatabase} = require("../config/MongoConnect");

class Chat{
  constructor({_id, participants}){
    Object.assign(this, {_id, participants});
  }
  static async collection(){
    return getDatabase().collection("Chats");
  }
  static async create(userId1, userId2){
    const collection = await Chat.collection();
    const existingChat = await collection.findOne({
      participants: {$all: [new ObjectId(userId1), new ObjectId(userId2)]}
    });
    if (existingChat){
      throw new Error("Chat exists");
    }
    const result = await collection.insertOne({
      participants: [new ObjectId(userId1), new ObjectId(userId2)]
    });
    return result;
  }
  static async findAllByUserId(userId){
    const collection = await Chat.collection();
    const data = await collection.find({ participants: new ObjectId(userId) }).toArray();
    return data.map((el) => new Chat(el));
  }
}

module.exports = Chat;