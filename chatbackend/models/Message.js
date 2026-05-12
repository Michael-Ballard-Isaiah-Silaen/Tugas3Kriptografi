const {ObjectId} = require("mongodb");
const {getDatabase} = require("../config/MongoConnect");

class Message {
  constructor({_id, chatId, senderId, ciphertext, iv, mac, timestamp}){
    Object.assign(this, {_id, chatId, senderId, ciphertext, iv, mac, timestamp});
  }
  static async collection(){
    return getDatabase().collection("Messages");
  }
  static async create({chatId, senderId, ciphertext, iv, mac}){
    const collection = await Message.collection();
    const result = await collection.insertOne({
      chatId: new ObjectId(chatId),
      senderId: new ObjectId(senderId),
      ciphertext: ciphertext,
      iv: iv,
      mac: mac || null,
      timestamp: new Date(),
    });
    return result;
  }
  static async findAll(query){
    const collection = await Message.collection();
    const data = await collection.find(query).sort({ timestamp: 1 }).toArray();
    return data.map((el) => new Message(el));
  }
}

module.exports = Message;