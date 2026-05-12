const Chat = require("../models/Chat");
const {ObjectId} = require("mongodb");

class ChatController{
  static async createChat(req, res, next){
    try{
      const {userId} = req.body;
      const currentUserId = req.user.id; 
      if (!userId){
        throw {name: "BadRequest", message: "UserId of the guy who you're trying to contact is required"};
      }
      const result = await Chat.create(currentUserId, userId);
      res.status(201).json({ 
        message: "Chat created successfully", 
        chatId: result.insertedId 
      });
    } catch (error){
      if (error.message === "Chat exists"){
        return res.status(400).json({ message: "Chat already exists" });
      }
      next(error);
    }
  }
  static async getContacts(req, res, next){
    try{
      const currentUserId = req.user.id;
      const collection = await Chat.collection();
      const chats = await collection.aggregate([
        {
          $match: { participants: new ObjectId(currentUserId) }
        },
        {
          $lookup: {
            from: "Users",          
            localField: "participants",
            foreignField: "_id",
            as: "participants"
          }
        },
        {
          $project: {
            "participants.password": 0,
            "participants.encryptedPrivateKey": 0,
            "participants.salt": 0
          }
        }
      ]).toArray();
      res.status(200).json(chats);
    } catch (error){
      next(error);
    }
  }
  static async getChatById(req, res, next){
    try{
      const {chatId} = req.params;
      const currentUserId = req.user.id;
      const collection = await Chat.collection();
      const chat = await collection.findOne({ 
        _id: new ObjectId(chatId),
        participants: new ObjectId(currentUserId)
      });
      if (!chat){
        throw { name: "NotFound", message: "Chat not found or unauthorized" };
      }
      res.status(200).json(chat);
    } catch (error){
      next(error);
    }
  }
}

module.exports = ChatController;