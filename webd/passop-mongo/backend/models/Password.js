const mongoose = require('mongoose');

const passwordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  site: {
    type: String,
    required: [true, 'Site URL is required'],
    trim: true,
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    // This stores the AES-256-GCM encrypted string
  },
}, {
  timestamps: true,
});

// Compound index for faster user-specific queries
passwordSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Password', passwordSchema);
