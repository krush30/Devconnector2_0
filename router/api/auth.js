const express = require('express');
const router = express.Router();

const auth = require('../../middleware/auth')
const config = require('config')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')



const { check, validationResult } = require('express-validator')

const User = require('../../modal/User')

// Get user by token
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password')
        res.json(user)
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error')

    }
})

// Login User and get his new token
router.post('/', [
    check('email', 'Email is required').isEmail(),
    check('password', 'Passcode is required').exists()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        // Check if the user exists
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
        }

        // Compare passwords
        const PasswordMatch = await bcrypt.compare(password, user.password);
        if (!PasswordMatch) {
            return res.status(400).json({ msg: 'Password or email is wrong' });
        }

        // Generate JWT token
        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            config.get('JWT_SECRET'),
            { expiresIn: 36000 },
            (err, token) => {
                if (err) {
                    console.error(err.message);
                    return res.status(500).json({ msg: 'Token generation failed' });
                }
                res.json({ token });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


module.exports = router;