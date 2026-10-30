const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');
const Log = require('../models/Log');
const { JWT_SECRET } = require('../middleware/authMiddleware');

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// 1. Sign Up / Register
const register = async (req, res) => {
  try {
    const { name, email, password, role = 'manager' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    // Must be at least 8 characters
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long.'
      });
    }

    const emailTrimmed = email.toLowerCase().trim();

    // Check if user already exists
    const existing = await query('SELECT id, is_verified FROM users WHERE email = $1', [emailTrimmed]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Email is already registered' });
    }

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    const passwordHash = await bcrypt.hash(password, 10);

    const defaultAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=1d4ed8`;

    const insertSql = `
      INSERT INTO users (name, email, password_hash, role, is_verified, otp_code, otp_expires_at, avatar_url)
      VALUES ($1, $2, $3, $4, false, $5, $6, $7)
      RETURNING id, name, email, role, is_verified, created_at
    `;
    const result = await query(insertSql, [name, emailTrimmed, passwordHash, role, otp, otpExpires, defaultAvatar]);
    const newUser = result.rows[0];

    // Log to MongoDB
    try {
      await Log.create({
        action: 'USER_REGISTERED',
        title: 'New User Registered',
        description: `${newUser.name} (${newUser.email}) registered as ${newUser.role}. Verification OTP generated.`,
        category: 'Authentication',
        metadata: { userId: newUser.id, email: newUser.email },
        severity: 'info'
      });
    } catch (logErr) {
      console.warn('Log error:', logErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please verify the 6-digit OTP code sent to your email.',
      email: newUser.email,
      otp, // provided so user can easily test OTP verification in demo mode
      user: newUser
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

// 2. Verify OTP
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP code are required' });
    }

    const emailTrimmed = email.toLowerCase().trim();
    const result = await query('SELECT * FROM users WHERE email = $1', [emailTrimmed]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = result.rows[0];

    // Check OTP
    if (user.otp_code !== otp.trim()) {
      return res.status(400).json({ success: false, message: 'Invalid OTP code. Please check and try again.' });
    }

    // Check Expiry
    if (new Date() > new Date(user.otp_expires_at)) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    // Mark as verified
    await query(
      'UPDATE users SET is_verified = true, otp_code = NULL, otp_expires_at = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    // Issue JWT
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Log to MongoDB
    try {
      await Log.create({
        action: 'OTP_VERIFIED',
        title: 'Account Verified via OTP',
        description: `User ${user.email} verified account via OTP and logged in.`,
        category: 'Authentication',
        metadata: { userId: user.id, email: user.email },
        severity: 'success'
      });
    } catch (logErr) {
      console.warn('Log error:', logErr.message);
    }

    res.json({
      success: true,
      message: 'Account verified successfully!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar_url: user.avatar_url
      }
    });
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ success: false, message: 'Server error verifying OTP' });
  }
};

// 3. Resend OTP
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const emailTrimmed = email.toLowerCase().trim();
    const result = await query('SELECT * FROM users WHERE email = $1', [emailTrimmed]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'No account found with this email' });
    }

    const user = result.rows[0];
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    await query(
      'UPDATE users SET otp_code = $1, otp_expires_at = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
      [otp, otpExpires, user.id]
    );

    // Log to MongoDB
    try {
      await Log.create({
        action: 'OTP_SENT',
        title: 'OTP Resent',
        description: `New OTP generated for ${user.email}`,
        category: 'Authentication',
        metadata: { userId: user.id, email: user.email },
        severity: 'info'
      });
    } catch (logErr) {
      console.warn('Log error:', logErr.message);
    }

    res.json({
      success: true,
      message: 'New OTP code sent to your email.',
      otp
    });
  } catch (err) {
    console.error('Resend OTP error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 4. Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long.'
      });
    }

    const emailTrimmed = email.toLowerCase().trim();
    const result = await query('SELECT * FROM users WHERE email = $1', [emailTrimmed]);

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // If not verified, generate new OTP and prompt verification
    if (!user.is_verified) {
      const otp = generateOTP();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
      await query(
        'UPDATE users SET otp_code = $1, otp_expires_at = $2 WHERE id = $3',
        [otp, otpExpires, user.id]
      );
      return res.status(403).json({
        success: false,
        needsVerification: true,
        message: 'Your account is not verified yet. We have sent an OTP to your email.',
        email: user.email,
        otp
      });
    }

    // Issue Token
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Log to MongoDB
    try {
      await Log.create({
        action: 'USER_LOGIN',
        title: 'User Logged In',
        description: `${user.name} (${user.email}) logged in successfully as ${user.role}.`,
        category: 'Authentication',
        metadata: { userId: user.id, email: user.email },
        severity: 'info'
      });
    } catch (logErr) {
      console.warn('Log error:', logErr.message);
    }

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar_url: user.avatar_url
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// 5. Forgot Password — Request OTP
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required' });
    }

    const emailTrimmed = email.toLowerCase().trim();
    const result = await query('SELECT * FROM users WHERE email = $1', [emailTrimmed]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'No registered account found with this email' });
    }

    const user = result.rows[0];
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await query(
      'UPDATE users SET otp_code = $1, otp_expires_at = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
      [otp, otpExpires, user.id]
    );

    // Log to MongoDB
    try {
      await Log.create({
        action: 'PASSWORD_RESET_REQUESTED',
        title: 'Password Reset OTP Requested',
        description: `Password reset requested for ${user.email}. OTP code dispatched.`,
        category: 'Authentication',
        metadata: { userId: user.id, email: user.email },
        severity: 'warning'
      });
    } catch (logErr) {
      console.warn('Log error:', logErr.message);
    }

    res.json({
      success: true,
      message: 'Password reset OTP has been sent to your email.',
      email: user.email,
      otp // for preview/testing
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 6. Reset Password — Verify OTP & Set New Password
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email, OTP code, and new password are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long.'
      });
    }

    const emailTrimmed = email.toLowerCase().trim();
    const result = await query('SELECT * FROM users WHERE email = $1', [emailTrimmed]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = result.rows[0];

    // Check OTP
    if (user.otp_code !== otp.trim()) {
      return res.status(400).json({ success: false, message: 'Invalid OTP code' });
    }

    // Check Expiry
    if (new Date() > new Date(user.otp_expires_at)) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    await query(
      `UPDATE users
       SET password_hash = $1, otp_code = NULL, otp_expires_at = NULL, is_verified = true, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [newPasswordHash, user.id]
    );

    // Log to MongoDB
    try {
      await Log.create({
        action: 'PASSWORD_RESET_SUCCESS',
        title: 'Password Reset Successful',
        description: `Password was successfully updated for ${user.email}.`,
        category: 'Authentication',
        metadata: { userId: user.id, email: user.email },
        severity: 'success'
      });
    } catch (logErr) {
      console.warn('Log error:', logErr.message);
    }

    res.json({
      success: true,
      message: 'Password successfully reset! You can now log in with your new password.'
    });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ success: false, message: 'Server error resetting password' });
  }
};

// 7. Get Current Authenticated User Profile
const getMe = async (req, res) => {
  try {
    const result = await query(
      'SELECT id, name, email, role, is_verified, avatar_url, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  register,
  verifyOTP,
  resendOTP,
  login,
  forgotPassword,
  resetPassword,
  getMe
};
