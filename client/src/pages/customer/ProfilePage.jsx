import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCustomerProfile } from "../../redux/slices/customerSlice";
import { Mail, Phone, Calendar, User, MapPin, Lock } from "lucide-react";
import { fetchAddresses } from "../../redux/slices/addressSlice";
import AddressCard from "../../components/customer/AddressCard";
import AddressFormModal from "../../components/customer/AddressFormModal";
import EditProfileModal from "../../components/customer/EditProfileModal";

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { profile, loading } = useSelector((state) => state.customer);  
  const { list, loading: addressLoading } = useSelector((state) => state.address);
  const [activeTab, setActiveTab] = useState("profile");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  
  const handleSaveProfile = (updatedData) => {
    console.log("Dữ liệu đã cập nhật:", updatedData);};
    // TODO: dispatch(updateCustomerProfile(updatedData)) khi backend sẵn sàng
    
  useEffect(() => {
    dispatch(fetchCustomerProfile());
    dispatch(fetchAddresses());
  }, [dispatch]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-[60vh] text-gray-600 text-lg">
        Đang tải thông tin người dùng...
      </div>
    );

  if (!profile)
    return (
      <div className="flex justify-center items-center h-[60vh] text-red-500 text-lg">
        Không tìm thấy thông tin người dùng.
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-10 mt-10">
      {/* Tabs */}
      <div className="flex justify-around border-b mb-6 text-gray-600 font-medium">
        <button
          onClick={() => setActiveTab("profile")}
          className={`pb-3 px-4 border-b-2 ${
            activeTab === "profile"
              ? "border-green-600 text-green-600"
              : "border-transparent hover:text-green-600"
          }`}
        >
          Thông tin cá nhân
        </button>
        <button
          onClick={() => setActiveTab("address")}
          className={`pb-3 px-4 border-b-2 ${
            activeTab === "address"
              ? "border-green-600 text-green-600"
              : "border-transparent hover:text-green-600"
          }`}
        >
          Địa chỉ giao hàng
        </button>
        <button
          onClick={() => setActiveTab("password")}
          className={`pb-3 px-4 border-b-2 ${
            activeTab === "password"
              ? "border-green-600 text-green-600"
              : "border-transparent hover:text-green-600"
          }`}
        >
          Đổi mật khẩu
        </button>
      </div>

      {/* Nội dung tab */}
      {activeTab === "profile" && (
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex flex-col items-center md:w-1/3">
            <img
              src={profile?.avatar || "https://via.placeholder.com/150"}
              alt="avatar"
              className="w-44 h-44 rounded-full border-4 border-green-500 shadow-md object-cover"
            />
            <h2 className="mt-4 text-2xl font-bold text-gray-800">
              {profile?.name || "Chưa có tên"}
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Thành viên từ{" "}
              {profile?.createdAt
                ? new Date(profile.createdAt).toLocaleDateString("vi-VN")
                : "Không rõ"}
            </p>
          </div>

          <div className="md:w-2/3 w-full space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="text-green-600 w-5 h-5" />
              <span className="text-gray-700">
                {profile?.email || "Chưa có email"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="text-green-600 w-5 h-5" />
              <span className="text-gray-700">
                {profile?.phone || "Chưa có số điện thoại"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="text-green-600 w-5 h-5" />
              <span className="text-gray-700">
                Ngày sinh: {profile?.dob || "Chưa cập nhật"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <User className="text-green-600 w-5 h-5" />
              <span className="text-gray-700">
                Giới tính: {profile?.gender || "Chưa cập nhật"}
              </span>
            </div>
            <button
            className="mt-6 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition w-full md:w-auto"
            onClick={() => setIsEditProfileOpen(true)}
            >
            Cập nhật thông tin
            </button>
          </div>
        </div>
      )}

            {/* Tab Địa chỉ */}
      {activeTab === "address" && (
        <div className="mt-4 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="text-green-600" />
            <h3 className="text-xl font-semibold text-gray-700">
              Địa chỉ giao hàng của bạn
            </h3>
          </div>

          {addressLoading ? (
            <p>Đang tải địa chỉ...</p>
          ) : list?.length > 0 ? (
            list.map((addr) => (
              <AddressCard
                key={addr._id}
                address={addr}
                onEdit={(a) => {
                  setEditingAddress(a);
                  setIsModalOpen(true);
                }}
              />
            ))
          ) : (
            <p className="text-gray-500">Chưa có địa chỉ nào.</p>
          )}

          <button
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            onClick={() => {
              setEditingAddress(null);
              setIsModalOpen(true);
            }}
          >
            + Thêm địa chỉ mới
          </button>

            <AddressFormModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              editingAddress={editingAddress}
            />
        </div>
      )}

      {/* Tab Đổi mật khẩu */}
      {activeTab === "password" && (
        <div className="mt-4 md:w-1/2 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="text-green-600" />
            <h3 className="text-xl font-semibold text-gray-700">
              Đổi mật khẩu
            </h3>
          </div>

          <form className="space-y-4">
            <input
              type="password"
              placeholder="Mật khẩu hiện tại"
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 outline-none"
            />
            <input
              type="password"
              placeholder="Mật khẩu mới"
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 outline-none"
            />
            <input
              type="password"
              placeholder="Nhập lại mật khẩu mới"
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 outline-none"
            />
            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
            >
              Cập nhật mật khẩu
            </button>
          </form>
        </div>
      )}

      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        profile={profile}
        onSave={handleSaveProfile}
        />
    </div>
  );
};

export default ProfilePage;