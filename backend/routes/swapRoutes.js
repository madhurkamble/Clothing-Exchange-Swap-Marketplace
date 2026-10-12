const express = require('express');
const router = express.Router();
const SwapRequest = require('../models/SwapRequest');
const Clothing = require('../models/Clothing');
const { protect } = require('../middleware/authMiddleware');
const { calculateSwapBalance } = require('../utils/swapValueCalculator');

// @route   POST /api/swaps
// @desc    Initiate a new clothing swap request
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { requestedItemId, offeredItemId, message } = req.body;

    if (!requestedItemId || !offeredItemId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both requestedItemId and offeredItemId'
      });
    }

    // 1. Fetch both items
    const requestedItem = await Clothing.findById(requestedItemId);
    const offeredItem = await Clothing.findById(offeredItemId);

    if (!requestedItem) {
      return res.status(404).json({
        success: false,
        message: 'The requested clothing item was not found'
      });
    }

    if (!offeredItem) {
      return res.status(404).json({
        success: false,
        message: 'Your offered clothing item was not found'
      });
    }

    // 2. Validation: Self-swapping prevention
    if (requestedItem.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot initiate a swap request for your own clothing item'
      });
    }

    // 3. Validation: Verify ownership of offered item
    if (offeredItem.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only offer items from your own wardrobe'
      });
    }

    // 4. Validation: Availability check
    if (requestedItem.status === 'Swapped' || requestedItem.status === 'Unavailable') {
      return res.status(400).json({
        success: false,
        message: `The requested item is currently ${requestedItem.status.toLowerCase()} and cannot be traded`
      });
    }

    if (offeredItem.status === 'Swapped' || offeredItem.status === 'Unavailable') {
      return res.status(400).json({
        success: false,
        message: `Your offered item is currently ${offeredItem.status.toLowerCase()}`
      });
    }

    // 5. Validation: Duplicate active requests prevention
    const existingActiveRequest = await SwapRequest.findOne({
      requester: req.user._id,
      requestedItem: requestedItemId,
      offeredItem: offeredItemId,
      status: { $in: ['Pending', 'Accepted', 'Negotiating', 'Confirmed'] }
    });

    if (existingActiveRequest) {
      return res.status(400).json({
        success: false,
        message: 'An active swap request already exists for these garments'
      });
    }

    // 6. Create Swap Request
    const swapRequest = await SwapRequest.create({
      requester: req.user._id,
      owner: requestedItem.owner,
      offeredItem: offeredItemId,
      requestedItem: requestedItemId,
      message: message ? message.trim() : '',
      status: 'Pending'
    });

    const populatedSwap = await SwapRequest.findById(swapRequest._id)
      .populate('requester', 'name email location profileImage')
      .populate('owner', 'name email location profileImage')
      .populate('offeredItem')
      .populate('requestedItem');

    res.status(201).json({
      success: true,
      message: 'Swap request submitted successfully',
      data: populatedSwap
    });
  } catch (error) {
    console.error('Error creating swap request:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error creating swap request'
    });
  }
});

// @route   GET /api/swaps/incoming
// @desc    Get all incoming swap requests received by the user
// @access  Private
router.get('/incoming', protect, async (req, res) => {
  try {
    const incomingSwaps = await SwapRequest.find({ owner: req.user._id })
      .populate('requester', 'name email location profileImage phone')
      .populate('offeredItem')
      .populate('requestedItem')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: incomingSwaps.length,
      data: incomingSwaps
    });
  } catch (error) {
    console.error('Error fetching incoming swaps:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving incoming swap requests'
    });
  }
});

// @route   GET /api/swaps/outgoing
// @desc    Get all outgoing swap requests sent by the user
// @access  Private
router.get('/outgoing', protect, async (req, res) => {
  try {
    const outgoingSwaps = await SwapRequest.find({ requester: req.user._id })
      .populate('owner', 'name email location profileImage phone')
      .populate('offeredItem')
      .populate('requestedItem')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: outgoingSwaps.length,
      data: outgoingSwaps
    });
  } catch (error) {
    console.error('Error fetching outgoing swaps:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving outgoing swap requests'
    });
  }
});

// @route   GET /api/swaps/counts
// @desc    Get summary counts for dashboard
// @access  Private
router.get('/counts', protect, async (req, res) => {
  try {
    const incomingPending = await SwapRequest.countDocuments({
      owner: req.user._id,
      status: 'Pending'
    });

    const outgoingPending = await SwapRequest.countDocuments({
      requester: req.user._id,
      status: 'Pending'
    });

    const completedSwaps = await SwapRequest.countDocuments({
      $or: [{ owner: req.user._id }, { requester: req.user._id }],
      status: 'Completed'
    });

    res.json({
      success: true,
      data: {
        incomingPending,
        outgoingPending,
        completedSwaps
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving swap metrics' });
  }
});

// @route   GET /api/swaps/:id
// @desc    Get single swap request by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const swap = await SwapRequest.findById(req.params.id)
      .populate('requester', 'name email location profileImage phone')
      .populate('owner', 'name email location profileImage phone')
      .populate('offeredItem')
      .populate('requestedItem');

    if (!swap) {
      return res.status(404).json({
        success: false,
        message: 'Swap request not found'
      });
    }

    // Access check: Only involved parties or admin
    const isInvolved = swap.requester._id.toString() === req.user._id.toString() ||
                       swap.owner._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isInvolved && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this swap request'
      });
    }

    res.json({
      success: true,
      data: swap
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching swap request'
    });
  }
});

// @route   PUT /api/swaps/:id/accept
// @desc    Accept an incoming swap request (Owner only)
// @access  Private
router.put('/:id/accept', protect, async (req, res) => {
  try {
    const swap = await SwapRequest.findById(req.params.id);

    if (!swap) {
      return res.status(404).json({
        success: false,
        message: 'Swap request not found'
      });
    }

    if (swap.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the item owner can accept this swap request'
      });
    }

    swap.status = 'Accepted';
    await swap.save();

    res.json({
      success: true,
      message: 'Swap request accepted! You can now coordinate handover details.',
      data: swap
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/swaps/:id/reject
// @desc    Reject an incoming swap request (Owner only)
// @access  Private
router.put('/:id/reject', protect, async (req, res) => {
  try {
    const swap = await SwapRequest.findById(req.params.id);

    if (!swap) {
      return res.status(404).json({
        success: false,
        message: 'Swap request not found'
      });
    }

    if (swap.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the item owner can reject this swap request'
      });
    }

    swap.status = 'Rejected';
    await swap.save();

    res.json({
      success: true,
      message: 'Swap request rejected.',
      data: swap
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/swaps/:id/cancel
// @desc    Cancel an outgoing swap request (Requester only)
// @access  Private
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const swap = await SwapRequest.findById(req.params.id);

    if (!swap) {
      return res.status(404).json({
        success: false,
        message: 'Swap request not found'
      });
    }

    if (swap.requester.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the requester can cancel this swap request'
      });
    }

    swap.status = 'Cancelled';
    await swap.save();

    res.json({
      success: true,
      message: 'Swap request cancelled successfully.',
      data: swap
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/swaps/:id/status
// @desc    Update status (Negotiating, Confirmed, Completed)
// @access  Private
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['Negotiating', 'Confirmed', 'Completed', 'Cancelled', 'Accepted', 'Rejected'];

    if (!status || !allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${allowed.join(', ')}`
      });
    }

    const swap = await SwapRequest.findById(req.params.id);
    if (!swap) {
      return res.status(404).json({ success: false, message: 'Swap request not found' });
    }

    const isInvolved = swap.requester.toString() === req.user._id.toString() ||
                       swap.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isInvolved && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to change this swap status'
      });
    }

    swap.status = status;
    await swap.save();

    // If Completed, mark both clothing items as Swapped in the database!
    if (status === 'Completed') {
      await Clothing.findByIdAndUpdate(swap.offeredItem, { status: 'Swapped' });
      await Clothing.findByIdAndUpdate(swap.requestedItem, { status: 'Swapped' });
    }

    res.json({
      success: true,
      message: `Swap status successfully updated to ${status}`,
      data: swap
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/swaps/calculate-value
// @desc    Calculate swap value balance between two items
// @access  Public / Private
router.post('/calculate-value', async (req, res) => {
  try {
    const { offeredItemId, requestedItemId } = req.body;

    if (!offeredItemId || !requestedItemId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both offeredItemId and requestedItemId'
      });
    }

    const offeredItem = await Clothing.findById(offeredItemId);
    const requestedItem = await Clothing.findById(requestedItemId);

    if (!offeredItem || !requestedItem) {
      return res.status(404).json({
        success: false,
        message: 'One or both clothing items could not be found'
      });
    }

    const balanceAnalysis = calculateSwapBalance(offeredItem, requestedItem);

    res.json({
      success: true,
      data: balanceAnalysis
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error calculating swap balance'
    });
  }
});

module.exports = router;
