const express = require("express");
const AuthRouter = require("./AuthRouter");
const UserRouter = require("./UserRouter");
const ChatRouter = require("./ChatRouter");
const MessageRouter = require("./MessageRouter");

const router = express.Router();

router.get("/", (req, res) => {
  res.send("Backend is here :>");
});

router.use("/auth", AuthRouter);
router.use("/users", UserRouter);
router.use("/chats", ChatRouter);
router.use("/messages", MessageRouter);

module.exports = router;