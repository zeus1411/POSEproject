import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    fullName: {
      type: String,
      required: [true, 'Vui lòng nhập họ tên người nhận'],
      trim: true,
      maxlength: [100, 'Họ tên không được vượt quá 100 ký tự']
    },
    phone: {
      type: String,
      required: [true, 'Vui lòng nhập số điện thoại'],
      trim: true,
      match: [/(84|0[3|5|7|8|9])+([0-9]{8})\b/g, 'Số điện thoại không hợp lệ']
    },
    // Địa chỉ chi tiết (số nhà, tên đường)
    street: {
      type: String,
      required: [true, 'Vui lòng nhập địa chỉ cụ thể'],
      trim: true,
      maxlength: [200, 'Địa chỉ không được vượt quá 200 ký tự']
    },
    // Phường/Xã
    ward: {
      type: String,
      required: [true, 'Vui lòng chọn phường/xã'],
      trim: true
    },
    wardCode: {
      type: String,
      trim: true
    },
    // Quận/Huyện
    district: {
      type: String,
      required: [true, 'Vui lòng chọn quận/huyện'],
      trim: true
    },
    districtId: {
      type: Number
    },
    // Tỉnh/Thành phố
    city: {
      type: String,
      required: [true, 'Vui lòng chọn tỉnh/thành phố'],
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
    // Loại địa chỉ
    type: {
      type: String,
      enum: ['HOME', 'OFFICE', 'OTHER'],
      default: 'HOME'
    },
    // Địa chỉ mặc định
    isDefault: {
      type: Boolean,
      default: false
    },
    // Ghi chú thêm (VD: Gần chợ, cạnh trường học...)
    notes: {
      type: String,
      maxlength: [500, 'Ghi chú không được vượt quá 500 ký tự']
    }
  },
  {
    timestamps: true
  }
);

// Index
addressSchema.index({ userId: 1, isDefault: 1 });
addressSchema.index({ userId: 1, createdAt: -1 });

// Đảm bảo chỉ có 1 địa chỉ mặc định cho mỗi user
addressSchema.pre('save', async function (next) {
  if (this.isDefault) {
    // Bỏ default của các địa chỉ khác
    await this.constructor.updateMany(
      { userId: this.userId, _id: { $ne: this._id } },
      { $set: { isDefault: false } }
    );
  }
  next();
});

// Method: Định dạng địa chỉ đầy đủ
addressSchema.methods.getFullAddress = function () {
  return `${this.street}, ${this.ward}, ${this.district}, ${this.city}, ${this.country}`;
};

// Static method: Lấy địa chỉ mặc định của user
addressSchema.statics.getDefaultAddress = function (userId) {
  return this.findOne({ userId, isDefault: true });
};

// Static method: Lấy tất cả địa chỉ của user
addressSchema.statics.getUserAddresses = function (userId) {
  return this.find({ userId }).sort('-isDefault -createdAt');
};

const Address = mongoose.model('Address', addressSchema);

export default Address;