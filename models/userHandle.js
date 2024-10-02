const mongoose = require("mongoose");

const userHandleSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  followers: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User",
  },
  following: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User",
  },
});

module.exports = mongoose.model("UserHandle", userHandleSchema);
