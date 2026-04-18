import React, { useEffect, useState } from 'react';
import RichTextEditor from '../../../client-eco/components/admin/RichTextEditor';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import blogService from '../../services/blogService';

const BlogForm = ({
  blog,
  categories,
  tags,
  onSubmit,
  onCancel,
  isLoading
}) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: [],
    coverImage: null,
    status: 'DRAFT'
  });

  const [preview, setPreview] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [productQuery, setProductQuery] = useState('');    
  const [productResults, setProductResults] = useState([]);

  

  // 🔥 Slug preview
  const generateSlug = (text) =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');

  useEffect(() => {
    if (blog) {
      setFormData({
        title: blog.title || '',
        content: blog.content || '',
        category: blog.category?._id || '',
        tags: blog.tags?.map((t) => t._id) || [],
        coverImage: null,
        status: blog.status || 'DRAFT'
      });
      if (blog?.relatedProducts?.length > 0) {
        setRelatedProducts(blog.relatedProducts); 
        // blog.relatedProducts đã populated với {_id, name, sku, price,...} từ BE
      }
      setPreview(blog.coverImage?.url || null);
    }
  }, [blog]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // check category
    if (!formData.category) {
      toast.error("Phải chọn danh mục");
      return;
    }

    // tạo mới mới bắt buộc có ảnh
    if (!blog && !formData.coverImage) {
      toast.error("Phải chọn ảnh bìa");
      return;
    }

    const data = new FormData();

    data.append('title', formData.title);
    data.append('content', formData.content);
    data.append('status', formData.status);

    // chỉ gửi nếu có category
    if (formData.category) {
      data.append('category', formData.category);
    }

    data.append('tags', JSON.stringify(formData.tags));

    if (formData.coverImage) {
      data.append('coverImage', formData.coverImage);
    }

    // sản phẩm liên kết
    if (relatedProducts.length > 0) {
      data.append(
        'relatedProducts',
        JSON.stringify(
          relatedProducts.map(p => p._id)
        )
      );
    }

    onSubmit(data);
  };

  const toggleTag = (tagId) => {
    setFormData({
      ...formData,
      tags: formData.tags.includes(tagId)
        ? formData.tags.filter((t) => t !== tagId)
        : [...formData.tags, tagId]
    });
  };

  const removeTag = (tagId) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tagId)
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
      <div className="bg-white w-full max-w-6xl rounded-2xl shadow-xl overflow-y-auto max-h-[95vh] p-6 animate-fadeIn">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6 border-b pb-3">
          <h2 className="text-2xl font-bold">
            {blog ? '✏️ Chỉnh sửa bài viết' : '📝 Tạo bài viết'}
          </h2>
          <button
            onClick={onCancel}
            className="p-1 rounded-full hover:bg-gray-200 transition"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* TITLE */}
          <div>
            <label className="font-medium">Tiêu đề</label>
            <input
              type="text"
              className="w-full border p-3 rounded-lg mt-1 focus:ring-2 focus:ring-blue-500 transition"
              placeholder="Nhập tiêu đề..."
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
            {formData.title && (
              <p className="text-sm text-gray-500 mt-1">
                URL: /blog/{generateSlug(formData.title)}
              </p>
            )}
          </div>

          {/* CATEGORY */}
          <div>
            <label className="font-medium">Danh mục</label>
            <select
              className="w-full border p-3 rounded-lg mt-1 focus:ring-2 focus:ring-blue-500 transition"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
            >
              <option value="">-- Chọn danh mục --</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* TAGS */}
          <div>
            <label className="font-medium">Tags</label>
            {/* Selected tags */}
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map((tagId) => {
                const tag = tags.find((t) => t._id === tagId);
                return (
                  <span
                    key={tagId}
                    className="flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                  >
                    {tag?.name}
                    <X
                      size={14}
                      className="cursor-pointer hover:text-red-600"
                      onClick={() => removeTag(tagId)}
                    />
                  </span>
                );
              })}
            </div>

            {/* Available tags */}
            <div className="flex flex-wrap gap-2 mt-3 border p-3 rounded-lg max-h-32 overflow-y-auto">
              {tags.map((tag) => (
                <button
                  type="button"
                  key={tag._id}
                  onClick={() => toggleTag(tag._id)}
                  className={`px-3 py-1 rounded-full text-sm border transition ${
                    formData.tags.includes(tag._id)
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>

          {/* RELATED PRODUCTS */}
          <div>
            <label className="font-medium">Sản phẩm đính kèm</label>

            {/* Input search */}
            <input
              type="text"
              className="w-full border p-2 rounded-lg mt-1 focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập tên sản phẩm..."
              value={productQuery}
              onChange={async (e) => {
                const q = e.target.value;
                setProductQuery(q);

                if (!q) {
                  setProductResults([]);
                  return;
                }

                try {
                  const results = await blogService.searchProductsQuick(q);
                  setProductResults(results);
                } catch (err) {
                  console.error(err);
                }
              }}
            />

            {/* Kết quả search */}
            {productResults.length > 0 && (
              <div className="border rounded-lg mt-2 max-h-40 overflow-y-auto">
                {productResults.map((p) => (
                  <div
                    key={p._id}
                    className="p-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                    onClick={() => {
                      if (!relatedProducts.find((rp) => rp._id === p._id)) {
                        setRelatedProducts([...relatedProducts, p]);
                      }
                      setProductQuery('');
                      setProductResults([]);
                    }}
                  >
                    <span>{p.name} ({p.sku})</span>
                    <span className="text-sm text-gray-500">{p.price}₫</span>
                  </div>
                ))}
              </div>
            )}

            {/* Sản phẩm đã chọn */}
            {relatedProducts.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {relatedProducts.map((p) => (
                  <span
                    key={p._id}
                    className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm"
                  >
                    {p.name}
                    <X
                      size={14}
                      className="cursor-pointer hover:text-red-600"
                      onClick={() =>
                        setRelatedProducts(
                          relatedProducts.filter((rp) => rp._id !== p._id)
                        )
                      }
                    />
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* COVER IMAGE */}
          <div className="flex flex-col gap-2">
            <label className="font-medium">Ảnh bìa</label>

            <input
              type="file"
              className="mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              onChange={(e) => {
                const file = e.target.files[0];
                setFormData({ ...formData, coverImage: file });
                setPreview(URL.createObjectURL(file));
              }}
            />

            {preview && (
              <div className="mt-2 flex flex-col gap-1 border rounded-lg">
                <img
                  src={preview}
                  alt="preview"
                  className="w-full h-auto rounded-lg"
                />
                <p className="text-xs text-gray-500">
                  Chọn ảnh mới sẽ thay thế ảnh cũ
                </p>
              </div>
            )}
          </div>

          {/* CONTENT */}
          <div>
            <label className="font-medium">Nội dung</label>
            <div className="mt-2 border rounded-lg min-h-[200px]">
              <RichTextEditor
                value={formData.content}
                onChange={(content) =>
                  setFormData({ ...formData, content })
                }
                style={{ minHeight: '250px' }}
              />
            </div>
          </div>

          {/* STATUS */}
          <div>
            <label className="font-medium">Trạng thái</label>
            <select
              className="w-full border p-3 rounded-lg mt-1 focus:ring-2 focus:ring-blue-500 transition"
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
            >
              <option value="DRAFT">Draft</option>
              <option value="PENDING">Chờ duyệt</option>
              <option value="PUBLISHED">Published</option>
              <option value="HIDDEN">Ẩn</option>
            </select>
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2 border rounded-lg hover:bg-gray-100 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              {isLoading ? 'Đang lưu...' : '💾 Lưu bài viết'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BlogForm;