const User = require("../models/User");
const Category = require("../models/Category");
const Product = require("../models/Product");
const Coupon = require("../models/Coupon");

const runAutoSeed = async () => {
  try {
    // 1. Ensure primary Admin account (admin@gmail.com / admin) exists & works
    const adminEmail = "admin@gmail.com";
    const existingAdmin = await User.findOne({ email: adminEmail }).select("+password");
    if (!existingAdmin) {
      await User.create({
        name: "NexaCart Admin",
        email: adminEmail,
        password: "admin",
        role: "admin",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      });
      console.log(`[AutoSeed] Created admin: ${adminEmail} (password: admin)`);
    } else {
      const hasAdminPassword = await existingAdmin.matchPassword("admin");
      if (!hasAdminPassword || existingAdmin.role !== "admin") {
        existingAdmin.role = "admin";
        existingAdmin.password = "admin";
        await existingAdmin.save();
        console.log(`[AutoSeed] Synced primary admin credentials for ${adminEmail}`);
      }
    }

    const defaultUsers = [
      {
        name: "Alex Vance (Admin)",
        email: "admin@nexacart.com",
        password: "changeme123",
        role: "admin",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      },
      {
        name: "Sarah Connor (Manager)",
        email: "manager@nexacart.com",
        password: "changeme123",
        role: "manager",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      },
      {
        name: "John Doe (Customer)",
        email: "customer@nexacart.com",
        password: "changeme123",
        role: "customer",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      },
    ];

    for (const userData of defaultUsers) {
      const existing = await User.findOne({ email: userData.email });
      if (!existing) {
        await User.create(userData);
        console.log(`[AutoSeed] Created ${userData.role}: ${userData.email}`);
      }
    }

    // 2. Seed default Categories if empty
    const categoryCount = await Category.countDocuments();
    let createdCategories = [];

    if (categoryCount === 0) {
      const defaultCategories = [
        {
          name: "Electronics",
          image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&auto=format&fit=crop&q=80",
        },
        {
          name: "Clothes & Fashion",
          image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&auto=format&fit=crop&q=80",
        },
        {
          name: "Shoes & Footwear",
          image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80",
        },
        {
          name: "Furniture & Living",
          image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop&q=80",
        },
        {
          name: "Accessories & Watches",
          image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
        },
      ];

      for (const cat of defaultCategories) {
        const doc = await Category.create(cat);
        createdCategories.push(doc);
      }
      console.log(`[AutoSeed] Seeded ${createdCategories.length} default categories.`);
    } else {
      createdCategories = await Category.find();
    }

    // 3. Seed default Products if empty
    const productCount = await Product.countDocuments();
    if (productCount === 0 && createdCategories.length > 0) {
      const findCat = (namePart) =>
        createdCategories.find((c) => c.name.toLowerCase().includes(namePart.toLowerCase())) ||
        createdCategories[0];

      const electronics = findCat("Electronics");
      const clothes = findCat("Clothes");
      const shoes = findCat("Shoes");
      const furniture = findCat("Furniture");
      const accessories = findCat("Accessories");

      const defaultProducts = [
        {
          title: "Wireless Noise-Cancelling Headphones",
          price: 199,
          description:
            "Experience studio-grade sound with active noise cancellation, 30-hour battery life, and ultra-soft memory foam ear cushions.",
          category: electronics._id,
          images: [
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
          ],
          stock: 42,
        },
        {
          title: "Smart Fitness Watch Pro",
          price: 149,
          description:
            "Track heart rate, sleep quality, workouts, and notifications with a crisp AMOLED display and 7-day battery.",
          category: electronics._id,
          images: [
            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
          ],
          stock: 35,
        },
        {
          title: "Mechanical RGB Gaming Keyboard",
          price: 119,
          description:
            "Compact aluminum-frame mechanical keyboard with tactile switches and customizable per-key RGB backlighting.",
          category: electronics._id,
          images: [
            "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80",
          ],
          stock: 28,
        },
        {
          title: "Classic Cotton Oversized Hoodie",
          price: 59,
          description:
            "Heavyweight 100% organic cotton fleece hoodie with brushed interior, relaxed fit, and reinforced stitching.",
          category: clothes._id,
          images: [
            "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&auto=format&fit=crop&q=80",
          ],
          stock: 60,
        },
        {
          title: "Tailored Denim Jacket",
          price: 89,
          description:
            "Timeless medium-wash denim jacket with classic metal buttons and tailored modern silhouette.",
          category: clothes._id,
          images: [
            "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&auto=format&fit=crop&q=80",
          ],
          stock: 30,
        },
        {
          title: "Air Cushion Running Sneakers",
          price: 129,
          description:
            "Lightweight breathable mesh running shoes engineered with responsive foam cushioning for daily miles.",
          category: shoes._id,
          images: [
            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80",
          ],
          stock: 50,
        },
        {
          title: "Minimalist Leather Sneakers",
          price: 95,
          description:
            "Clean everyday sneakers handcrafted with supple full-grain leather and durable rubber cupsole.",
          category: shoes._id,
          images: [
            "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=80",
          ],
          stock: 25,
        },
        {
          title: "Scandinavian Velvet Accent Sofa",
          price: 549,
          description:
            "Mid-century modern velvet sofa with solid oak legs and plush supportive cushions for contemporary living rooms.",
          category: furniture._id,
          images: [
            "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop&q=80",
          ],
          stock: 12,
        },
        {
          title: "Ergonomic Oak Study Desk",
          price: 320,
          description:
            "Spacious natural oak writing and work-from-home desk with cable management tray and steel legs.",
          category: furniture._id,
          images: [
            "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&auto=format&fit=crop&q=80",
          ],
          stock: 18,
        },
        {
          title: "Polarized Aviator Sunglasses",
          price: 65,
          description:
            "Lightweight titanium-frame sunglasses with UV400 polarized lenses for glare-free clarity.",
          category: accessories._id,
          images: [
            "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&auto=format&fit=crop&q=80",
          ],
          stock: 75,
        },
        {
          title: "Urban Canvas Backpack",
          price: 74,
          description:
            "Water-resistant everyday backpack with padded 16-inch laptop sleeve and quick-access travel pockets.",
          category: accessories._id,
          images: [
            "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80",
          ],
          stock: 40,
        },
        {
          title: "Minimalist Ceramic Coffee Mug Set",
          price: 34,
          description:
            "Set of 2 matte-glazed handcrafted ceramic mugs designed to keep your coffee warm longer.",
          category: furniture._id,
          images: [
            "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&auto=format&fit=crop&q=80",
          ],
          stock: 90,
        },
      ];

      for (const prod of defaultProducts) {
        await Product.create(prod);
      }
      console.log(`[AutoSeed] Seeded ${defaultProducts.length} default products.`);
    }

    // 4. Seed default active Coupons if empty
    const couponCount = await Coupon.countDocuments();
    if (couponCount === 0) {
      const defaultCoupons = [
        {
          code: "NEXA20",
          type: "percentage",
          value: 20,
          description: "Flat 20% off on all categories",
          minOrderValue: 0,
          maxDiscount: 500,
          expiresAt: new Date(Date.now() + 90 * 86400000),
          isActive: true,
          usageLimit: 1000,
          usedCount: 0,
        },
        {
          code: "SAVE10",
          type: "percentage",
          value: 10,
          description: "10% off on orders above $50",
          minOrderValue: 50,
          maxDiscount: 100,
          expiresAt: new Date(Date.now() + 60 * 86400000),
          isActive: true,
          usageLimit: 500,
          usedCount: 0,
        },
        {
          code: "FREESHIP",
          type: "shipping",
          value: 100,
          description: "Free shipping on any order",
          minOrderValue: 0,
          maxDiscount: 50,
          expiresAt: new Date(Date.now() + 30 * 86400000),
          isActive: true,
          usageLimit: 300,
          usedCount: 0,
        },
        {
          code: "FLAT15",
          type: "fixed",
          value: 15,
          description: "Flat $15 off on orders above $100",
          minOrderValue: 100,
          maxDiscount: 15,
          expiresAt: new Date(Date.now() + 60 * 86400000),
          isActive: true,
          usageLimit: 300,
          usedCount: 0,
        },
      ];
      await Coupon.insertMany(defaultCoupons);
      console.log(`[AutoSeed] Seeded ${defaultCoupons.length} default coupons.`);
    }
  } catch (error) {
    console.error("[AutoSeed] Error during seeding:", error.message);
  }
};

module.exports = runAutoSeed;
