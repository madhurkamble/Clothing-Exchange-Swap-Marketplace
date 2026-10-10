const User = require('../models/User');

const seedDemoUsers = async () => {
  try {
    // 1. Admin Demo Account
    const adminEmail = 'admin@clothswap.com';
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      await User.create({
        name: 'ClothSwap Admin',
        email: adminEmail,
        password: 'admin123',
        phone: '+1-555-0100',
        location: 'New York, NY',
        role: 'admin',
        profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
      });
      console.log(' Demo Admin seeded: admin@clothswap.com / admin123');
    }

    // 2. Regular User Demo Account
    const userEmail = 'user@clothswap.com';
    const existingUser = await User.findOne({ email: userEmail });
    if (!existingUser) {
      await User.create({
        name: 'Alex Johnson',
        email: userEmail,
        password: 'user123',
        phone: '+1-555-0199',
        location: 'Brooklyn, NY',
        role: 'user',
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'
      });
      console.log(' Demo User seeded: user@clothswap.com / user123');
    }
  } catch (error) {
    console.error('Error seeding demo users:', error.message);
  }
};

module.exports = seedDemoUsers;
