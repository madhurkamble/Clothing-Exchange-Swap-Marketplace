const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Clothing = require('../models/Clothing');
const SwapRequest = require('../models/SwapRequest');
const { protect, admin } = require('../middleware/authMiddleware');

// All routes in this file require both authentication AND admin role
router.use(protect, admin);

// @route   GET /api/admin/analytics
// @desc    Get overall platform analytics, user stats, and swap metrics
// @access  Private (Admin only)
router.get('/analytics', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const adminCount = await User.countDocuments({ role: 'admin' });
    const standardUsers = totalUsers - adminCount;

    const totalListings = await Clothing.countDocuments();
    const availableListings = await Clothing.countDocuments({ status: 'Available' });
    const swappedListings = await Clothing.countDocuments({ status: 'Swapped' });
    const requestedListings = await Clothing.countDocuments({ status: 'Swap Requested' });

    const totalSwaps = await SwapRequest.countDocuments();
    const pendingSwaps = await SwapRequest.countDocuments({ status: 'Pending' });
    const acceptedSwaps = await SwapRequest.countDocuments({ status: 'Accepted' });
    const negotiatingSwaps = await SwapRequest.countDocuments({ status: 'Negotiating' });
    const completedSwaps = await SwapRequest.countDocuments({ status: 'Completed' });
    const rejectedSwaps = await SwapRequest.countDocuments({ status: 'Rejected' });
    const cancelledSwaps = await SwapRequest.countDocuments({ status: 'Cancelled' });

    // Category distribution breakdown
    const categoryStats = await Clothing.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: totalUsers, // in demo environment
          regular: standardUsers,
          admins: adminCount
        },
        listings: {
          total: totalListings,
          available: availableListings,
          swapped: swappedListings,
          pendingTrade: requestedListings,
          byCategory: categoryStats
        },
        swaps: {
          total: totalSwaps,
          pending: pendingSwaps,
          accepted: acceptedSwaps,
          negotiating: negotiatingSwaps,
          completed: completedSwaps,
          rejected: rejectedSwaps,
          cancelled: cancelledSwaps,
          successRate: totalSwaps > 0 ? Math.round((completedSwaps / totalSwaps) * 100) : 0
        }
      }
    });
  } catch (error) {
    console.error('Error fetching admin analytics:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving analytics' });
  }
});

// @route   GET /api/admin/users
// @desc    Get all registered users with summary info
// @access  Private (Admin only)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    // Fetch listing count for each user
    const usersWithStats = await Promise.all(
      users.map(async (u) => {
        const listingsCount = await Clothing.countDocuments({ owner: u._id });
        const swapsCount = await SwapRequest.countDocuments({
          $or: [{ requester: u._id }, { owner: u._id }]
        });
        return {
          ...u.toObject(),
          listingsCount,
          swapsCount
        };
      })
    );

    res.json({
      success: true,
      count: usersWithStats.length,
      data: usersWithStats
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/admin/users/:id/role
// @desc    Update user role (user/admin)
// @access  Private (Admin only)
router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.role = role;
    await user.save();

    res.json({
      success: true,
      message: `User role updated to ${role}`,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/admin/clothing
// @desc    Get all clothing listings across platform
// @access  Private (Admin only)
router.get('/clothing', async (req, res) => {
  try {
    const listings = await Clothing.find()
      .populate('owner', 'name email location')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: listings.length,
      data: listings
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/admin/clothing/:id
// @desc    Admin moderation: remove inappropriate or violating listing
// @access  Private (Admin only)
router.delete('/clothing/:id', async (req, res) => {
  try {
    const item = await Clothing.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    await Clothing.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Listing removed by administrator moderation'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/admin/swaps
// @desc    Monitor all platform swap requests
// @access  Private (Admin only)
router.get('/swaps', async (req, res) => {
  try {
    const swaps = await SwapRequest.find()
      .populate('requester', 'name email location')
      .populate('owner', 'name email location')
      .populate('offeredItem', 'title brand estimatedValue image')
      .populate('requestedItem', 'title brand estimatedValue image')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: swaps.length,
      data: swaps
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
