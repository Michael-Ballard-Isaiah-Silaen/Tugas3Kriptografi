const express = require("express");
const ChatController = require("../controllers/ChatController");
const authentication = require("../middlewares/Authentication");

const router = express.Router();
router.use(authentication);
router.post("/", ChatController.createChat);
router.get("/", ChatController.getContacts);

module.exports = router;