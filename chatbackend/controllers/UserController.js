const User = require("../models/User");

class UserController {
  static async getAllUsers(req, res, next){
    try{
      const collection = await User.collection();
      const users = await collection.find({}, {projection: {password: 0}}).toArray();
      res.status(200).json(users);
    } catch (error){
      next(error);
    }
  }
}

module.exports = UserController;