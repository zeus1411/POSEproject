import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            'Please provide a valid email address'
        ]
    },
    password: {
        type: String,
        required: true
    },
    fullName: String,
    phone: String,
    addresses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address'
    }],
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    // Thêm các trường khác từ script của bạn
}, { timestamps: true });

UserSchema.pre('save', async function() {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.createJWT = function() {
    return jwt.sign(
        { userId: this._id, name: this.name, role: this.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_LIFETIME }
    );
};

UserSchema.methods.comparePassword = async function(candidatePassword) {
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    return isMatch;
};

export default mongoose.model('User', UserSchema);