import mongoose from 'mongoose';
import crypto from 'crypto';

const registrationOTPSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email là bắt buộc'],
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Email không hợp lệ'
      ]
    },
    otp: {
      type: String,
      required: [true, 'OTP là bắt buộc']
    },
    username: {
      type: String,
      trim: true
    },
    password: {
      type: String
    },
    // Thông tin bổ sung từ form đăng ký
    additionalData: {
      type: mongoose.Schema.Types.Mixed
    },
    attempts: {
      type: Number,
      default: 0,
      max: 5
    },
    verified: {
      type: Boolean,
      default: false
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 5 * 60 * 1000), // 5 phút
      index: { expires: 0 } // TTL index - tự động xóa sau khi hết hạn
    }
  },
  {
    timestamps: true
  }
);

// Index để tìm kiếm nhanh
registrationOTPSchema.index({ email: 1, verified: 1 });
registrationOTPSchema.index({ expiresAt: 1 }); // TTL index

/**
 * Generate random 6-digit OTP
 */
registrationOTPSchema.statics.generateOTP = function() {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Create or update OTP for email registration
 */
registrationOTPSchema.statics.createOTP = async function(email, username, password, additionalData = {}) {
  // Xóa OTP cũ chưa verified của email này
  await this.deleteMany({ email, verified: false });
  
  const otp = this.generateOTP();
  
  const otpDoc = await this.create({
    email,
    otp,
    username,
    password,
    additionalData,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000)
  });
  
  return { otp, expiresAt: otpDoc.expiresAt };
};

/**
 * Verify OTP for registration
 */
registrationOTPSchema.statics.verifyOTP = async function(email, otp) {
  const otpDoc = await this.findOne({ 
    email, 
    verified: false,
    expiresAt: { $gt: new Date() }
  });
  
  if (!otpDoc) {
    throw new Error('OTP không tồn tại hoặc đã hết hạn');
  }
  
  // Tăng số lần thử
  otpDoc.attempts += 1;
  
  if (otpDoc.attempts > 5) {
    await otpDoc.deleteOne();
    throw new Error('Bạn đã nhập sai OTP quá nhiều lần. Vui lòng yêu cầu mã mới');
  }
  
  if (otpDoc.otp !== otp) {
    await otpDoc.save();
    throw new Error(`Mã OTP không chính xác. Bạn còn ${5 - otpDoc.attempts} lần thử`);
  }
  
  // OTP đúng - đánh dấu đã verified
  otpDoc.verified = true;
  await otpDoc.save();
  
  return {
    email: otpDoc.email,
    username: otpDoc.username,
    password: otpDoc.password,
    additionalData: otpDoc.additionalData
  };
};

/**
 * Get registration data after OTP verified
 */
registrationOTPSchema.statics.getVerifiedData = async function(email) {
  const otpDoc = await this.findOne({ 
    email, 
    verified: true,
    expiresAt: { $gt: new Date() }
  });
  
  if (!otpDoc) {
    throw new Error('Vui lòng xác thực OTP trước');
  }
  
  return {
    email: otpDoc.email,
    username: otpDoc.username,
    password: otpDoc.password,
    additionalData: otpDoc.additionalData
  };
};

/**
 * Check if can resend OTP (prevent spam)
 */
registrationOTPSchema.statics.canResend = async function(email) {
  const otpDoc = await this.findOne({ email, verified: false });
  
  if (!otpDoc) {
    return true; // Không có OTP nào -> có thể gửi
  }
  
  const timeElapsed = Date.now() - otpDoc.createdAt.getTime();
  const minResendTime = 60 * 1000; // 1 phút
  
  if (timeElapsed < minResendTime) {
    const secondsLeft = Math.ceil((minResendTime - timeElapsed) / 1000);
    throw new Error(`Vui lòng đợi ${secondsLeft} giây trước khi gửi lại OTP`);
  }
  
  return true;
};

const RegistrationOTP = mongoose.model('RegistrationOTP', registrationOTPSchema);

export default RegistrationOTP;
