const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const SwapRequest = require('../models/SwapRequest');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/chat/messages
// @desc    Send a message within a swap negotiation
// @access  Private
router.post('/messages', protect, async (req, res) => {
  try {
    const { swapRequestId, message } = req.body;

    if (!swapRequestId || !message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide both swapRequestId and message content'
      });
    }

    // 1. Fetch associated swap request
    const swap = await SwapRequest.findById(swapRequestId);
    if (!swap) {
      return res.status(404).json({
        success: false,
        message: 'Swap request not found'
      });
    }

    // 2. Security: Verify that sender is one of the involved parties
    const isRequester = swap.requester.toString() === req.user._id.toString();
    const isOwner = swap.owner.toString() === req.user._id.toString();

    if (!isRequester && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to participate in this negotiation'
      });
    }

    // Determine receiver
    const receiverId = isRequester ? swap.owner : swap.requester;

    // 3. Create message
    const newMessage = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      swapRequest: swapRequestId,
      message: message.trim()
    });

    // 4. Update swap status to Negotiating if currently Accepted
    if (swap.status === 'Accepted') {
      swap.status = 'Negotiating';
      await swap.save();
    }

    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', 'name email location profileImage role')
      .populate('receiver', 'name email location profileImage role');

    res.status(201).json({
      success: true,
      data: populatedMessage
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error sending message'
    });
  }
});

// @route   GET /api/chat/:swapRequestId
// @desc    Get all chat messages and swap details for a specific swap request
// @access  Private
router.get('/:swapRequestId', protect, async (req, res) => {
  try {
    const { swapRequestId } = req.params;

    // 1. Fetch swap request with items and parties
    const swap = await SwapRequest.findById(swapRequestId)
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

    // 2. Authorization check
    const isRequester = swap.requester._id.toString() === req.user._id.toString();
    const isOwner = swap.owner._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isRequester && !isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view messages for this swap'
      });
    }

    // 3. Fetch conversation messages
    const messages = await Message.find({ swapRequest: swapRequestId })
      .populate('sender', 'name email profileImage')
      .populate('receiver', 'name email profileImage')
      .sort({ timestamp: 1 });

    res.json({
      success: true,
      swap,
      count: messages.length,
      messages
    });
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching chat conversation'
    });
  }
});

module.exports = router;
