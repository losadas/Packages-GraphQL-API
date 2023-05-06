const mongoose = require('mongoose') // MongoDB library

const PackageSchema = new mongoose.Schema(
  {
    specs: {
      type: Object
    },
    date: {
      type: String
    },
    time: {
      type: String
    },
    pickCity: {
      type: String
    },
    pickAddress: {
      type: String
    },
    destCity: {
      type: String
    },
    destAddress: {
      type: String
    },
    nameDest: {
      type: String
    },
    nitDest: {
      type: String
    },
    status: {
      type: String,
      enum: ['Saved', 'Canceled', 'Completed']
    },
    clientID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client'
    }
  },
  {
    versionKey: false,
    timestamps: true
  }
)

module.exports = mongoose.model('Package', PackageSchema)
