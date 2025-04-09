const Cart = require('../models/Cart');
const Pet = require('../models/Pet');

// Get user's cart
const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({user: req.user.id}).populate('items.pet');
    if (!cart) {
      return res.status(200).json({cart: {items: []}});
    }
    res.status(200).json({cart});
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({message: 'Server error'});
  }
};

// Add pet to cart
const addToCart = async (req, res) => {
  const {petId} = req.body;

  try {
    let cart = await Cart.findOne({user: req.user.id});
    const pet = await Pet.findById(petId);
    if (!pet) {
      return res.status(404).json({message: 'Pet not found'});
    }

    if (!cart) {
      cart = new Cart({
        user: req.user.id,
        items: [{pet: petId}],
      });
    } else {
      // Check if pet is already in cart
      if (cart.items.some(item => item.pet.toString() === petId)) {
        return res.status(400).json({message: 'Pet already in cart'});
      }
      cart.items.push({pet: petId});
    }

    await cart.save();
    await cart.populate('items.pet');
    res.status(200).json({message: 'Pet added to cart', cart});
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({message: 'Server error'});
  }
};

// Clear cart (optional, e.g., on logout or checkout)
const clearCart = async (req, res) => {
  try {
    await Cart.findOneAndUpdate({user: req.user.id}, {items: []}, {new: true});
    res.status(200).json({message: 'Cart cleared'});
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({message: 'Server error'});
  }
};

const removeFromCart = async (req, res) => {
  const {petId} = req.body;
  try {
    const cart = await Cart.findOne({user: req.user.id});
    if (!cart) {
      return res.status(404).json({message: 'Cart not found'});
    }
    cart.items = cart.items.filter(item => item.pet.toString() !== petId);
    await cart.save();
    await cart.populate('items.pet');
    res.status(200).json({message: 'Pet removed from cart', cart});
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({message: 'Server error'});
  }
};

module.exports = {getCart, addToCart, clearCart, removeFromCart};
