import React from "react";
import { useDispatch } from "react-redux";
import { Trash2, Edit3, MapPin } from "lucide-react";
import { deleteAddress } from "../../redux/slices/addressSlice";

const AddressCard = ({ address, onEdit }) => {
  const dispatch = useDispatch();

  const handleDelete = () => {
    if (window.confirm("Bạn có chắc muốn xóa địa chỉ này không?")) {
      dispatch(deleteAddress(address._id));
    }
  };

  return (
    <div className="border rounded-xl p-4 shadow-sm bg-gray-50 hover:shadow-md transition">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="text-green-600 w-5 h-5" />
            <span className="font-semibold text-gray-800">
              {address.fullName}
            </span>
          </div>
          <p className="text-gray-600 text-sm">{address.phone}</p>
          <p className="text-gray-700 text-sm">
            {address.street}, {address.district}, {address.city}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => onEdit(address)}
            className="text-blue-600 hover:text-blue-800 transition"
            title="Chỉnh sửa"
          >
            <Edit3 className="w-5 h-5" />
          </button>
          <button
            onClick={handleDelete}
            className="text-red-500 hover:text-red-700 transition"
            title="Xóa"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddressCard;