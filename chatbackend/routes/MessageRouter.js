const express = require("express");
const MessageController = require("../controllers/MessageController");
const authentication = require("../middlewares/Authentication");

const router = express.Router();

router.use(authentication);
router.post("/", MessageController.createMessage);
router.get("/:chatId", MessageController.getMessages);

module.exports = router;