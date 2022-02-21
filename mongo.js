const mongoose = require("mongoose");

// connect to mongodb use mongoose
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true})

const usersSchema = new mongoose.Schema({
  username: {type: String, required: true},
  logs: [{
    description: {type: String, required: true},
    duration: {type: Number, required: true},
    date: String
  }]
})

const User = mongoose.model('user', usersSchema);

exports.User = User;