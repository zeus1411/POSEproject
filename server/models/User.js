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
    
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    
    // ========== THÔNG TIN CÁ NHÂN ==========
    fullName: {
      type: String,
      trim: true,
      maxlength: [100, 'Họ tên không được vượt quá 100 ký tự']
    },
    phone: {
      type: String,
      trim: true,
      match: [/(84|0[3|5|7|8|9])+([0-9]{8})\b/g, 'Số điện thoại không hợp lệ']
    },
    dateOfBirth: {
      type: Date
    },
    gender: {
      type: String,
      enum: ['male', 'female', null],
      default: null
    },
    avatar: {
      type: String,
      default: 'https://res.cloudinary.com/default-avatar.png'
    },
    
    // ========== GOOGLE OAUTH ==========
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Cho phép null và không bắt buộc unique khi null
    },
    
    // ========== ĐỊA CHỈ (KHÔNG có fullName, phone) ==========
    address: {
      // Địa chỉ chi tiết (số nhà, tên đường)
      street: {
        type: String,
        trim: true,
        maxlength: [200, 'Địa chỉ không được vượt quá 200 ký tự']
      },
      // Phường/Xã
      ward: {
        type: String,
        trim: true
      },
      wardCode: {
        type: String,
        trim: true
      },
      // Quận/Huyện
      district: {
        type: String,
        trim: true
      },
      districtId: {
        type: Number
      },
      // Tỉnh/Thành phố
      city: {
        type: String,
        trim: true
      },
      cityId: {
        type: Number
      },
      country: {
        type: String,
        default: 'Việt Nam'
      },
      postalCode: {
        type: String,
        trim: true
      },
      // Ghi chú địa chỉ
      notes: {
        type: String,
        maxlength: [500, 'Ghi chú không được vượt quá 500 ký tự']
      }
    },
    
    // ========== HỆ THỐNG ==========
    isActive: {
      type: Boolean,
      default: true
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    resetPasswordOTP: {
      code: String,
      expires: Date,
      attempts: {
        type: Number,
        default: 0
      }
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
userSchema.methods.generatePasswordResetOTP = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  const otpExpires = new Date();
  otpExpires.setMinutes(otpExpires.getMinutes() + 5);
  
  this.resetPasswordOTP = {
    code: otp,
    expires: otpExpires,
    attempts: 0
  };
  
  return otp;
};

// Verify OTP with attempt tracking
userSchema.methods.verifyOTP = function(otp) {
  if (!this.resetPasswordOTP || !this.resetPasswordOTP.code) {
    return false;
  }

  const now = new Date();
  const expiresAt = new Date(this.resetPasswordOTP.expires);
  
  if (expiresAt <= now) {
    return false;
  }

  if (!this.resetPasswordOTP.attempts) {
    this.resetPasswordOTP.attempts = 0;
  }
  this.resetPasswordOTP.attempts += 1;

  const maxAttempts = 5;
  if (this.resetPasswordOTP.attempts > maxAttempts) {
    this.resetPasswordOTP = undefined;
    return false;
  }

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
  
  return Math.max(0, Math.ceil(diff / 60000));
};

// ========== METHODS MỚI - ĐỊA CHỈ ==========

// Kiểm tra user đã có địa chỉ chưa
userSchema.methods.hasAddress = function() {
  return !!(this.address && this.address.street && this.address.city);
};

// Lấy địa chỉ đầy đủ để hiển thị
userSchema.methods.getFullAddress = function() {
  if (!this.hasAddress()) {
    return null;
  }
  
  return `${this.address.street}, ${this.address.ward}, ${this.address.district}, ${this.address.city}, ${this.address.country}`;
};

// Lấy thông tin giao hàng (dùng cho Order)
userSchema.methods.getShippingInfo = function() {
  if (!this.hasAddress()) {
    throw new Error('User chưa cập nhật địa chỉ giao hàng');
  }
  
  return {
    fullName: this.fullName || this.username,
    phone: this.phone,
    street: this.address.street,
    ward: this.address.ward,
    district: this.address.district,
    city: this.address.city,
    country: this.address.country || 'Việt Nam',
    postalCode: this.address.postalCode
  };
};

const User = mongoose.model('User', userSchema);

export default User;