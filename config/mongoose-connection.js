const mongoose = require ('mongoose');
const config = require('config');
const dbgr = require('debug') //development likha hai kyu ki hum abhi development phase mai hai isliye
//config .get works on the environment variable
mongoose.connect(`mongodb+srv://nityabalar:MuSU6Vi19FeoBTfj@cluster0.zkklb2h.mongodb.net/test_react_native`) //ye apne local host wale mongo se connect hota hai
.then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch((err) => {
    console.log('MongoDB connection error:', err);
  });

  // to setup environment variable 
  // export DEBUG=development:*       DEBUG = environment variable hai development:* means Development: ki sari chizz lena
  module.exports = mongoose.connection;