import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { addAddress, updateAddress } from "../../redux/slices/addressSlice";

const AddressFormModal = ({ isOpen, onClose, editingAddress }) => {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    district: "",
  });

  // Khi mở modal và có địa chỉ đang chỉnh sửa → set dữ liệu sẵn
  useEffect(() => {
    if (editingAddress) {
      setFormData({
        fullName: editingAddress.fullName || "",
        phone: editingAddress.phone || "",
        street: editingAddress.street || "",
        city: editingAddress.city || "",
        district: editingAddress.district || "",
      });
    } else {
      setFormData({
        fullName: "",
        phone: "",
        street: "",
        city: "",
        district: "",
      });
    }
  }, [editingAddress, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingAddress) {
        await dispatch(
          updateAddress({ id: editingAddress._id, data: formData })
        ).unwrap();
      } else {
        await dispatch(addAddress(formData)).unwrap();
      }
      onClose();
    } catch (err) {
      console.error("Lỗi khi lưu địa chỉ:", err);
      alert("Không thể lưu địa chỉ, vui lòng thử lại!");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-md relative">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          {editingAddress ? "✏️ Chỉnh sửa địa chỉ" : "➕ Thêm địa chỉ mới"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            name="fullName"
            placeholder="Họ và tên"
            value={formData.fullName}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
          <input
            type="text"
            name="phone"
            placeholder="Số điện thoại"
            value={formData.phone}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
          <input
            type="text"
            name="street"
            placeholder="Địa chỉ (số nhà, tên đường...)"
            value={formData.street}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
          <input
            type="text"
            name="district"
            placeholder="Quận / Huyện"
            value={formData.district}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
          <input
            type="text"
            name="city"
            placeholder="Tỉnh / Thành phố"
            value={formData.city}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              onClick={onClose}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              {editingAddress ? "Cập nhật" : "Thêm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddressFormModal;