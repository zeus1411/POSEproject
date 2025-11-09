<<<<<<< HEAD
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
=======
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { User, MapPin, Phone, Mail, Edit2, Save, X } from 'lucide-react';
import userService from '../../services/userService';
import addressService from '../../services/addressService';
import { setUser } from '../../redux/slices/authSlice'; // Import action

const ProfilePage = () => {
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Personal info form
  const [personalData, setPersonalData] = useState({
    fullName: '',
    phone: '',
    dateOfBirth: '',
    gender: ''
  });
  
  // Address form
  const [addressData, setAddressData] = useState({
    street: '',
    ward: '',
    wardCode: '',
    district: '',
    districtId: '',
    city: '',
    cityId: '',
    notes: ''
  });

  // Location data
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [loadingLocation, setLoadingLocation] = useState(false);

  useEffect(() => {
    if (user) {
      // Load personal info
      setPersonalData({
        fullName: user.fullName || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
        gender: user.gender || ''
      });

      // Load address
      if (user.address) {
        setAddressData({
          street: user.address.street || '',
          ward: user.address.ward || '',
          wardCode: user.address.wardCode || '',
          district: user.address.district || '',
          districtId: user.address.districtId || '',
          city: user.address.city || '',
          cityId: user.address.cityId || '',
          notes: user.address.notes || ''
        });

        // Load districts and wards if editing
        if (user.address.cityId) {
          loadDistricts(user.address.cityId);
        }
        if (user.address.districtId) {
          loadWards(user.address.districtId);
        }
      }
    }
  }, [user]);

  useEffect(() => {
    if (isEditingAddress) {
      loadProvinces();
    }
  }, [isEditingAddress]);

  const loadProvinces = async () => {
    try {
      setLoadingLocation(true);
      const response = await addressService.getProvinces();
      setProvinces(response.data.provinces || []);
    } catch (error) {
      console.error('Error loading provinces:', error);
    } finally {
      setLoadingLocation(false);
    }
  };

  const loadDistricts = async (provinceId) => {
    try {
      setLoadingLocation(true);
      const response = await addressService.getDistricts(provinceId);
      setDistricts(response.data.districts || []);
    } catch (error) {
      console.error('Error loading districts:', error);
    } finally {
      setLoadingLocation(false);
    }
  };

  const loadWards = async (districtId) => {
    try {
      setLoadingLocation(true);
      const response = await addressService.getWards(districtId);
      setWards(response.data.wards || []);
    } catch (error) {
      console.error('Error loading wards:', error);
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleProvinceChange = (e) => {
    const selectedId = e.target.value;
    const selectedProvince = provinces.find(p => p.id === parseInt(selectedId));
    
    if (selectedProvince) {
      setAddressData(prev => ({
        ...prev,
        cityId: selectedProvince.id,
        city: selectedProvince.name,
        districtId: '',
        district: '',
        wardCode: '',
        ward: ''
      }));
      loadDistricts(selectedProvince.id);
      setWards([]);
    }
  };

  const handleDistrictChange = (e) => {
    const selectedId = e.target.value;
    const selectedDistrict = districts.find(d => d.id === parseInt(selectedId));
    
    if (selectedDistrict) {
      setAddressData(prev => ({
        ...prev,
        districtId: selectedDistrict.id,
        district: selectedDistrict.name,
        wardCode: '',
        ward: ''
      }));
      loadWards(selectedDistrict.id);
    }
  };

  const handleWardChange = (e) => {
    const selectedId = e.target.value;
    const selectedWard = wards.find(w => w.id === parseInt(selectedId));
    
    if (selectedWard) {
      setAddressData(prev => ({
        ...prev,
        wardCode: selectedWard.id,
        ward: selectedWard.name
      }));
    }
  };

  // ✅ FIX: Fetch lại user data sau khi update
  const refreshUserData = async () => {
    try {
      const response = await userService.getCurrentUser();
      if (response.success) {
        dispatch(setUser(response.data.user));
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  const handleUpdatePersonal = async () => {
    try {
      setLoading(true);
      const response = await userService.updateProfile(personalData);
      
      if (response.success) {
        // ✅ Cập nhật Redux store với data mới từ API response
        dispatch(setUser(response.data.user));
        
        // ✅ FORCE RELOAD user data để bypass cache
        setTimeout(async () => {
          try {
            const freshUserData = await userService.getCurrentUser();
            if (freshUserData.success) {
              dispatch(setUser(freshUserData.data.user));
            }
          } catch (err) {
            console.error('Error refreshing user data:', err);
          }
        }, 100);
        
        setIsEditingPersonal(false);
        alert('Cập nhật thông tin cá nhân thành công!');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAddress = async () => {
    try {
      setLoading(true);
      const response = await userService.updateProfile({ address: addressData });
      
      if (response.success) {
        // ✅ Cập nhật Redux store với data mới từ API response
        dispatch(setUser(response.data.user));
        setIsEditingAddress(false);
        alert('Cập nhật địa chỉ thành công!');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const getFullAddress = () => {
    if (!user?.address?.street) return 'Chưa cập nhật địa chỉ';
    const { street, ward, district, city } = user.address;
    return `${street}, ${ward}, ${district}, ${city}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user?.username}</h1>
              <p className="text-gray-600 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Thông tin cá nhân</h2>
            {!isEditingPersonal ? (
              <button
                onClick={() => setIsEditingPersonal(true)}
                className="flex items-center gap-2 px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Chỉnh sửa
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditingPersonal(false)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
                <button
                  onClick={handleUpdatePersonal}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            )}
          </div>

          {!isEditingPersonal ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-gray-600 w-32">Họ tên:</span>
                <span className="text-gray-900">{user?.fullName || 'Chưa cập nhật'}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-600 w-32">Số điện thoại:</span>
                <span className="text-gray-900">{user?.phone || 'Chưa cập nhật'}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-600 w-32">Ngày sinh:</span>
                <span className="text-gray-900">
                  {user?.dateOfBirth 
                    ? new Date(user.dateOfBirth).toLocaleDateString('vi-VN')
                    : 'Chưa cập nhật'
                  }
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-600 w-32">Giới tính:</span>
                <span className="text-gray-900">
                  {user?.gender === 'male' ? 'Nam' : user?.gender === 'female' ? 'Nữ' : 'Chưa cập nhật'}
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên</label>
                <input
                  type="text"
                  value={personalData.fullName}
                  onChange={(e) => setPersonalData({...personalData, fullName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Nguyễn Văn A"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                <input
                  type="tel"
                  value={personalData.phone}
                  onChange={(e) => setPersonalData({...personalData, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="0912345678"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
                <input
                  type="date"
                  value={personalData.dateOfBirth}
                  onChange={(e) => setPersonalData({...personalData, dateOfBirth: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="male"
                      checked={personalData.gender === 'male'}
                      onChange={(e) => setPersonalData({...personalData, gender: e.target.value})}
                      className="mr-2"
                    />
                    Nam
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="female"
                      checked={personalData.gender === 'female'}
                      onChange={(e) => setPersonalData({...personalData, gender: e.target.value})}
                      className="mr-2"
                    />
                    Nữ
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Address */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="w-6 h-6" />
              Địa chỉ giao hàng
            </h2>
            {!isEditingAddress ? (
              <button
                onClick={() => setIsEditingAddress(true)}
                className="flex items-center gap-2 px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                {user?.address?.street ? 'Chỉnh sửa' : 'Thêm địa chỉ'}
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditingAddress(false)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
                <button
                  onClick={handleUpdateAddress}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            )}
          </div>

          {!isEditingAddress ? (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-900">{getFullAddress()}</p>
              {user?.address?.notes && (
                <p className="text-gray-600 text-sm mt-2">Ghi chú: {user.address.notes}</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tỉnh/Thành phố *
                </label>
                <select
                  value={addressData.cityId}
                  onChange={handleProvinceChange}
                  disabled={loadingLocation}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">-- Chọn tỉnh/thành phố --</option>
                  {provinces.map(province => (
                    <option key={province.id} value={province.id}>
                      {province.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quận/Huyện *
                </label>
                <select
                  value={addressData.districtId}
                  onChange={handleDistrictChange}
                  disabled={!addressData.cityId || loadingLocation}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">-- Chọn quận/huyện --</option>
                  {districts.map(district => (
                    <option key={district.id} value={district.id}>
                      {district.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phường/Xã *
                </label>
                <select
                  value={addressData.wardCode}
                  onChange={handleWardChange}
                  disabled={!addressData.districtId || loadingLocation}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">-- Chọn phường/xã --</option>
                  {wards.map(ward => (
                    <option key={ward.id} value={ward.id}>
                      {ward.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Địa chỉ cụ thể (số nhà, tên đường) *
                </label>
                <input
                  type="text"
                  value={addressData.street}
                  onChange={(e) => setAddressData({...addressData, street: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Số 123, Đường Nguyễn Văn Linh"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ghi chú (tùy chọn)
                </label>
                <textarea
                  value={addressData.notes}
                  onChange={(e) => setAddressData({...addressData, notes: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  placeholder="VD: Gần chợ, cạnh trường học..."
                />
              </div>
            </div>
          )}
        </div>

      </div>
>>>>>>> main
    </div>
  );
};

export default ProfilePage;