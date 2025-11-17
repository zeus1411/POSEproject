import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const EditProfileModal = ({ isOpen, onClose, profile, onSave }) => {
  const [form, setForm] = useState({
    username: "",
    name: "",
    phone: "",
    dob: "",
    gender: "",
  });

  useEffect(() => {
    if (profile) {
      setForm({
        username: profile.username || "",
        name: profile.name || "",
        phone: profile.phone || "",
        dob: profile.dob || "",
        gender: profile.gender || "",
      });
    }
  }, [profile]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-600 hover:text-black">
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold text-gray-800 mb-4">Cập nhật thông tin</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-lg"
            placeholder="Tên người dùng"
            minLength={3}
            maxLength={30}
          />

          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-lg"
            placeholder="Họ và tên"
          />

          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-lg"
            placeholder="Số điện thoại"
          />

          <input
            name="dob"
            value={form.dob}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-lg"
            placeholder="Ngày sinh (YYYY-MM-DD)"
          />

          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-lg"
          >
            <option value="">Giới tính</option>
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
            <option value="Khác">Khác</option>
          </select>

          <button type="submit" className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
            Lưu thay đổi
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;