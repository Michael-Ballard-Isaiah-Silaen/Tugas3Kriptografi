const express = require("express");
const UserController = require("../controllers/UserController");
const authentication = require("../middlewares/Authentication");

const router = express.Router();
router.use(authentication);
router.get("/", UserController.getAllUsers);

module.exports = router;