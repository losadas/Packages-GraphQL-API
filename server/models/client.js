const mongoose = require('mongoose') // MongoDB library

const ClientSchema = new mongoose.Schema(
  {
    name: {
      type: String
    },
    email: {
      type: String,
      unique: true
    },
    password: {
      type: String
    }
  },
  {
    versionKey: false
  }
)

module.exports = mongoose.model('Client', ClientSchema)
