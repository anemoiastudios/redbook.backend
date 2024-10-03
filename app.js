const express = require("express");
const mongoose = require("mongoose");
const userController = require("./controllers/userController");
const channelController = require("./controllers/channelController");
const postController = require('../controllers/postController');
const timelinePostController = require("./controllers/timelinePostController");
const { swaggerUi, specs } = require("./swagger");
const cors = require("cors");
require("dotenv").config();

// Connect to DB
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB", err);
  });

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger UI setup
app.use("/docs", swaggerUi.serve, swaggerUi.setup(specs));

// User routes
app.get("/user/get/all", userController.getAllUsers);
app.get("/user/get/:username", userController.getUserByUsername);
app.post("/user/create", userController.createUser);
app.post("/user/login", userController.loginUser);
app.put("/user/update/:username", userController.updateUserByUsername);
app.delete("/user/delete/:username", userController.deleteUserByUsername);
app.get("/user/get/following/:username", userController.getFollowing);
app.get("/user/get/followers/:username", userController.getFollowers);

// Channel routes
app.get("/channel/all", channelController.getAllChannels);
app.post("/channel/create", channelController.createChannel);

app.post("/post/create", timelinePostController.createPost);
app.get("/feed/:username", timelinePostController.getUserFeed);
app.post(
  "/post/read/:postId/username/:username",
  timelinePostController.markPostAsRead
);

// Post Routes
router.post('/:id/like', postController.likePost);
router.delete('/:id', postController.deletePost);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
