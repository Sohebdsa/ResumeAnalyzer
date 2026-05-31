const mongoose = require('mongoose')

let isConnected = false

async function connectDB() {
  if (isConnected) return

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: 'resumiq',
    })
    isConnected = true
    console.log('✅ MongoDB connected → resumiq database')
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message)
    process.exit(1)
  }
}

module.exports = connectDB
