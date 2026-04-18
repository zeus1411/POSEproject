import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, 'Vui lòng nhập nội dung bình luận'],
      trim: true,
      maxlength: [1000, 'Bình luận không được vượt quá 1000 ký tự']
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    blog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog',
      required: true
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'HIDDEN'],
      default: 'ACTIVE'
    }
  },
  {
    timestamps: true
  }
);

// Indexes
commentSchema.index({ blog: 1, createdAt: -1 });
commentSchema.index({ author: 1 });

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
