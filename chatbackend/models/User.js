const { ObjectId } = require("mongodb");
const { getDatabase } = require("../config/MongoConnect");

class User {
  constructor({_id, email, password, username}){
    Object.assign(this, {_id, email, password, username});
  }
  static async collection(){
    return getDatabase().collection("Users");
  }
  static async findOne(query){
    const collection = await User.collection();
    return await collection.findOne(query);
  }
  static async create(userData){
    const collection = await User.collection();
    const newUser = {
      email: userData.email,
      password: userData.password,
      username: userData.username,
    };
    return await collection.insertOne(newUser);
  }
  static async findAll(query){
    const collection = await User.collection();
    const data = await collection.find(query).toArray();
    return data.map((el) => new User(el));
  }
  static async updateById(_id, updateDoc){
    const collection = await User.collection();
    return await collection.updateOne({ _id: new ObjectId(_id) }, updateDoc);
  }
}

module.exports = User;