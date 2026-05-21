import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { User, MapPin, Phone, Mail, Edit2, Save, X, Eye, EyeOff, Camera, Loader2 } from 'lucide-react';
import userService from '../../services/userService';
import addressService from '../../services/addressService';
import { setUser } from '../../redux/slices/authSlice';
import Swal from 'sweetalert2';

const ProfilePage = () => {
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Validation errors
  const [errors, setErrors] = useState({});

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
        dateOfBirth: user.dateOfBirth ? formatDateToInput(user.dateOfBirth) : '',
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

        if (user.address.cityId) {
          loadDistricts(user.address.cityId);
        }
        if (user.address.districtId) {
          loadWards(user.address.districtId);
        }
      }
    }
  }, [user]);

  const formatDateToInput = (isoDate) => {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`; 
  };

  const formatDateForDisplay = (isoDate) => {
    if (!isoDate) return 'Chưa cập nhật';
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

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

  // ✅ FIX LỖI 1 & 2 & 3: Cập nhật hàm Validation thông tin cá nhân
  const validatePersonalInfo = () => {
    const newErrors = {};
    
    // 1. Validate Họ tên (Không trống, không quá 100 ký tự, không chứa số/ký tự đặc biệt)
    if (!personalData.fullName || personalData.fullName.trim().length === 0) {
      newErrors.fullName = 'Họ tên không được để trống';
    } else if (personalData.fullName.length > 100) {
      newErrors.fullName = 'Họ tên không được vượt quá 100 ký tự';
    } else {
      // Regex cho phép chữ tiếng Việt có dấu và khoảng trắng, không cho phép số & ký tự đặc biệt
      const nameRegex = /^[\p{L}\s]+$/u;
      if (!nameRegex.test(personalData.fullName.trim())) {
        newErrors.fullName = 'Họ tên chỉ được chứa chữ cái và khoảng trắng';
      }
    }
    
    // 2. Validate Số điện thoại (Sửa regex so khớp từ đầu ^ tới cuối chuỗi $)
    if (!personalData.phone || personalData.phone.trim().length === 0) {
      newErrors.phone = 'Số điện thoại không được để trống';
    } else {
      const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
      if (!phoneRegex.test(personalData.phone.trim())) {
        newErrors.phone = 'Số điện thoại không hợp lệ (Phải là 10 số, ví dụ: 0337826369)';
      }
    }

    // 3. Validate Năm sinh / Ngày sinh
    // Kiểm tra xem ô input có đang bị nhập dở dang hay không bằng cách bắt sự kiện DOM trực tiếp
    const dateInput = document.querySelector('input[type="date"]');
    const isDateIncomplete = dateInput && dateInput.value === "" && dateInput.validity && !dateInput.validity.valid;

    if (isDateIncomplete) {
      newErrors.dateOfBirth = 'Vui lòng nhập đầy đủ ngày, tháng và năm sinh';
    } else if (personalData.dateOfBirth) {
      const selectedDate = new Date(personalData.dateOfBirth);
      const today = new Date();
      const minDate = new Date('1900-01-01');

      if (selectedDate > today) {
        newErrors.dateOfBirth = 'Ngày sinh không thể lớn hơn ngày hiện tại';
      } else if (selectedDate < minDate) {
        newErrors.dateOfBirth = 'Năm sinh không hợp lệ (Phải từ năm 1900 trở lại đây)';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ FIX LỖI 4: Kiểm tra độ dài địa chỉ cụ thể chặt chẽ hơn
  const validateAddress = () => {
    const newErrors = {};
    
    if (!addressData.cityId) {
      newErrors.city = 'Vui lòng chọn tỉnh/thành phố';
    }
    
    if (!addressData.districtId) {
      newErrors.district = 'Vui lòng chọn quận/huyện';
    }
    
    if (!addressData.wardCode) {
      newErrors.ward = 'Vui lòng chọn phường/xã';
    }
    
    if (!addressData.street || addressData.street.trim().length === 0) {
      newErrors.street = 'Vui lòng nhập địa chỉ cụ thể';
    } else if (addressData.street.trim().length > 200) {
      newErrors.street = 'Địa chỉ cụ thể không được vượt quá 200 ký tự';
    }
    
    if (addressData.notes && addressData.notes.length > 500) {
      newErrors.notes = 'Ghi chú không được vượt quá 500 ký tự';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors = {};
    if (!passwordData.currentPassword) newErrors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Mật khẩu phải có ít nhất 6 ký tự';
    } else if (passwordData.newPassword.length > 50) {
      newErrors.newPassword = 'Mật khẩu không được vượt quá 50 ký tự';
    }
    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdatePersonal = async () => {
    // Clear previous errors
    setErrors({});
    
    // Validate
    if (!validatePersonalInfo()) {
      Swal.fire({
        icon: 'error',
        title: 'Thông tin không hợp lệ',
        text: 'Vui lòng kiểm tra lại các thông tin đã nhập',
        confirmButtonColor: 'rgb(var(--primary))'
      });
      return;
    }
    
    try {
      setLoading(true);
      const formattedFullName = personalData.fullName.trim().replace(/\s+/g, ' ');
      const formattedPhone = personalData.phone.trim();
      const formattedUsername = personalData.username.trim();

      const cleanData = {
        ...personalData,
        fullName: formattedFullName,
        phone: formattedPhone,
        username: formattedUsername
      };

      const response = await userService.updateProfile(cleanData);
      
      if (response.success) {
        setPersonalData(cleanData);
        dispatch(setUser(response.data.user));
        
        setIsEditingPersonal(false);
        
        // Success alert
        Swal.fire({
          icon: 'success',
          title: 'Thành công!',
          text: 'Cập nhật thông tin cá nhân thành công',
          confirmButtonColor: 'rgb(var(--natural-green))',
          timer: 2000,
          timerProgressBar: true
        });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thông tin';
      Swal.fire({
        icon: 'error',
        title: 'Cập nhật thất bại',
        text: errorMessage,
        confirmButtonColor: 'rgb(var(--destructive))'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAddress = async () => {
    setErrors({});
    if (!validateAddress()) {
      Swal.fire({
        icon: 'error',
        title: 'Thông tin không hợp lệ',
        text: 'Vui lòng kiểm tra lại các thông tin địa chỉ',
        confirmButtonColor: 'rgb(var(--primary))'
      });
      return;
    }
    
    try {
      setLoading(true);
      const response = await userService.updateProfile({ address: addressData });
      if (response.success) {
        dispatch(setUser(response.data.user));
        setIsEditingAddress(false);
        Swal.fire({
          icon: 'success',
          title: 'Thành công!',
          text: 'Cập nhật địa chỉ thành công',
          confirmButtonColor: 'rgb(var(--natural-green))',
          timer: 2000,
          timerProgressBar: true
        });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật địa chỉ';
      Swal.fire({ icon: 'error', title: 'Cập nhật thất bại', text: errorMessage, confirmButtonColor: 'rgb(var(--destructive))' });
    } finally {
      setLoading(false);
    }
  };

  const getFullAddress = () => {
    if (!user?.address?.street) return 'Chưa cập nhật địa chỉ';
    const { street, ward, district, city } = user.address;
    return `${street}, ${ward}, ${district}, ${city}`;
  };

  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState({ current: false, new: false, confirm: false });

  const togglePasswordVisibility = (field) => {
    setPasswordVisible((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const [passwordStrength, setPasswordStrength] = useState({ label: '', color: 'border-gray-300', textColor: 'text-gray-400', bar: '', width: '0%' });

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
      setPasswordStrength({ label: 'Yếu', color: 'border-red-300', textColor: 'text-red-500', bar: 'bg-red-400', width: '25%' });
    } else if (strength === 3) {
      setPasswordStrength({ label: 'Trung bình', color: 'border-yellow-300', textColor: 'text-yellow-500', bar: 'bg-yellow-400', width: '50%' });
    } else if (strength >= 4) {
      setPasswordStrength({ label: 'Mạnh', color: 'border-green-300', textColor: 'text-green-500', bar: 'bg-green-400', width: '100%' });
    } else {
      setPasswordStrength({ label: '', color: 'border-gray-300', textColor: 'text-gray-400', bar: '', width: '0%' });
    }
  };

  const handleChangePassword = async () => {
    setErrors({});
    if (!validatePassword()) {
      Swal.fire({ icon: 'error', title: 'Thông tin không hợp lệ', text: 'Vui lòng kiểm tra lại thông tin mật khẩu', confirmButtonColor: 'rgb(var(--primary))' });
      return;
    }

    try {
      setLoading(true);
      const response = await userService.changePassword(passwordData);
      if (response.success) {
        await Swal.fire({
          icon: 'success',
          title: 'Thành công!',
          text: 'Đổi mật khẩu thành công',
          confirmButtonColor: 'rgb(var(--natural-green))',
          timer: 2000,
          timerProgressBar: true
        });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setIsChangingPassword(false);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi đổi mật khẩu';
      Swal.fire({ icon: 'error', title: 'Đổi mật khẩu thất bại', text: errorMessage, confirmButtonColor: 'rgb(var(--destructive))' });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
      Swal.fire({ icon: 'error', title: 'File không hợp lệ', text: 'Vui lòng chọn file ảnh (JPEG, PNG)', confirmButtonColor: 'rgb(var(--destructive))' });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      Swal.fire({ icon: 'error', title: 'File quá lớn', text: 'Kích thước ảnh không được vượt quá 2MB', confirmButtonColor: 'rgb(var(--destructive))' });
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      setIsUploading(true);
      const response = await userService.updateAvatar(formData);
      if (response.success && response.data?.user) {
        dispatch(setUser(response.data.user));
        await Swal.fire({
          icon: 'success',
          title: 'Thành công!',
          text: 'Cập nhật ảnh đại diện thành công',
          confirmButtonColor: 'rgb(var(--natural-green))',
          timer: 2000,
          timerProgressBar: true
        });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi tải lên ảnh đại diện';
      await Swal.fire({ icon: 'error', title: 'Tải lên thất bại', text: errorMessage, confirmButtonColor: 'rgb(var(--destructive))' });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAvatarClick = () => {
    if (isUploading) return;
    fileInputRef.current?.click();
  };

  return (
    <div className="profile-page min-h-screen bg-gray-50 py-8">
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
                  <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
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
              <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" disabled={isUploading} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 break-all">{user?.username}</h1>
              <p className="text-gray-600 flex items-center gap-2 break-all">
                <Mail className="w-4 h-4 shrink-0" />
                {user?.email}
              </p>
              <button onClick={handleAvatarClick} disabled={isUploading} className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50">
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
                <button onClick={() => setIsEditingPersonal(false)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
                <button onClick={handleUpdatePersonal} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400">
                  <Save className="w-4 h-4" />
                  {loading ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            ) : (
              <button onClick={() => setIsEditingPersonal(true)} className="flex items-center gap-2 text-blue-600 hover:text-blue-800">
                <Edit2 className="w-4 h-4" />
                Chỉnh sửa
              </button>
            )}
          </div>

          {!isEditingPersonal ? (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <span className="text-gray-600 w-32 shrink-0">Tên người dùng:</span>
                <span className="text-gray-900 break-all">{user?.username || 'Chưa cập nhật'}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <span className="text-gray-600 w-32 shrink-0">Họ tên:</span>
                <span className="text-gray-900 break-all">{user?.fullName || 'Chưa cập nhật'}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <span className="text-gray-600 w-32 shrink-0">Số điện thoại:</span>
                <span className="text-gray-900 break-all">{user?.phone || 'Chưa cập nhật'}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <span className="text-gray-600 w-32 shrink-0">Ngày sinh:</span>
                <span className="text-gray-900">{formatDateForDisplay(user?.dateOfBirth)}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <span className="text-gray-600 w-32 shrink-0">Giới tính:</span>
                <span className="text-gray-900">{user?.gender === 'male' ? 'Nam' : user?.gender === 'female' ? 'Nữ' : 'Chưa cập nhật'}</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên người dùng</label>
                <input type="text" value={personalData.username} onChange={(e) => setPersonalData({...personalData, username: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none" placeholder="Tên người dùng" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên <span className="text-red-500">*</span></label>
                <input type="text" value={personalData.fullName} onChange={(e) => { setPersonalData({...personalData, fullName: e.target.value}); if (errors.fullName) setErrors({...errors, fullName: null}); }} className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${errors.fullName ? 'border-red-500 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'}`} placeholder="Nguyễn Văn A" maxLength={100} />
                {errors.fullName && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><span>⚠️</span> {errors.fullName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại <span className="text-red-500">*</span></label>
                <input type="tel" value={personalData.phone} onChange={(e) => { setPersonalData({...personalData, phone: e.target.value}); if (errors.phone) setErrors({...errors, phone: null}); }} className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${errors.phone ? 'border-red-500 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'}`} placeholder="0912345678" />
                {errors.phone && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><span>⚠️</span> {errors.phone}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
                <input type="date" value={personalData.dateOfBirth} onChange={(e) => { setPersonalData({...personalData, dateOfBirth: e.target.value}); if (errors.dateOfBirth) setErrors({...errors, dateOfBirth: null}); }} className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${errors.dateOfBirth ? 'border-red-500 focus:ring-2 focus:ring-red-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'}`} />
                {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><span>⚠️</span> {errors.dateOfBirth}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
                <div className="flex gap-4">
                  <label className="flex items-center"><input type="radio" value="male" checked={personalData.gender === 'male'} onChange={(e) => setPersonalData({...personalData, gender: e.target.value})} className="mr-2" />Nam</label>
                  <label className="flex items-center"><input type="radio" value="female" checked={personalData.gender === 'female'} onChange={(e) => setPersonalData({...personalData, gender: e.target.value})} className="mr-2" />Nữ</label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Address */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2"><MapPin className="w-6 h-6" />Địa chỉ</h2>
            {!isEditingAddress ? (
              <button onClick={() => setIsEditingAddress(true)} className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 className="w-4 h-4" />{user?.address?.street ? 'Chỉnh sửa' : 'Thêm địa chỉ'}</button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setIsEditingAddress(false)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
                <button onClick={handleUpdateAddress} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"><Save className="w-4 h-4" />{loading ? 'Đang lưu...' : 'Lưu'}</button>
              </div>
            )}
          </div>

          {!isEditingAddress ? (
            // ✅ FIX LỖI 4: Thêm class `break-words whitespace-pre-wrap` để text xuống dòng, tránh tràn layout
            <div className="p-4 bg-gray-50 rounded-lg break-words whitespace-pre-wrap">
              <p className="text-gray-900">{getFullAddress()}</p>
              {user?.address?.notes && <p className="text-gray-600 text-sm mt-2 break-words">Ghi chú: {user.address.notes}</p>}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tỉnh/Thành phố *</label>
                <select value={addressData.cityId} onChange={(e) => { handleProvinceChange(e); if (errors.city) setErrors({...errors, city: null}); }} disabled={loadingLocation} className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${errors.city ? 'border-red-500' : 'border-gray-300'}`} >
                  <option value="">-- Chọn tỉnh/thành phố --</option>
                  {provinces.map(province => <option key={province.id} value={province.id}>{province.name}</option>)}
                </select>
                {errors.city && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><span>⚠️</span> {errors.city}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quận/Huyện *</label>
                <select value={addressData.districtId} onChange={(e) => { handleDistrictChange(e); if (errors.district) setErrors({...errors, district: null}); }} disabled={!addressData.cityId || loadingLocation} className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${errors.district ? 'border-red-500' : 'border-gray-300'}`} >
                  <option value="">-- Chọn quận/huyện --</option>
                  {districts.map(district => <option key={district.id} value={district.id}>{district.name}</option>)}
                </select>
                {errors.district && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><span>⚠️</span> {errors.district}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phường/Xã *</label>
                <select value={addressData.wardCode} onChange={(e) => { handleWardChange(e); if (errors.ward) setErrors({...errors, ward: null}); }} disabled={!addressData.districtId || loadingLocation} className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${errors.ward ? 'border-red-500' : 'border-gray-300'}`} >
                  <option value="">-- Chọn phường/xã --</option>
                  {wards.map(ward => <option key={ward.id} value={ward.id}>{ward.name}</option>)}
                </select>
                {errors.ward && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><span>⚠️</span> {errors.ward}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ cụ thể (số nhà, tên đường) *</label>
                <input type="text" value={addressData.street} onChange={(e) => { setAddressData({...addressData, street: e.target.value}); if (errors.street) setErrors({...errors, street: null}); }} className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${errors.street ? 'border-red-500' : 'border-gray-300'}`} placeholder="Số 123, Đường Nguyễn Văn Linh" maxLength={200} />
                {errors.street && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><span>⚠️</span> {errors.street}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú (tùy chọn)</label>
                <textarea value={addressData.notes} onChange={(e) => { setAddressData({...addressData, notes: e.target.value}); if (errors.notes) setErrors({...errors, notes: null}); }} rows={3} className={`w-full px-3 py-2 border rounded-lg focus:outline-none resize-none ${errors.notes ? 'border-red-500' : 'border-gray-300'}`} placeholder="VD: Gần chợ, cạnh trường học..." maxLength={500} />
                {errors.notes && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><span>⚠️</span> {errors.notes}</p>}
                {addressData.notes && <p className="text-xs text-gray-500 mt-1">{addressData.notes.length}/500 ký tự</p>}
              </div>
            </div>
          )}
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Đổi mật khẩu</h2>
            {!isChangingPassword ? (
              <button onClick={() => setIsChangingPassword(true)} className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 className="w-4 h-4" />Đổi mật khẩu</button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setIsChangingPassword(false)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
                <button onClick={handleChangePassword} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"><Save className="w-4 h-4" />{loading ? 'Đang lưu...' : 'Lưu'}</button>
              </div>
            )}
          </div>

          {isChangingPassword ? (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu hiện tại *</label>
                <div className="relative">
                  <input type={passwordVisible.current ? "text" : "password"} value={passwordData.currentPassword} onChange={(e) => { setPasswordData({...passwordData, currentPassword: e.target.value}); if (errors.currentPassword) setErrors({...errors, currentPassword: null}); }} className={`w-full px-3 py-2 pr-10 border rounded-lg ${errors.currentPassword ? 'border-red-500' : 'border-gray-300'}`} placeholder="Nhập mật khẩu hiện tại" />
                  <button type="button" onClick={() => togglePasswordVisibility('current')} className="absolute inset-y-0 right-3 flex items-center text-gray-500">{passwordVisible.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                </div>
                {errors.currentPassword && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><span>⚠️</span> {errors.currentPassword}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới *</label>
                <div className="relative">
                  <input type={passwordVisible.new ? "text" : "password"} value={passwordData.newPassword} onChange={(e) => { handlePasswordChange(e.target.value); if (errors.newPassword) setErrors({...errors, newPassword: null}); }} className={`w-full px-3 py-2 pr-10 border rounded-lg ${errors.newPassword ? 'border-red-500' : passwordStrength.color}`} placeholder="Nhập mật khẩu mới" maxLength={50} />
                  <button type="button" onClick={() => togglePasswordVisibility('new')} className="absolute inset-y-0 right-3 flex items-center text-gray-500">{passwordVisible.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                </div>
                {errors.newPassword ? <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><span>⚠️</span> {errors.newPassword}</p> : <p className="text-xs text-gray-500 mt-1">Mật khẩu phải có ít nhất <span className="font-semibold">8 ký tự</span>, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.</p>}
                {passwordData.newPassword && (
                  <>
                    <div className="mt-2 h-2 w-full bg-gray-200 rounded-full"><div className={`h-2 rounded-full transition-all ${passwordStrength.bar}`} style={{ width: passwordStrength.width }}></div></div>
                    <p className={`text-xs mt-1 ${passwordStrength.textColor}`}>Độ mạnh: {passwordStrength.label}</p>
                  </>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu mới *</label>
                <div className="relative">
                  <input type={passwordVisible.confirm ? "text" : "password"} value={passwordData.confirmPassword} onChange={(e) => { setPasswordData({...passwordData, confirmPassword: e.target.value}); if (errors.confirmPassword) setErrors({...errors, confirmPassword: null}); }} className={`w-full px-3 py-2 pr-10 border rounded-lg ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`} placeholder="Nhập lại mật khẩu mới" />
                  <button type="button" onClick={() => togglePasswordVisibility('confirm')} className="absolute inset-y-0 right-3 flex items-center text-gray-500">{passwordVisible.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><span>⚠️</span> {errors.confirmPassword}</p>}
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
