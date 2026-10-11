const express = require('express');
const router = express.Router();
const Clothing = require('../models/Clothing');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/clothing
// @desc    Get all clothing listings with search and multi-filtering
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { search, category, size, condition, location, owner, status } = req.query;
    let query = {};

    // Search by title or brand (case-insensitive)
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { brand: searchRegex }
      ];
    }

    // Filter by category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Filter by size
    if (size && size !== 'All') {
      query.size = size;
    }

    // Filter by condition
    if (condition && condition !== 'All') {
      query.condition = condition;
    }

    // Filter by location / city
    if (location && location.trim() !== '') {
      query.location = new RegExp(location.trim(), 'i');
    }

    // Filter by specific owner
    if (owner) {
      query.owner = owner;
    }

    // Status filter (default to 'Available' for public marketplace unless specified)
    if (status && status !== 'All') {
      query.status = status;
    } else if (!owner && !status) {
      // If browsing marketplace in general, show Available items by default
      query.status = 'Available';
    }

    const listings = await Clothing.find(query)
      .populate('owner', 'name email location profileImage')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: listings.length,
      data: listings
    });
  } catch (error) {
    console.error('Error fetching listings:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching listings'
    });
  }
});

// @route   GET /api/clothing/my/items
// @desc    Get all clothing listings belonging to the authenticated user
// @access  Private
router.get('/my/items', protect, async (req, res) => {
  try {
    const myListings = await Clothing.find({ owner: req.user._id })
      .populate('owner', 'name email location profileImage')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: myListings.length,
      data: myListings
    });
  } catch (error) {
    console.error('Error fetching user listings:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving your listings'
    });
  }
});

// @route   GET /api/clothing/:id
// @desc    Get single clothing listing by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const item = await Clothing.findById(req.params.id)
      .populate('owner', 'name email location profileImage createdAt');

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Clothing listing not found'
      });
    }

    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('Error fetching item details:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Invalid item ID format'
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching item details'
    });
  }
});

// @route   POST /api/clothing
// @desc    Create a new clothing listing
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      brand,
      size,
      condition,
      estimatedValue,
      image,
      location
    } = req.body;

    // Validate required fields
    if (!title || !description || !category || !brand || !size || !condition || estimatedValue === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, description, category, brand, size, condition, and estimatedValue'
      });
    }

    // Default image if none provided
    const itemImage = image && image.trim() !== ''
      ? image.trim()
      : 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80';

    const itemLocation = location && location.trim() !== ''
      ? location.trim()
      : (req.user.location || 'New York, NY');

    const newListing = await Clothing.create({
      title: title.trim(),
      description: description.trim(),
      category,
      brand: brand.trim(),
      size,
      condition,
      estimatedValue: Number(estimatedValue),
      image: itemImage,
      location: itemLocation,
      owner: req.user._id,
      status: 'Available'
    });

    const populatedListing = await Clothing.findById(newListing._id)
      .populate('owner', 'name email location profileImage');

    res.status(201).json({
      success: true,
      message: 'Clothing item listed successfully',
      data: populatedListing
    });
  } catch (error) {
    console.error('Error creating listing:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error creating listing'
    });
  }
});

// @route   PUT /api/clothing/:id
// @desc    Update a clothing listing (Owner or Admin only)
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const item = await Clothing.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Clothing listing not found'
      });
    }

    // Authorization check: Only the owner or an admin can update
    const isOwner = item.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this listing'
      });
    }

    const {
      title,
      description,
      category,
      brand,
      size,
      condition,
      estimatedValue,
      image,
      location,
      status
    } = req.body;

    if (title) item.title = title.trim();
    if (description) item.description = description.trim();
    if (category) item.category = category;
    if (brand) item.brand = brand.trim();
    if (size) item.size = size;
    if (condition) item.condition = condition;
    if (estimatedValue !== undefined) item.estimatedValue = Number(estimatedValue);
    if (image) item.image = image.trim();
    if (location) item.location = location.trim();
    if (status) item.status = status;

    await item.save();

    const updatedItem = await Clothing.findById(item._id)
      .populate('owner', 'name email location profileImage');

    res.json({
      success: true,
      message: 'Listing updated successfully',
      data: updatedItem
    });
  } catch (error) {
    console.error('Error updating listing:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error updating listing'
    });
  }
});

// @route   DELETE /api/clothing/:id
// @desc    Delete a clothing listing (Owner or Admin only)
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const item = await Clothing.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Clothing listing not found'
      });
    }

    // Authorization check
    const isOwner = item.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this listing'
      });
    }

    await Clothing.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Listing deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting listing:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error deleting listing'
    });
  }
});

module.exports = router;
