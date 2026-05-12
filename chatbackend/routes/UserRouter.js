const express = require("express");
const UserController = require("../controllers/UserController");
const authentication = require("../middlewares/Authentication");

const router = express.Router();
router.use(authentication);
router.get("/", UserController.getAllUsers);
router.get("/:userId/public-key", UserController.getUserPublicKey);

module.exports = router;