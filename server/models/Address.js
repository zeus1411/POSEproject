import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    fullName: {
      type: String,
      required: [true, 'Vui lòng nhập họ tên'],
      trim: true,
      maxlength: [100, 'Họ tên không được vượt quá 100 ký tự']
    },
    phone: {
      type: String,
      required: [true, 'Vui lòng nhập số điện thoại'],
      match: [/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ']
    },
    street: {
      type: String,
      required: [true, 'Vui lòng nhập địa chỉ đường'],
      trim: true
    },
    ward: {
      type: String,
      required: [true, 'Vui lòng nhập phường/xã'],
      trim: true
    },
    district: {
      type: String,
      required: [true, 'Vui lòng nhập quận/huyện'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'Vui lòng nhập tỉnh/thành phố'],
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
    },
    addressType: {
      type: String,
      enum: ['HOME', 'OFFICE', 'OTHER'],
      default: 'HOME'
    },
    isDefault: {
      type: Boolean,
      default: false
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    notes: {
      type: String,
      maxlength: [200, 'Ghi chú không được vượt quá 200 ký tự']
    }
  },
  {
    timestamps: true
  }
);

// Indexes
addressSchema.index({ userId: 1 });
addressSchema.index({ userId: 1, isDefault: 1 });

// Ensure only one default address per user
addressSchema.pre('save', async function (next) {
  if (this.isDefault) {
    await this.constructor.updateMany(
      { 
        userId: this.userId, 
        _id: { $ne: this._id },
        isDefault: true 
      },
      { isDefault: false }
    );
  }
  
  next();
});

// Set as default if this is the first address
addressSchema.pre('save', async function (next) {
  if (this.isNew) {
    const count = await this.constructor.countDocuments({ userId: this.userId });
    
    if (count === 0) {
      this.isDefault = true;
    }
  }
  
  next();
});

// Update user's defaultAddressId when address is set as default
addressSchema.post('save', async function (doc) {
  if (doc.isDefault) {
    const User = mongoose.model('User');
    await User.findByIdAndUpdate(doc.userId, {
      defaultAddressId: doc._id
    });
  }
});

// Method to get formatted address string
addressSchema.methods.getFormattedAddress = function () {
  return `${this.street}, ${this.ward}, ${this.district}, ${this.city}, ${this.country}`;
};

// Method to set as default
addressSchema.methods.setAsDefault = async function () {
  // Unset other default addresses
  await this.constructor.updateMany(
    { 
      userId: this.userId, 
      _id: { $ne: this._id }
    },
    { isDefault: false }
  );
  
  this.isDefault = true;
  await this.save();
  
  return this;
};

// Static method to get user's addresses
addressSchema.statics.getUserAddresses = function (userId) {
  return this.find({ userId }).sort('-isDefault -createdAt');
};

// Static method to get default address
addressSchema.statics.getDefaultAddress = function (userId) {
  return this.findOne({ userId, isDefault: true });
};

// Prevent deletion of default address if there are other addresses
addressSchema.pre('remove', async function (next) {
  if (this.isDefault) {
    const count = await this.constructor.countDocuments({ userId: this.userId });
    
    if (count > 1) {
      // Set another address as default
      const nextAddress = await this.constructor.findOne({
        userId: this.userId,
        _id: { $ne: this._id }
      }).sort('-createdAt');
      
      if (nextAddress) {
        await nextAddress.setAsDefault();
      }
    }
  }
  
  next();
});

const Address = mongoose.model('Address', addressSchema);

export default Address;