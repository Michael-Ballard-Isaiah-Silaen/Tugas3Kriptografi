const express = require("express");
const AuthController = require("../controllers/AuthController");
const authentication = require("../middlewares/Authentication");

const router = express.Router();

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.get("/user-info", authentication, AuthController.getUserInfo);

module.exports = router;