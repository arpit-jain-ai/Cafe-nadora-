// ============================================================
// controllers/menu.controller.js
// ============================================================
const Menu = require('../models/Menu.model');

// @desc   Get all menu items (with filters)
// @route  GET /api/menu
// @access Public
exports.getAllMenuItems = async (req, res, next) => {
  try {
    const { category, isVeg, isAvailable, isFeatured, search, sort, page = 1, limit = 50 } = req.query;
    const query = {};

    if (category)    query.category    = category;
    if (isVeg)       query.isVeg       = isVeg === 'true';
    if (isFeatured)  query.isFeatured  = isFeatured === 'true';
    if (isAvailable !== undefined) query.isAvailable = isAvailable === 'true';
    else query.isAvailable = true;

    if (search) {
      query.$or = [
        { name:        { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const sortObj = {};
    if (sort === 'price_asc')   sortObj.price = 1;
    else if (sort === 'price_desc') sortObj.price = -1;
    else if (sort === 'rating') sortObj.rating = -1;
    else if (sort === 'popular') sortObj.orderCount = -1;
    else sortObj.sortOrder = 1;

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Menu.find(query).sort(sortObj).skip(skip).limit(Number(limit)),
      Menu.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      count: items.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: items
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Get single menu item
// @route  GET /api/menu/:id
// @access Public
exports.getMenuItem = async (req, res, next) => {
  try {
    const item = await Menu.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Menu item not found' });
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

// @desc   Get menu by category
// @route  GET /api/menu/category/:category
// @access Public
exports.getMenuByCategory = async (req, res, next) => {
  try {
    const items = await Menu.find({ category: req.params.category, isAvailable: true }).sort({ sortOrder: 1 });
    res.status(200).json({ success: true, count: items.length, data: items });
  } catch (error) {
    next(error);
  }
};

// @desc   Get featured items
// @route  GET /api/menu/featured
// @access Public
exports.getFeaturedItems = async (req, res, next) => {
  try {
    const items = await Menu.find({ isFeatured: true, isAvailable: true }).sort({ rating: -1 }).limit(8);
    res.status(200).json({ success: true, count: items.length, data: items });
  } catch (error) {
    next(error);
  }
};

// @desc   Create menu item (Admin)
// @route  POST /api/menu
// @access Private/Admin
exports.createMenuItem = async (req, res, next) => {
  try {
    if (req.file) req.body.image = `/uploads/${req.file.filename}`;
    const item = await Menu.create(req.body);
    res.status(201).json({ success: true, message: 'Menu item created', data: item });
  } catch (error) {
    next(error);
  }
};

// @desc   Update menu item (Admin)
// @route  PUT /api/menu/:id
// @access Private/Admin
exports.updateMenuItem = async (req, res, next) => {
  try {
    if (req.file) req.body.image = `/uploads/${req.file.filename}`;
    const item = await Menu.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ success: false, message: 'Menu item not found' });
    res.status(200).json({ success: true, message: 'Menu item updated', data: item });
  } catch (error) {
    next(error);
  }
};

// @desc   Delete menu item (Admin)
// @route  DELETE /api/menu/:id
// @access Private/Admin
exports.deleteMenuItem = async (req, res, next) => {
  try {
    const item = await Menu.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Menu item not found' });
    res.status(200).json({ success: true, message: 'Menu item deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc   Toggle availability
// @route  PATCH /api/menu/:id/toggle
// @access Private/Admin
exports.toggleAvailability = async (req, res, next) => {
  try {
    const item = await Menu.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Menu item not found' });
    item.isAvailable = !item.isAvailable;
    await item.save();
    res.status(200).json({ success: true, message: `Item ${item.isAvailable ? 'enabled' : 'disabled'}`, data: item });
  } catch (error) {
    next(error);
  }
};

// @desc   Seed default menu items
// @route  POST /api/menu/seed
// @access Private/Admin
exports.seedMenu = async (req, res, next) => {
  try {
    const defaultItems = [
      { name: 'Espresso',          category: 'coffee',    price: 99,  emoji: '☕', description: 'Rich & bold single shot',              calories: 5,   isVeg: true, badge: 'Popular',    isFeatured: true  },
      { name: 'Cappuccino',        category: 'coffee',    price: 149, emoji: '☕', description: 'Velvety foam, perfect balance',         calories: 120, isVeg: true, badge: 'Bestseller', isFeatured: true  },
      { name: 'Café Latte',        category: 'coffee',    price: 159, emoji: '☕', description: 'Smooth espresso & steamed milk',        calories: 150, isVeg: true                                         },
      { name: 'Hazelnut Latte',    category: 'coffee',    price: 189, emoji: '☕', description: 'Nutty sweetness in every sip',          calories: 180, isVeg: true, badge: 'Must Try',   isFeatured: true  },
      { name: 'Cold Coffee',       category: 'coffee',    price: 169, emoji: '🥤', description: 'Chilled & refreshing classic',          calories: 200, isVeg: true                                         },
      { name: 'Alfredo Pasta',     category: 'italian',   price: 249, emoji: '🍝', description: 'Creamy parmesan perfection',            calories: 520, isVeg: true, badge: 'Signature',  isFeatured: true  },
      { name: 'Arrabiata Pasta',   category: 'italian',   price: 229, emoji: '🍝', description: 'Spicy tomato, roasted garlic',          calories: 480, isVeg: true                                         },
      { name: 'White Sauce Pasta', category: 'italian',   price: 239, emoji: '🍝', description: 'Rich béchamel with herbs',              calories: 510, isVeg: true                                         },
      { name: 'Panini Sandwich',   category: 'italian',   price: 199, emoji: '🥖', description: 'Grilled, crispy, loaded with love',     calories: 380, isVeg: true, badge: 'Popular'                       },
      { name: 'Garlic Bread',      category: 'italian',   price: 129, emoji: '🍞', description: 'Herb butter & toasted perfection',      calories: 280, isVeg: true                                         },
      { name: 'Margherita Pizza',  category: 'pizza',     price: 299, emoji: '🍕', description: 'Classic tomato & mozzarella',           calories: 680, isVeg: true, badge: 'Classic',    isFeatured: true  },
      { name: 'Farmhouse Pizza',   category: 'pizza',     price: 349, emoji: '🍕', description: 'Farm-fresh veggies & cheese',           calories: 720, isVeg: true, badge: 'Popular'                       },
      { name: 'Veggie Delight',    category: 'pizza',     price: 329, emoji: '🍕', description: 'Loaded with seasonal vegetables',       calories: 700, isVeg: true                                         },
      { name: 'Veg Burger',        category: 'burger',    price: 179, emoji: '🍔', description: 'Crispy patty, fresh veggies',           calories: 420, isVeg: true                                         },
      { name: 'Cheese Burger',     category: 'burger',    price: 199, emoji: '🍔', description: 'Double cheese, signature sauce',        calories: 480, isVeg: true, badge: 'Popular'                       },
      { name: 'Hakka Noodles',     category: 'chinese',   price: 189, emoji: '🍜', description: 'Wok-tossed, full of flavour',           calories: 440, isVeg: true                                         },
      { name: 'Schezwan Noodles',  category: 'chinese',   price: 199, emoji: '🍜', description: 'Fiery & aromatic Schezwan',             calories: 460, isVeg: true, badge: 'Spicy'                         },
      { name: 'Cheesecake',        category: 'dessert',   price: 179, emoji: '🍰', description: 'New York style, velvety smooth',        calories: 380, isVeg: true, badge: 'Signature',  isFeatured: true  },
      { name: 'Waffles',           category: 'dessert',   price: 199, emoji: '🧇', description: 'Belgian waffles with maple syrup',      calories: 420, isVeg: true, badge: 'Must Try'                      },
      { name: 'Pastries',          category: 'dessert',   price: 89,  emoji: '🥐', description: 'Freshly baked every morning',           calories: 280, isVeg: true                                         },
      { name: 'Chocolate Shake',   category: 'beverages', price: 199, emoji: '🥤', description: 'Thick, rich, indulgent',                calories: 360, isVeg: true, badge: 'Popular'                       },
      { name: 'Mango Mocktail',    category: 'beverages', price: 169, emoji: '🧃', description: 'Fresh mango with mint & lime',          calories: 180, isVeg: true                                         },
      { name: 'Iced Tea',          category: 'beverages', price: 129, emoji: '🧊', description: 'Refreshing peach or lemon',             calories: 80,  isVeg: true                                         },
    ];

    await Menu.deleteMany({});
    const items = await Menu.insertMany(defaultItems);
    res.status(201).json({ success: true, message: `${items.length} menu items seeded`, count: items.length });
  } catch (error) {
    next(error);
  }
};
