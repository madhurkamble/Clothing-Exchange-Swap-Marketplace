const User = require('../models/User');
const Clothing = require('../models/Clothing');
const SwapRequest = require('../models/SwapRequest');

const seedDemoUsersAndListings = async () => {
  try {
    // 1. Admin Demo Account
    const adminEmail = 'admin@clothswap.com';
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      admin = await User.create({
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

    // 2. Regular User Demo Account (Alex Johnson)
    const userEmail = 'user@clothswap.com';
    let user = await User.findOne({ email: userEmail });
    if (!user) {
      user = await User.create({
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

    // 3. Community Swapper (Sophia Chen) for active peer-to-peer trading
    const communityEmail = 'sophia@clothswap.com';
    let sophia = await User.findOne({ email: communityEmail });
    if (!sophia) {
      sophia = await User.create({
        name: 'Sophia Chen',
        email: communityEmail,
        password: 'user123',
        phone: '+1-555-0248',
        location: 'Manhattan, NY',
        role: 'user',
        profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80'
      });
      console.log(' Community Swapper seeded: sophia@clothswap.com / user123');
    }

    // 4. Seed Realistic Clothing Items if database is empty
    const clothingCount = await Clothing.countDocuments();
    if (clothingCount === 0) {
      const demoItems = [
        {
          title: 'Nike Black Hoodie',
          description: 'Comfortable oversized Nike Club Fleece hoodie in clean jet black. Worn twice, practically brand new. Great warm fabric for casual streetwear.',
          category: 'Activewear',
          brand: 'Nike',
          size: 'M',
          condition: 'Like new',
          estimatedValue: 45,
          image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80',
          location: 'Brooklyn, NY',
          owner: user._id,
          status: 'Available'
        },
        {
          title: "Levi's Blue Denim Jacket",
          description: "Classic authentic Levi's Trucker Denim Jacket in mid-wash blue. 100% durable cotton denim with sturdy brass buttons. Perfect vintage aesthetic.",
          category: 'Outerwear',
          brand: "Levi's",
          size: 'L',
          condition: 'Gently used',
          estimatedValue: 65,
          image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=600&q=80',
          location: 'Manhattan, NY',
          owner: sophia._id,
          status: 'Available'
        },
        {
          title: 'Zara Casual Linen Shirt',
          description: 'Breathable 100% European linen button-down casual shirt in muted beige. Brand new with tags attached, never worn. Great for warm weather.',
          category: 'Tops',
          brand: 'Zara',
          size: 'M',
          condition: 'New with tags',
          estimatedValue: 38,
          image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80',
          location: 'Brooklyn, NY',
          owner: user._id,
          status: 'Available'
        },
        {
          title: 'Adidas Originals Track Jacket',
          description: 'Iconic black-and-white 3-stripes Adidas athletic track jacket. Full zip with high collar and ribbed cuffs. Retro 90s vibes.',
          category: 'Activewear',
          brand: 'Adidas',
          size: 'XL',
          condition: 'Like new',
          estimatedValue: 50,
          image: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=600&q=80',
          location: 'Queens, NY',
          owner: admin._id,
          status: 'Available'
        },
        {
          title: 'H&M Organic Cotton White T-Shirt',
          description: 'Premium heavyweight organic cotton regular-fit tee. Soft, clean, no stains or shrinkage. A minimal sustainable wardrobe staple.',
          category: 'Tops',
          brand: 'H&M',
          size: 'S',
          condition: 'Gently used',
          estimatedValue: 15,
          image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
          location: 'Manhattan, NY',
          owner: sophia._id,
          status: 'Available'
        },
        {
          title: 'Puma Running Performance Tee',
          description: 'DryCELL moisture-wicking quick-dry athletic t-shirt in bright cyan blue. Reflective logo for nighttime visibility. Used only once for a 5k.',
          category: 'Activewear',
          brand: 'Puma',
          size: 'M',
          condition: 'Like new',
          estimatedValue: 25,
          image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=600&q=80',
          location: 'Brooklyn, NY',
          owner: user._id,
          status: 'Available'
        },
        {
          title: 'Uniqlo Extra Fine Merino Sweater',
          description: '100% Extra Fine Merino wool crew-neck knit sweater in heather navy blue. Lightweight yet exceptionally warm and elegant.',
          category: 'Tops',
          brand: 'Uniqlo',
          size: 'L',
          condition: 'Like new',
          estimatedValue: 40,
          image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=600&q=80',
          location: 'Manhattan, NY',
          owner: sophia._id,
          status: 'Available'
        },
        {
          title: 'Patagonia Synchilla Fleece Pullover',
          description: 'Classic snap-T warm fleece sweater in forest green. Made with 85% recycled polyester. Extremely durable and cozy for outdoor adventures.',
          category: 'Outerwear',
          brand: 'Patagonia',
          size: 'M',
          condition: 'Gently used',
          estimatedValue: 70,
          image: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=600&q=80',
          location: 'Brooklyn, NY',
          owner: user._id,
          status: 'Available'
        }
      ];

      await Clothing.insertMany(demoItems);
      console.log(` Seeded ${demoItems.length} realistic clothing marketplace listings.`);
    }

    // 5. Seed Initial Demo Swap Requests
    const swapCount = await SwapRequest.countDocuments();
    if (swapCount === 0) {
      const alexItem = await Clothing.findOne({ owner: user._id, title: 'Nike Black Hoodie' });
      const sophiaItem = await Clothing.findOne({ owner: sophia._id, title: "Levi's Blue Denim Jacket" });
      const sophiaMerino = await Clothing.findOne({ owner: sophia._id, title: 'Uniqlo Extra Fine Merino Sweater' });
      const alexZara = await Clothing.findOne({ owner: user._id, title: 'Zara Casual Linen Shirt' });

      if (alexItem && sophiaItem) {
        // Incoming request for Alex from Sophia
        await SwapRequest.create({
          requester: sophia._id,
          owner: user._id,
          offeredItem: sophiaItem._id,
          requestedItem: alexItem._id,
          message: "Hi Alex! I love your Nike hoodie. Would you be interested in swapping for my Levi's denim trucker jacket? I'm available for a quick meetup near Brooklyn Bridge!",
          status: 'Pending'
        });
      }

      if (sophiaMerino && alexZara) {
        // Outgoing request from Alex to Sophia
        await SwapRequest.create({
          requester: user._id,
          owner: sophia._id,
          offeredItem: alexZara._id,
          requestedItem: sophiaMerino._id,
          message: "Hey Sophia, saw your Uniqlo merino knit sweater. Offering my brand new Zara linen shirt in exchange!",
          status: 'Pending'
        });
      }

      console.log(' Seeded initial realistic swap requests for demo accounts.');
    }
  } catch (error) {
    console.error('Error seeding demo data:', error.message);
  }
};

module.exports = seedDemoUsersAndListings;
