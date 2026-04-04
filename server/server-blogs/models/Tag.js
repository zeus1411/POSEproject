import mongoose from 'mongoose';
import slugify from '../../utils/slugify.js';

const tagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Vui lòng nhập tên thẻ'],
      unique: true,
      trim: true,
      maxlength: [50, 'Tên thẻ không được vượt quá 50 ký tự']
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true
    },
    description: {
      type: String,
      maxlength: [200, 'Mô tả không được vượt quá 200 ký tự']
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes
tagSchema.index({ slug: 1 });

// Generate slug before saving
tagSchema.pre('save', async function (next) {
  if (this.isModified('name') || !this.slug) {
    let slug = slugify(this.name);
    let slugExists = await this.constructor.findOne({ slug });
    let counter = 1;
    
    while (slugExists) {
      slug = `${slugify(this.name)}-${counter}`;
      slugExists = await this.constructor.findOne({ slug });
      counter++;
    }
    
    this.slug = slug;
  }
  
  next();
});

const Tag = mongoose.model('Tag', tagSchema);

export default Tag;

