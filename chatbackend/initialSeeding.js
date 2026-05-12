const User = require("./models/User");
const {getHashedString} = require("./helpers/bcrypt");

const createIfNotExists = async (Model, query, data) => {
  const existingItem = await Model.findOne(query);
  if (!existingItem){
    await Model.create(data);
  }
};

const initialSeeding = async () => {
  const defaultPassword = getHashedString("password123");
  const Users = [
    {email: "user1@gmail.com", username: "Michael Purcell"},
    {email: "user2@gmail.com", username: "Thaffariq Azka Rahmat"},
    {email: "user3@gmail.com", username: "Rafi Halliday"},
  ];
  for (const user of Users){
    await createIfNotExists(User, {email: user.email}, {
      email: user.email,
      username: user.username,
      password: defaultPassword,
    });
  }
  console.log("Database seeding done");
};

module.exports = initialSeeding;