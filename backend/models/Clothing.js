const mongoose = require('mongoose');

const clothingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide an item title'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a detailed item description'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Please select a clothing category'],
    enum: ['Tops', 'Bottoms', 'Outerwear', 'Dresses', 'Activewear', 'Footwear', 'Accessories', 'Other'],
    default: 'Tops'
  },
  brand: {
    type: String,
    required: [true, 'Please specify the brand (e.g. Nike, Zara, Levi\'s)'],
    trim: true
  },
  size: {
    type: String,
    required: [true, 'Please select a size'],
    enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size', 'Other'],
    default: 'M'
  },
  condition: {
    type: String,
    required: [true, 'Please select the condition of the garment'],
    enum: ['New with tags', 'Like new', 'Gently used', 'Well worn'],
    default: 'Gently used'
  },
  estimatedValue: {
    type: Number,
    required: [true, 'Please provide an estimated swap value'],
    min: [0, 'Estimated value cannot be negative']
  },
  image: {
    type: String,
    default: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80'
  },
  location: {
    type: String,
    required: [true, 'Please provide your city/neighborhood location'],
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['Available', 'Swap Requested', 'Swapped', 'Unavailable'],
    default: 'Available'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Clothing', clothingSchema);
