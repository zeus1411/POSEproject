import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { User, MapPin, Phone, Mail, Edit2, Save, X, Eye, EyeOff, Camera} from 'lucide-react';
import userService from '../../services/userService';
import addressService from '../../services/addressService';
import { setUser } from '../../redux/slices/authSlice';
import { toast } from 'react-toastify';

const ProfilePage = () => {
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [loading, setLoading] = useState(false);

  // Personal info form
  const [personalData, setPersonalData] = useState({
    username: '',
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
  
  // Avatar upload
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      // Load personal info
      setPersonalData({
        username: user.username || '',
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
  // Password change
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  // Hiện/ẩn mật khẩu
  const [passwordVisible, setPasswordVisible] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const togglePasswordVisibility = (field) => {
    setPasswordVisible((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // Strength checker
  const [passwordStrength, setPasswordStrength] = useState({
    label: '',
    color: 'border-gray-300',
    textColor: 'text-gray-400',
    bar: '',
    width: '0%',
  });

  const handlePasswordChange = (value) => {
    setPasswordData({...passwordData, newPassword: value});
    checkPasswordStrength(value);
  };

  const checkPasswordStrength = (password) => {
    let strength = 0;

    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 2) {
      setPasswordStrength({
        label: 'Yếu',
        color: 'border-red-300',
        textColor: 'text-red-500',
        bar: 'bg-red-400',
        width: '25%',
      });
    } else if (strength === 3) {
      setPasswordStrength({
        label: 'Trung bình',
        color: 'border-yellow-300',
        textColor: 'text-yellow-500',
        bar: 'bg-yellow-400',
        width: '50%',
      });
    } else if (strength >= 4) {
      setPasswordStrength({
        label: 'Mạnh',
        color: 'border-green-300',
        textColor: 'text-green-500',
        bar: 'bg-green-400',
        width: '100%',
      });
    } else {
      setPasswordStrength({
        label: '',
        color: 'border-gray-300',
        textColor: 'text-gray-400',
        bar: '',
        width: '0%',
      });
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Mật khẩu xác nhận không khớp');
      return;
    }

    try {
      setLoading(true);
      const response = await userService.changePassword(passwordData);
      if (response.success) {
        alert('Đổi mật khẩu thành công!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setIsChangingPassword(false);
      } else {
        alert(response.message || 'Đổi mật khẩu thất bại');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi đổi mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  // Handle avatar upload
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match('image.*')) {
      toast.error('Vui lòng chọn file ảnh (JPEG, PNG)');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Kích thước ảnh không được vượt quá 2MB');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      setIsUploading(true);
      const response = await userService.updateAvatar(formData);
      
      // Update user in Redux store
      dispatch(setUser(response.data.user));
      
      toast.success('Cập nhật ảnh đại diện thành công');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi tải lên ảnh đại diện');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Trigger file input click
  const handleAvatarClick = () => {
    if (isUploading) return;
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div 
                className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden cursor-pointer"
                onClick={handleAvatarClick}
              >
                {user?.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 text-gray-500" />
                )}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center transition-all duration-300">
                  {isUploading ? (
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  ) : (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                  )}
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                className="hidden"
                disabled={isUploading}
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user?.username}</h1>
              <p className="text-gray-600 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {user?.email}
              </p>
              <button
                onClick={handleAvatarClick}
                disabled={isUploading}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? 'Đang tải lên...' : 'Đổi ảnh đại diện'}
              </button>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Thông tin cá nhân</h2>
            {isEditingPersonal ? (
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
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditingPersonal(true)}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
              >
                <Edit2 className="w-4 h-4" />
                Chỉnh sửa
              </button>
            )}
          </div>

          {!isEditingPersonal ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-gray-600 w-32">Tên người dùng:</span>
                <span className="text-gray-900">{user?.username || 'Chưa cập nhật'}</span>
              </div>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên người dùng</label>
                <input
                  type="text"
                  value={personalData.username}
                  onChange={(e) => setPersonalData({...personalData, username: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Tên người dùng"
                  minLength={3}
                  maxLength={30}
                />
                <p className="text-xs text-gray-500 mt-1">3-30 ký tự, bao gồm chữ cái, số và dấu gạch dưới</p>
              </div>
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

        {/* Change Password */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Đổi mật khẩu</h2>
            {!isChangingPassword ? (
              <button
                onClick={() => setIsChangingPassword(true)}
                className="flex items-center gap-2 px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Đổi mật khẩu
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setIsChangingPassword(false)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
                <button
                  onClick={handleChangePassword}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            )}
          </div>

          {isChangingPassword ? (
            <div className="space-y-5">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mật khẩu hiện tại
                </label>
                <div className="relative">
                  <input
                    type={passwordVisible.current ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Nhập mật khẩu hiện tại"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('current')}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-primary-600"
                  >
                    {passwordVisible.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <input
                    type={passwordVisible.new ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 ${
                      passwordStrength.color
                    }`}
                    placeholder="Nhập mật khẩu mới"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('new')}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-primary-600"
                  >
                    {passwordVisible.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {/* Gợi ý */}
                <p className="text-xs text-gray-500 mt-1">
                  Mật khẩu phải có ít nhất <span className="font-semibold">8 ký tự</span>, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.
                </p>

                {/* Strength meter */}
                <div className="mt-2 h-2 w-full bg-gray-200 rounded-full">
                  <div
                    className={`h-2 rounded-full transition-all ${passwordStrength.bar}`}
                    style={{ width: passwordStrength.width }}
                  ></div>
                </div>
                <p className={`text-xs mt-1 ${passwordStrength.textColor}`}>
                  {passwordStrength.label}
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Xác nhận mật khẩu mới
                </label>
                <div className="relative">
                  <input
                    type={passwordVisible.confirm ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Nhập lại mật khẩu mới"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirm')}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-primary-600"
                  >
                    {passwordVisible.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-600">Nhấn nút “Đổi mật khẩu” để thay đổi mật khẩu của bạn.</p>
          )}
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;