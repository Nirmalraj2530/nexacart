const User = require("../models/User");

/**
 * @desc    Get all users from MongoDB (Admin)
 * @route   GET /api/users
 * @access  Private (Admin)
 */
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    return res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single user by ID
 * @route   GET /api/users/:id
 * @access  Private (Admin or Self)
 */
const getUserById = async (req, res, next) => {
  try {
    if (req.user.role !== "admin" && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ success: false, message: "Forbidden: Access denied." });
    }
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new user (Admin)
 * @route   POST /api/users
 * @access  Private (Admin)
 */
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, avatar, phone } = req.body;
    const normalizedEmail = String(email || "").toLowerCase().trim();

    if (!normalizedEmail || !name || !password) {
      return res.status(400).json({ success: false, message: "Name, email, and password are required." });
    }

    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) {
      return res.status(400).json({ success: false, message: "An account with this email already exists." });
    }

    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      password,
      role: ["customer", "manager", "admin"].includes(role) ? role : "customer",
      avatar: avatar || undefined,
      phone: phone || "",
    });

    return res.status(201).json(user.toJSON());
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user details (Admin)
 * @route   PUT /api/users/:id
 * @access  Private (Admin)
 */
const updateUser = async (req, res, next) => {
  try {
    const { name, email, role, avatar, phone, isActive, password } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (name) user.name = name.trim();
    if (email) user.email = email.toLowerCase().trim();
    if (role && ["customer", "manager", "admin"].includes(role)) user.role = role;
    if (avatar) user.avatar = avatar;
    if (phone !== undefined) user.phone = phone;
    if (isActive !== undefined) user.isActive = isActive;
    if (password && password !== "changeme") user.password = password;

    const updatedUser = await user.save();
    return res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete user account (Admin)
 * @route   DELETE /api/users/:id
 * @access  Private (Admin)
 */
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "You cannot delete your own active admin account." });
    }
    await User.findByIdAndDelete(req.params.id);
    return res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
};

const formatAddresses = (addresses = []) =>
  addresses.map((addr) => ({
    id: addr._id.toString(),
    fullName: addr.fullName,
    phone: addr.phone,
    address: addr.address,
    city: addr.city,
    state: addr.state,
    pincode: addr.pincode,
    country: addr.country || "United States",
    type: addr.type || "Home",
    isDefault: Boolean(addr.isDefault),
  }));

/**
 * @desc    Get current user's saved addresses
 * @route   GET /api/users/addresses
 * @access  Private
 */
const getAddresses = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    return res.status(200).json(formatAddresses(user.addresses));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add new saved address for current user
 * @route   POST /api/users/addresses
 * @access  Private
 */
const addAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const { fullName, phone, address, city, state, pincode, country, type, isDefault } = req.body;
    if (!fullName || !phone || !address || !city || !state || !pincode) {
      return res.status(400).json({ success: false, message: "All required address fields must be provided." });
    }

    const shouldBeDefault = Boolean(isDefault) || user.addresses.length === 0;
    if (shouldBeDefault) {
      user.addresses.forEach((a) => {
        a.isDefault = false;
      });
    }

    user.addresses.push({
      fullName: fullName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      country: (country || "United States").trim(),
      type: ["Home", "Work", "Other"].includes(type) ? type : "Home",
      isDefault: shouldBeDefault,
    });

    await user.save();
    return res.status(201).json(formatAddresses(user.addresses));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a saved address
 * @route   PUT /api/users/addresses/:addressId
 * @access  Private
 */
const updateAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const target = user.addresses.id(req.params.addressId);
    if (!target) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    const { fullName, phone, address, city, state, pincode, country, type, isDefault } = req.body;
    if (isDefault) {
      user.addresses.forEach((a) => {
        a.isDefault = false;
      });
      target.isDefault = true;
    } else if (isDefault === false) {
      target.isDefault = false;
    }

    if (fullName !== undefined) target.fullName = fullName.trim();
    if (phone !== undefined) target.phone = phone.trim();
    if (address !== undefined) target.address = address.trim();
    if (city !== undefined) target.city = city.trim();
    if (state !== undefined) target.state = state.trim();
    if (pincode !== undefined) target.pincode = pincode.trim();
    if (country !== undefined) target.country = country.trim();
    if (type && ["Home", "Work", "Other"].includes(type)) target.type = type;

    await user.save();
    return res.status(200).json(formatAddresses(user.addresses));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Set a saved address as default
 * @route   PATCH /api/users/addresses/:addressId/default
 * @access  Private
 */
const setDefaultAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const target = user.addresses.id(req.params.addressId);
    if (!target) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    user.addresses.forEach((a) => {
      a.isDefault = a._id.toString() === req.params.addressId;
    });

    await user.save();
    return res.status(200).json(formatAddresses(user.addresses));
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a saved address
 * @route   DELETE /api/users/addresses/:addressId
 * @access  Private
 */
const deleteAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const target = user.addresses.id(req.params.addressId);
    if (!target) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }

    const wasDefault = target.isDefault;
    target.deleteOne();
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();
    return res.status(200).json(formatAddresses(user.addresses));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getAddresses,
  addAddress,
  updateAddress,
  setDefaultAddress,
  deleteAddress,
};
