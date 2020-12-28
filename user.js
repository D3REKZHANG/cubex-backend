const mongoose = require('mongoose');
const user = new mongoose.Schema({
    username: String,
    password: String,
    timeData: []
});

module.exports = mongoose.model("User", user);
