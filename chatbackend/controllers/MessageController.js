const Message = require("../models/Message");
const Chat = require("../models/Chat");
const {ObjectId} = require("mongodb");

class MessageController{
  static async createMessage(req, res, next){
    try{
      const {chatId, ciphertext, iv, mac} = req.body;
      const senderId = req.user.id;
      if (!chatId || !ciphertext || !iv){
        throw {name: "BadRequest", message: "chatId, ciphertext, and iv are required"};
      }
      const chatCollection = await Chat.collection();
      const chat = await chatCollection.findOne({
        _id: new ObjectId(chatId),
        participants: new ObjectId(senderId)
      });
      if (!chat){
        throw { name: "NotFound", message: "Chat not found or you are not part of it" };
      }
      const result = await Message.create({ 
        chatId, 
        senderId, 
        ciphertext,
        iv,
        mac
      });
      res.status(201).json({ 
        message: "Message sent", 
        messageId: result.insertedId 
      });
    } catch (error){
      next(error);
    }
  }
  
  static async getMessages(req, res, next){
    try{
      const {chatId} = req.params;
      const userId = req.user.id;
      const chatCollection = await Chat.collection();
      const chat = await chatCollection.findOne({
        _id: new ObjectId(chatId),
        participants: new ObjectId(userId)
      });
      if (!chat){
        throw { name: "NotFound", message: "Chat not found or you are unauthorized to view, get lost" };
      }
      const messages = await Message.findAll({chatId: new ObjectId(chatId)});
      res.status(200).json(messages);
    } catch (error){
      next(error);
    }
  }
}

module.exports = MessageController;