import React, { useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';

const RichTextEditor = ({ value, onChange, placeholder, error }) => {
  const editorRef = useRef(null);

  const handleEditorChange = (content, editor) => {
    onChange(content);
  };

  return (
    <div>
      <Editor
        apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
        onInit={(evt, editor) => editorRef.current = editor}
        value={value}
        onEditorChange={handleEditorChange}
        init={{
          height: 400,
          menubar: false,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
          ],
          toolbar: 'undo redo | blocks | ' +
            'bold italic forecolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | image link | help',
          content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
          placeholder: placeholder || 'Nhập mô tả sản phẩm...',
          images_upload_handler: async (blobInfo, progress) => {
            return new Promise((resolve, reject) => {
              const formData = new FormData();
              formData.append('image', blobInfo.blob(), blobInfo.filename());

              const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

              // Upload ảnh lên server
              fetch(`${API_URL}/products/upload-description-image`, {
                method: 'POST',
                body: formData,
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
              })
                .then(response => response.json())
                .then(result => {
                  if (result.success && result.imageUrl) {
                    resolve(result.imageUrl);
                  } else {
                    reject('Upload failed: ' + (result.message || 'Unknown error'));
                  }
                })
                .catch(error => {
                  reject('Upload failed: ' + error.message);
                });
            });
          },
          // Cấu hình thêm
          paste_data_images: true,
          automatic_uploads: true,
          file_picker_types: 'image',
          content_langs: [
            { title: 'Vietnamese', code: 'vi' },
            { title: 'English', code: 'en' }
          ],
          language: 'vi',
          branding: false,
        }}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default RichTextEditor;
