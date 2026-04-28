const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// REGISTER ROUTE
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    // Hash the password (Security best practice)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    //create and save the user
    const newUser = new User({ 
         name,
         email, 
         password: hashedPassword,
         role: role || 'user'//default to user if not specified
        });
    await user.save();

    res.status(201).json({ msg: 'User registered successfully!You can now login.' 
    });
    } catch (err) {
        console.error(err.message);
    res.status(500).send('Server Error during registration.');
  }
});
// LOGIN ROUTE (POST: http://localhost:5000/api/auth/login)
router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // 1. Check if user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ msg: 'Invalid Credentials (User not found)' });
      }
  
      // 2. Check password (Compare plain text with hashed password)
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid Credentials (Wrong Password)' });
      }
  
      // 3. If everything is correct, send success message
      // (Later we will add a JWT Token here to keep them logged in)
      res.json({ 
        msg: 'Login Successful!',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
  
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });

module.exports = router;