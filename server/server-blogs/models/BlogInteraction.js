import mongoose from 'mongoose';

const blogInteractionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    blogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog',
      required: true
    },
    type: {
      type: String,
      enum: ['LIKE', 'BOOKMARK'],
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Unique compound index: One user can ONLY have one type of interaction per blog
blogInteractionSchema.index({ userId: 1, blogId: 1, type: 1 }, { unique: true });
blogInteractionSchema.index({ blogId: 1, type: 1 }); // For counting likes/bookmarks fast

const BlogInteraction = mongoose.model('BlogInteraction', blogInteractionSchema);

export default BlogInteraction;
