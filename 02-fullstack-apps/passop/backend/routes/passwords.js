const express = require('express');
const { body, validationResult } = require('express-validator');
const Password = require('../models/Password');
const { encrypt, decrypt } = require('../utils/encryption');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All password routes are protected
router.use(protect);

// @route   GET /api/passwords
// @desc    Get all passwords for the authenticated user
// @access  Private
router.get('/', async (req, res) => {
  try {
    const passwords = await Password.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    // Decrypt passwords before sending to client
    const masterKey = req.headers['x-master-key'];
    if (!masterKey) {
      return res.status(400).json({
        success: false,
        message: 'Master key is required to decrypt passwords',
      });
    }

    const decryptedPasswords = passwords.map((pwd) => {
      try {
        return {
          id: pwd._id,
          site: pwd.site,
          username: pwd.username,
          password: decrypt(pwd.password, masterKey),
          createdAt: pwd.createdAt,
          updatedAt: pwd.updatedAt,
        };
      } catch (err) {
        return {
          id: pwd._id,
          site: pwd.site,
          username: pwd.username,
          password: '••••••••',
          decryptionFailed: true,
          createdAt: pwd.createdAt,
          updatedAt: pwd.updatedAt,
        };
      }
    });

    res.json({ success: true, passwords: decryptedPasswords });
  } catch (error) {
    console.error('Get passwords error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve passwords' });
  }
});

// @route   POST /api/passwords
// @desc    Save a new password
// @access  Private
router.post(
  '/',
  [
    body('site').trim().notEmpty().withMessage('Site URL is required'),
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: errors.array()[0].msg,
          errors: errors.array(),
        });
      }

      const { site, username, password } = req.body;
      const masterKey = req.headers['x-master-key'];

      if (!masterKey) {
        return res.status(400).json({
          success: false,
          message: 'Master key is required to encrypt passwords',
        });
      }

      // Encrypt the password before storing
      const encryptedPassword = encrypt(password, masterKey);

      const newPassword = await Password.create({
        userId: req.user._id,
        site,
        username,
        password: encryptedPassword,
      });

      res.status(201).json({
        success: true,
        password: {
          id: newPassword._id,
          site: newPassword.site,
          username: newPassword.username,
          password, // Return the original plaintext to the client
          createdAt: newPassword.createdAt,
        },
      });
    } catch (error) {
      console.error('Save password error:', error);
      res.status(500).json({ success: false, message: 'Failed to save password' });
    }
  }
);

// @route   PUT /api/passwords/:id
// @desc    Update an existing password
// @access  Private
router.put(
  '/:id',
  [
    body('site').trim().notEmpty().withMessage('Site URL is required'),
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: errors.array()[0].msg,
          errors: errors.array(),
        });
      }

      const { site, username, password } = req.body;
      const masterKey = req.headers['x-master-key'];

      if (!masterKey) {
        return res.status(400).json({
          success: false,
          message: 'Master key is required to encrypt passwords',
        });
      }

      // Find and verify ownership
      const existingPassword = await Password.findOne({
        _id: req.params.id,
        userId: req.user._id,
      });

      if (!existingPassword) {
        return res.status(404).json({
          success: false,
          message: 'Password entry not found',
        });
      }

      // Encrypt and update
      const encryptedPassword = encrypt(password, masterKey);
      existingPassword.site = site;
      existingPassword.username = username;
      existingPassword.password = encryptedPassword;
      await existingPassword.save();

      res.json({
        success: true,
        password: {
          id: existingPassword._id,
          site: existingPassword.site,
          username: existingPassword.username,
          password, // Return plaintext to client
          updatedAt: existingPassword.updatedAt,
        },
      });
    } catch (error) {
      console.error('Update password error:', error);
      res.status(500).json({ success: false, message: 'Failed to update password' });
    }
  }
);

// @route   DELETE /api/passwords/:id
// @desc    Delete a password by ID
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const password = await Password.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!password) {
      return res.status(404).json({
        success: false,
        message: 'Password entry not found',
      });
    }

    res.json({ success: true, message: 'Password deleted successfully' });
  } catch (error) {
    console.error('Delete password error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete password' });
  }
});

module.exports = router;
