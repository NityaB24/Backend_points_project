const mongoose = require ('mongoose');
const config = require('config');
//config .get works on the environment variable
mongoose.connect(`mongodb+srv://nityabalar:MuSU6Vi19FeoBTfj@cluster0.zkklb2h.mongodb.net/test_react_native`) 
.then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch((err) => {
    console.log('MongoDB connection error:', err);
  });

  // to setup environment variable 
  // export DEBUG=development:*       DEBUG = environment variable hai development:* means Development: ki sari chizz lena
  module.exports = mongoose.connection;