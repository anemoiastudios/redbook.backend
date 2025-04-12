const express = require("express");
const mongoose = require("mongoose");
const userController = require("./controllers/userController");
const channelController = require("./controllers/channelController");
const chatController = require('./controllers/chatController');
const postController = require('./controllers/postcontroller');
const timelinePostController = require("./controllers/timelinePostController");
const notificationController = require("./controllers/notificationController");
const archivesController = require("./controllers/archivesController");
const passwordResetController = require("./controllers/passwordResetController");
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
const PORT = 3001;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], // allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'] //  headers
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger UI setup
app.use("/docs", swaggerUi.serve, swaggerUi.setup(specs));

// User routes
app.get("/user/get/all", userController.getAllUsers);
app.get("/user/get/:username", userController.getUserByUsername);
app.get("/user/uri/:userId", userController.getURIById);
app.put("/user/update/uri/:userId", userController.updateUserURI);
app.post("/user/create", userController.createUser);
app.post("/user/login", userController.loginUser);
app.put("/user/update/:username", userController.updateUserByUsername);
app.delete("/user/delete/:username", userController.deleteUserByUsername);
app.post("/user/follow/:username", userController.follow);
app.get("/user/get/following/:username", userController.getFollowing);
app.get("/user/get/followers/:username", userController.getFollowers);
app.get("/user/get/username/:userId", userController.getUsernameById);
//User verification Routes
app.post("/user/request-password-reset", userController.requestPasswordReset);
app.post("/user/reset-password", userController.resetPassword);

// Channel routes
app.get("/channel/all", channelController.getAllChannels);
app.post("/channel/create", channelController.createChannel);
app.get('/user/get/chats/:username', chatController.getUserChats);
app.get('/chat/get/:chatId', chatController.getChatContents);
app.post('/chat/new', chatController.createNewChat);
app.get('/chat/participants/get/:chatId', chatController.getChatParticipants)
app.post('/chat/:chatId/message', chatController.sendMessage);


app.post("/post/create", timelinePostController.createPost);
app.get("/feed/:username", timelinePostController.getUserFeed);
app.get("/posts/:username", timelinePostController.getUserPosts);
app.post(
  "/post/read/:postId/username/:username",
  timelinePostController.markPostAsRead
);
app.post(
  "/post/:postId/markNotified/:username",
  timelinePostController.markPostAsNotified
);
app.post("/post/update/:postId/username/:username", timelinePostController.updatePost);

// Post Routes
app.post('/:id/like', postController.likePost);
app.delete('/:id', postController.deletePost);

// Notification Routes
app.get("/notification/get/:userId", notificationController.getNotifications);
app.put("/notification/read/:notificationId", notificationController.markAsRead);
app.post("/notification/create", notificationController.createNotification);

// Archives Routes
app.get('/archives', archivesController.getArchives);


// Forgot password Route
app.post("/forgot-password", passwordResetController.requestPasswordReset);
app.post("/reset-password", passwordResetController.resetPassword);
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
