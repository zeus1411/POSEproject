import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Vui lòng nhập tên người dùng'],
      unique: true,
      trim: true,
      minlength: [3, 'Tên người dùng phải có ít nhất 3 ký tự'],
      maxlength: [30, 'Tên người dùng không được vượt quá 30 ký tự']
    },
    email: {
      type: String,
      required: [true, 'Vui lòng nhập email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Email không hợp lệ'
      ]
    },
    password: {
      type: String,
      required: [true, 'Vui lòng nhập mật khẩu'],
      minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự'],
      select: false
    },
    phone: {
      type: String,
      trim: true
    },
    role: {
      type: String,
      enum: ['USER', 'ADMIN'],
      default: 'USER'
    },
    avatar: {
      type: String,
      default: 'https://res.cloudinary.com/default-avatar.png'
    },
    dateOfBirth: {
      type: Date
    },
    gender: {
      type: String,
      enum: ['male', 'female', null],
      default: null
    },
    resetPasswordOTP: {
      code: String,
      expires: Date,
      attempts: {
        type: Number,
        default: 0
      }
    },
    defaultAddress: {
      fullName: {
        type: String,
        trim: true
      },
      phone: {
        type: String,
        trim: true
      },
      street: {
        type: String,
        trim: true
      },
      ward: {
        type: String,
        trim: true
      },
      district: {
        type: String,
        trim: true
      },
      city: {
        type: String,
        trim: true
      },
      country: {
        type: String,
        default: 'Việt Nam',
        trim: true
      },
      postalCode: {
        type: String,
        trim: true
      }
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    lastLogin: Date,
    loginAttempts: {
      type: Number,
      default: 0
    },
    lockUntil: Date
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual populate
userSchema.virtual('orders', {
  ref: 'Order',
  localField: '_id',
  foreignField: 'userId'
});

userSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'userId'
});

userSchema.virtual('payments', {
  ref: 'Payment',
  localField: '_id',
  foreignField: 'userId'
});

// Indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ phone: 1 }, { sparse: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT token
userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { 
      id: this._id, 
      role: this.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Generate email verification token
userSchema.methods.generateVerificationToken = function () {
  const token = crypto.randomBytes(32).toString('hex');
  
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  
  this.resetPasswordExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  
  return token;
};

// Generate password reset token
userSchema.methods.generateResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes
  
  return resetToken;
};

// Check if account is locked
userSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Increment login attempts
userSchema.methods.incLoginAttempts = function () {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  const maxAttempts = 5;
  const lockTime = 2 * 60 * 60 * 1000; // 2 hours
  
  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked()) {
    updates.$set = { lockUntil: Date.now() + lockTime };
  }
  
  return this.updateOne(updates);
};

// Reset login attempts
userSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({
    $set: { loginAttempts: 0, lastLogin: Date.now() },
    $unset: { lockUntil: 1 }
  });
};

// Generate and save OTP for password reset
// Changed from 10 minutes to 5 minutes as per use case requirement
userSchema.methods.generatePasswordResetOTP = function() {
  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Set OTP to expire in 5 minutes (as per use case requirement)
  const otpExpires = new Date();
  otpExpires.setMinutes(otpExpires.getMinutes() + 5);
  
  this.resetPasswordOTP = {
    code: otp,
    expires: otpExpires,
    attempts: 0 // Track verification attempts
  };
  
  return otp;
};

// Verify OTP with attempt tracking
userSchema.methods.verifyOTP = function(otp) {
  // Check if OTP exists
  if (!this.resetPasswordOTP || !this.resetPasswordOTP.code) {
    return false;
  }

  // Check if OTP has expired
  const now = new Date();
  const expiresAt = new Date(this.resetPasswordOTP.expires);
  
  if (expiresAt <= now) {
    return false;
  }

  // Increment attempts
  if (!this.resetPasswordOTP.attempts) {
    this.resetPasswordOTP.attempts = 0;
  }
  this.resetPasswordOTP.attempts += 1;

  // Lock after 5 failed attempts
  const maxAttempts = 5;
  if (this.resetPasswordOTP.attempts > maxAttempts) {
    this.resetPasswordOTP = undefined; // Clear OTP
    return false;
  }

  // Verify OTP code
  return this.resetPasswordOTP.code === otp.toString();
};

// Get remaining OTP time in minutes
userSchema.methods.getOTPTimeRemaining = function() {
  if (!this.resetPasswordOTP || !this.resetPasswordOTP.expires) {
    return 0;
  }
  
  const now = new Date();
  const expiresAt = new Date(this.resetPasswordOTP.expires);
  const diff = expiresAt - now;
  
  return Math.max(0, Math.ceil(diff / 60000)); // Convert to minutes
};

const User = mongoose.model('User', userSchema);

export default User;