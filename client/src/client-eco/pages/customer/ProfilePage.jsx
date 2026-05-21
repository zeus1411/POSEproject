import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { User, MapPin, Phone, Mail, Edit2, Save, X, Eye, EyeOff, Camera, Loader2 } from 'lucide-react';
import userService from '../../services/userService';
import addressService from '../../services/addressService';
import { setUser } from '../../redux/slices/authSlice';
import Swal from 'sweetalert2';
import { useTheme } from '../../context/ThemeContext';

const ProfilePage = () => {
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const { isDark } = useTheme();
  
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

  const validatePersonalInfo = () => {
    const newErrors = {};
    
    if (!personalData.fullName || personalData.fullName.trim().length === 0) {
      newErrors.fullName = 'Họ tên không được để trống';
    } else if (personalData.fullName.length > 100) {
      newErrors.fullName = 'Họ tên không được vượt quá 100 ký tự';
    } else {
      const nameRegex = /^[\p{L}\s]+$/u;
      if (!nameRegex.test(personalData.fullName.trim())) {
        newErrors.fullName = 'Họ tên chỉ được chứa chữ cái và khoảng trắng';
      }
    }
    
    if (!personalData.phone || personalData.phone.trim().length === 0) {
      newErrors.phone = 'Số điện thoại không được để trống';
    } else {
      const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
      if (!phoneRegex.test(personalData.phone.trim())) {
        newErrors.phone = 'Số điện thoại không hợp lệ (Phải là 10 số, ví dụ: 0337826369)';
      }
    }

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
    setErrors({});
    
    if (!validatePersonalInfo()) {
      Swal.fire({
        icon: 'error',
        title: 'Thông tin không hợp lệ',
        text: 'Vui lòng kiểm tra lại các thông tin đã nhập',
        confirmButtonColor: '#f43f5e', // 🔥 Đổi sang tông màu Rose mờ
        customClass: {
          popup: 'aquatic-swal-popup',
          title: 'aquatic-swal-title',
          htmlContainer: 'aquatic-swal-html',
          confirmButton: 'aquatic-swal-confirm-btn'
        }
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
        
        Swal.fire({
          icon: 'success',
          title: 'Thành công!',
          text: 'Cập nhật thông tin cá nhân thành công',
          confirmButtonColor: '#10B981', // Màu Emerald phát sáng
          timer: 2000,
          timerProgressBar: true,
          customClass: {
            popup: 'aquatic-swal-popup',
            title: 'aquatic-swal-title',
            htmlContainer: 'aquatic-swal-html',
            confirmButton: 'aquatic-swal-confirm-btn',
            timerProgressBar: 'aquatic-swal-timer-progress'
          }
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
        confirmButtonColor: '#f43f5e',
        customClass: {
          popup: 'aquatic-swal-popup',
          title: 'aquatic-swal-title',
          htmlContainer: 'aquatic-swal-html',
          confirmButton: 'aquatic-swal-confirm-btn'
        }
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
          timerProgressBar: true,
          customClass: {
            popup: 'aquatic-swal-popup',
            title: 'aquatic-swal-title',
            htmlContainer: 'aquatic-swal-html',
            confirmButton: 'aquatic-swal-confirm-btn',
            timerProgressBar: 'aquatic-swal-timer-progress'
          }
        });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật địa chỉ';
      
      Swal.fire({
        icon: 'error',
        title: 'Cập nhật thất bại',
        text: errorMessage,
        confirmButtonColor: '#f43f5e',
        customClass: {
          popup: 'aquatic-swal-popup',
          title: 'aquatic-swal-title',
          htmlContainer: 'aquatic-swal-html',
          confirmButton: 'aquatic-swal-confirm-btn'
        }
      });
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

  const [passwordStrength, setPasswordStrength] = useState({ label: '', color: 'border-water/30', textColor: 'text-muted-foreground', bar: '', width: '0%' });

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
      setPasswordStrength({ label: 'Yếu', color: 'border-red-300 dark:border-red-500/50', textColor: 'text-red-500', bar: 'bg-red-400 dark:bg-red-500', width: '25%' });
    } else if (strength === 3) {
      setPasswordStrength({ label: 'Trung bình', color: 'border-yellow-300 dark:border-yellow-500/50', textColor: 'text-yellow-500', bar: 'bg-yellow-400 dark:bg-yellow-500', width: '50%' });
    } else if (strength >= 4) {
      setPasswordStrength({ label: 'Mạnh', color: 'border-green-300 dark:border-green-500/50', textColor: 'text-green-500', bar: 'bg-green-400 dark:bg-green-500', width: '100%' });
    } else {
      setPasswordStrength({ label: '', color: 'border-water/30 dark:border-white/10', textColor: 'text-muted-foreground', bar: '', width: '0%' });
    }
  };

  const handleChangePassword = async () => {
    setErrors({});
    if (!validatePassword()) {
      Swal.fire({
        icon: 'error',
        title: 'Thông tin không hợp lệ',
        text: 'Vui lòng kiểm tra lại thông tin mật khẩu',
        confirmButtonColor: '#f43f5e',
        customClass: {
          popup: 'aquatic-swal-popup',
          title: 'aquatic-swal-title',
          htmlContainer: 'aquatic-swal-html',
          confirmButton: 'aquatic-swal-confirm-btn'
        }
      });
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
          timerProgressBar: true,
          customClass: {
            popup: 'aquatic-swal-popup',
            title: 'aquatic-swal-title',
            htmlContainer: 'aquatic-swal-html',
            confirmButton: 'aquatic-swal-confirm-btn',
            timerProgressBar: 'aquatic-swal-timer-progress'
          }
        });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setIsChangingPassword(false);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi đổi mật khẩu';
      
      Swal.fire({
        icon: 'error',
        title: 'Đổi mật khẩu thất bại',
        text: errorMessage,
        confirmButtonColor: '#f43f5e',
        customClass: {
          popup: 'aquatic-swal-popup',
          title: 'aquatic-swal-title',
          htmlContainer: 'aquatic-swal-html',
          confirmButton: 'aquatic-swal-confirm-btn'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
      Swal.fire({
        icon: 'error',
        title: 'File không hợp lệ',
        text: 'Vui lòng chọn file ảnh (JPEG, PNG)',
        confirmButtonColor: '#f43f5e',
        customClass: {
          popup: 'aquatic-swal-popup',
          title: 'aquatic-swal-title',
          htmlContainer: 'aquatic-swal-html',
          confirmButton: 'aquatic-swal-confirm-btn'
        }
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      Swal.fire({
        icon: 'error',
        title: 'File quá lớn',
        text: 'Kích thước ảnh không được vượt quá 2MB',
        confirmButtonColor: '#f43f5e',
        customClass: {
          popup: 'aquatic-swal-popup',
          title: 'aquatic-swal-title',
          htmlContainer: 'aquatic-swal-html',
          confirmButton: 'aquatic-swal-confirm-btn'
        }
      });
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
          timerProgressBar: true,
          allowOutsideClick: false,
          allowEscapeKey: false,
          customClass: {
            popup: 'aquatic-swal-popup',
            title: 'aquatic-swal-title',
            htmlContainer: 'aquatic-swal-html',
            confirmButton: 'aquatic-swal-confirm-btn',
            timerProgressBar: 'aquatic-swal-timer-progress'
          },
          willClose: () => {
            console.log('✅ Swal closed, staying on profile page');
          }
        });
      }
    } catch (error) {
      console.error('❌ Error uploading avatar:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi tải lên ảnh đại diện';
      
      await Swal.fire({
        icon: 'error',
        title: 'Tải lên thất bại',
        text: errorMessage,
        confirmButtonColor: '#f43f5e',
        customClass: {
          popup: 'aquatic-swal-popup',
          title: 'aquatic-swal-title',
          htmlContainer: 'aquatic-swal-html',
          confirmButton: 'aquatic-swal-confirm-btn'
        }
      });
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
    <div className={`profile-page relative min-h-screen transition-colors duration-300 ${isDark ? 'bg-[#051C1C] text-white' : 'bg-background text-foreground'} py-8`}>
      {/* 1. Nền Gradient chính - Cố định (Fixed) */}
      <div className={`fixed inset-0 z-0 transition-colors duration-300 ${
        isDark 
          ? 'bg-gradient-to-b from-[#051C1C] via-[#0a2828] to-[#051C1C]' 
          : 'bg-gradient-to-b from-[#FFFDF0] via-[#E8F6F6] to-[#FFFDF0]'
      }`}></div>

      {/* 2. Hệ thống vân sóng vô tận lặp lại toàn trang */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none transition-opacity duration-300"
        style={{
          backgroundImage: isDark
            ? `url("data:image/svg+xml,%3Csvg width='400' height='200' viewBox='0 0 400 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 100 Q 100 50 200 100 T 400 100' fill='none' stroke='%2310b981' stroke-width='1.5' stroke-opacity='0.5'/%3E%3Cpath d='M0 140 Q 100 90 200 140 T 400 140' fill='none' stroke='%2306b6d4' stroke-width='1' stroke-opacity='0.3'/%3E%3C/svg%3E")`
            : `url("data:image/svg+xml,%3Csvg width='400' height='200' viewBox='0 0 400 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 100 Q 100 50 200 100 T 400 100' fill='none' stroke='%234682A9' stroke-width='1.5' stroke-opacity='0.25'/%3E%3Cpath d='M0 140 Q 100 90 200 140 T 400 140' fill='none' stroke='%23749BC2' stroke-width='1' stroke-opacity='0.2'/%3E%3C/svg%3E")`,
          backgroundSize: '800px 400px',
          opacity: isDark ? 0.4 : 0.25,
        }}
      ></div>

      {/* 3. Các đốm sáng Glow cố định tạo chiều sâu */}
      <div className={`fixed top-[20%] left-[-10%] w-[500px] h-[500px] rounded-full z-0 pointer-events-none blur-[120px] transition-colors duration-300 ${
        isDark ? 'bg-emerald-900/20' : 'bg-emerald-200/35'
      }`}></div>
      <div className={`fixed bottom-[10%] right-[-10%] w-[400px] h-[400px] rounded-full z-0 pointer-events-none blur-[100px] transition-colors duration-300 ${
        isDark ? 'bg-cyan-900/20' : 'bg-cyan-200/35'
      }`}></div>

      {/* Nội dung chính */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 space-y-6">
        
        {/* Header */}
        <div className="glass-panel shadow-xl rounded-3xl p-6 border border-water/45 dark:border-white/10">
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <div className="relative group">
              <div 
                className="w-24 h-24 rounded-full bg-aqua/10 dark:bg-white/10 border-2 border-water/40 dark:border-white/20 flex items-center justify-center overflow-hidden cursor-pointer shadow-inner transition-all duration-300"
                onClick={handleAvatarClick}
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-muted-foreground" />
                )}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center transition-all duration-300">
                  {isUploading ? (
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  ) : (
                    <User className="w-12 h-12 text-gray-400" />
                  )}
                  {/* Lớp phủ hover mượt mà */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300 backdrop-blur-[2px]">
                    {isUploading ? (
                      <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
                    ) : (
                      <Camera className="w-6 h-6 text-white" />
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

              {/* Thông tin nhanh bên cạnh Avatar */}
              <div className="text-center sm:text-left flex-1">
                <h1 className="text-2xl font-bold tracking-tight text-white mb-1.5">{user?.username}</h1>
                <p className="text-gray-400 flex items-center justify-center sm:justify-start gap-2 text-sm">
                  <Mail className="w-4 h-4 text-cyan-400" />
                  {user?.email}
                </p>
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  disabled={isUploading}
                  className="mt-3 text-xs font-bold uppercase tracking-wider text-emerald-400 hover:text-emerald-300 transition-colors disabled:opacity-50"
                >
                  {isUploading ? 'Hệ thống đang tải lên...' : '✨ Đổi ảnh đại diện'}
                </button>
              </div>
            </div>
          </div>

          {/* BLOCK 2: PERSONAL INFORMATION (THÔNG TIN CÁ NHÂN) */}
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 shadow-xl">
            <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
              <h2 className="text-xl font-bold tracking-tight text-white/90">👤 Thông tin cá nhân</h2>
              {isEditingPersonal ? (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingPersonal(false)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleUpdatePersonal}
                    disabled={loading}
                    className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl transition-colors shadow-md shadow-emerald-950/30 disabled:bg-gray-700 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? 'Đang lưu...' : 'Lưu thông tin'}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditingPersonal(true)}
                  className="flex items-center gap-2 text-sm font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  Chỉnh sửa
                </button>
              )}
            </div>

            {/* VIEW MODE */}
            {!isEditingPersonal ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-black/10 p-5 border border-white/5 rounded-2xl shadow-inner font-medium">
                <div className="flex items-center gap-3 py-1">
                  <span className="text-gray-400 w-32 shrink-0">Tên người dùng:</span>
                  <span className="text-white">{user?.username || 'Chưa cập nhật'}</span>
                </div>
                <div className="flex items-center gap-3 py-1">
                  <span className="text-gray-400 w-32 shrink-0">Họ tên:</span>
                  <span className="text-white">{user?.fullName || 'Chưa cập nhật'}</span>
                </div>
                <div className="flex items-center gap-3 py-1">
                  <span className="text-gray-400 w-32 shrink-0">Số điện thoại:</span>
                  <span className="text-white font-mono">{user?.phone || 'Chưa cập nhật'}</span>
                </div>
                <div className="flex items-center gap-3 py-1">
                  <span className="text-gray-400 w-32 shrink-0">Ngày sinh:</span>
                  <span className="text-white font-mono">{formatDateForDisplay(user?.dateOfBirth)}</span>
                </div>
                <div className="flex items-center gap-3 py-1 col-span-1 md:col-span-2">
                  <span className="text-gray-400 w-32 shrink-0">Giới tính:</span>
                  <span className="text-white">
                    {user?.gender === 'male' ? 'Nam' : user?.gender === 'female' ? 'Nữ' : 'Chưa cập nhật'}
                  </span>
                </div>
              </div>
            ) : (
              // EDIT MODE
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-300 pl-1">Tên người dùng</label>
                  <input
                    type="text"
                    value={personalData.username}
                    onChange={(e) => setPersonalData({...personalData, username: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all shadow-inner text-sm"
                    placeholder="Nhập tên người dùng..."
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-300 pl-1">
                    Họ tên <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={personalData.fullName}
                    onChange={(e) => {
                      setPersonalData({...personalData, fullName: e.target.value});
                      if (errors.fullName) setErrors({...errors, fullName: null});
                    }}
                    className={`w-full bg-white/5 border rounded-2xl px-5 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 transition-all shadow-inner text-sm ${
                      errors.fullName ? 'border-rose-500 focus:ring-rose-500/50' : 'border-white/10 focus:ring-emerald-500/50'
                    }`}
                    placeholder="Nguyễn Văn A"
                    maxLength={100}
                  />
                  {errors.fullName && (
                    <p className="text-rose-400 text-xs mt-1 flex items-center gap-1 pl-1">
                      <span>⚠️</span> {errors.fullName}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-300 pl-1">
                      Số điện thoại <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="tel"
                      value={personalData.phone}
                      onChange={(e) => {
                        setPersonalData({...personalData, phone: e.target.value});
                        if (errors.phone) setErrors({...errors, phone: null});
                      }}
                      className={`w-full bg-white/5 border rounded-2xl px-5 py-3 text-white font-mono placeholder:text-gray-500 focus:outline-none focus:ring-2 transition-all shadow-inner text-sm ${
                        errors.phone ? 'border-rose-500 focus:ring-rose-500/50' : 'border-white/10 focus:ring-emerald-500/50'
                      }`}
                      placeholder="0912345678"
                    />
                    {errors.phone ? (
                      <p className="text-rose-400 text-xs mt-1 flex items-center gap-1 pl-1">
                        <span>⚠️</span> {errors.phone}
                      </p>
                    ) : personalData.phone && (
                      <p className="text-[11px] text-gray-500 pl-1 mt-0.5 font-mono">Định dạng chuẩn: 0912345678</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-300 pl-1">Ngày sinh</label>
                    <input
                      type="date"
                      value={personalData.dateOfBirth}
                      onChange={(e) => setPersonalData({...personalData, dateOfBirth: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all shadow-inner text-sm scheme-dark"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 pt-1">
                  <label className="text-xs font-semibold text-gray-300 pl-1">Giới tính</label>
                  <div className="flex gap-6 pl-1 mt-1">
                    <label className="flex items-center text-sm font-medium gap-2 cursor-pointer text-gray-300 hover:text-white transition-colors">
                      <input
                        type="radio"
                        value="male"
                        checked={personalData.gender === 'male'}
                        onChange={(e) => setPersonalData({...personalData, gender: e.target.value})}
                        className="accent-emerald-500 w-4 h-4"
                      />
                      Nam
                    </label>
                    <label className="flex items-center text-sm font-medium gap-2 cursor-pointer text-gray-300 hover:text-white transition-colors">
                      <input
                        type="radio"
                        value="female"
                        checked={personalData.gender === 'female'}
                        onChange={(e) => setPersonalData({...personalData, gender: e.target.value})}
                        className="accent-emerald-500 w-4 h-4"
                      />
                      Nữ
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 shadow-xl">
            <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
              <h2 className="text-xl font-bold tracking-tight text-white/90 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-cyan-400" />
                Sổ địa chỉ nhận hàng
              </h2>
              {!isEditingAddress ? (
                <button
                  type="button"
                  onClick={() => setIsEditingAddress(true)}
                  className="flex items-center gap-2 text-sm font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  {user?.address?.street ? 'Chỉnh sửa' : 'Thêm địa chỉ'}
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingAddress(false)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleUpdateAddress}
                    disabled={loading}
                    className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl transition-colors shadow-md disabled:bg-gray-700 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? 'Đang lưu...' : 'Lưu địa chỉ'}
                  </button>
                </div>
              )}
            </div>

            {/* VIEW ADDRESS MODE */}
            {!isEditingAddress ? (
              <div className="p-5 bg-black/10 border border-white/5 rounded-2xl shadow-inner text-sm leading-relaxed">
                <p className="text-white font-medium">{getFullAddress() || 'Chưa thiết lập địa chỉ giao hàng mặc định.'}</p>
                {user?.address?.notes && (
                  <p className="text-gray-400 text-xs mt-2.5 bg-white/5 px-3 py-1.5 border border-white/5 rounded-xl font-mono">
                    Ghi chú giao kho: {user.address.notes}
                  </p>
                )}
              </div>
            ) : (
              // EDIT ADDRESS MODE (DROP-DOWNS ĐƯỢC NHUỘM MÀU ĐÁY HỒ TỐI SANG TRỌNG)
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-300 pl-1">Tỉnh/Thành phố *</label>
                    <select
                      value={addressData.cityId}
                      onChange={(e) => {
                        handleProvinceChange(e);
                        if (errors.city) setErrors({...errors, city: null});
                      }}
                      disabled={loadingLocation}
                      className={`w-full bg-white/5 border rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 cursor-pointer appearance-none ${
                        errors.city ? 'border-rose-500 focus:ring-rose-500/50' : 'border-white/10 focus:ring-emerald-500/50'
                      }`}
                      style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'white\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1em' }}
                    >
                      <option value="" className="bg-[#0a2828] text-gray-400">-- Chọn Tỉnh/TP --</option>
                      {provinces.map(province => (
                        <option key={province.id} value={province.id} className="bg-[#0a2828] text-white">
                          {province.name}
                        </option>
                      ))}
                    </select>
                    {errors.city && (
                      <p className="text-rose-400 text-xs mt-1 flex items-center gap-1 pl-1">
                        <span>⚠️</span> {errors.city}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-300 pl-1">Quận/Huyện *</label>
                    <select
                      value={addressData.districtId}
                      onChange={(e) => {
                        handleDistrictChange(e);
                        if (errors.district) setErrors({...errors, district: null});
                      }}
                      disabled={!addressData.cityId || loadingLocation}
                      className={`w-full bg-white/5 border rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 cursor-pointer appearance-none ${
                        errors.district ? 'border-rose-500 focus:ring-rose-500/50' : 'border-white/10 focus:ring-emerald-500/50'
                      }`}
                      style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'white\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1em' }}
                    >
                      <option value="" className="bg-[#0a2828] text-gray-400">-- Chọn Quận/Huyện --</option>
                      {districts.map(district => (
                        <option key={district.id} value={district.id} className="bg-[#0a2828] text-white">
                          {district.name}
                        </option>
                      ))}
                    </select>
                    {errors.district && (
                      <p className="text-rose-400 text-xs mt-1 flex items-center gap-1 pl-1">
                        <span>⚠️</span> {errors.district}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-300 pl-1">Phường/Xã *</label>
                    <select
                      value={addressData.wardCode}
                      onChange={(e) => {
                        handleWardChange(e);
                        if (errors.ward) setErrors({...errors, ward: null});
                      }}
                      disabled={!addressData.districtId || loadingLocation}
                      className={`w-full bg-white/5 border rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 cursor-pointer appearance-none ${
                        errors.ward ? 'border-rose-500 focus:ring-rose-500/50' : 'border-white/10 focus:ring-emerald-500/50'
                      }`}
                      style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'white\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1em' }}
                    >
                      <option value="" className="bg-[#0a2828] text-gray-400">-- Chọn Phường/Xã --</option>
                      {wards.map(ward => (
                        <option key={ward.id} value={ward.id} className="bg-[#0a2828] text-white">
                          {ward.name}
                        </option>
                      ))}
                    </select>
                    {errors.ward && (
                      <p className="text-rose-400 text-xs mt-1 flex items-center gap-1 pl-1">
                        <span>⚠️</span> {errors.ward}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-300 pl-1">Địa chỉ cụ thể (số nhà, tên đường) *</label>
                  <input
                    type="text"
                    value={addressData.street}
                    onChange={(e) => {
                      setAddressData({...addressData, street: e.target.value});
                      if (errors.street) setErrors({...errors, street: null});
                    }}
                    className={`w-full bg-white/5 border rounded-2xl px-5 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 transition-all shadow-inner text-sm ${
                      errors.street ? 'border-rose-500 focus:ring-rose-500/50' : 'border-white/10 focus:ring-emerald-500/50'
                    }`}
                    placeholder="Số 123, Đường Nguyễn Văn Linh..."
                    maxLength={200}
                  />
                  {errors.street && (
                    <p className="text-rose-400 text-xs mt-1 flex items-center gap-1 pl-1">
                      <span>⚠️</span> {errors.street}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-300 pl-1">Ghi chú giao kho (tùy chọn)</label>
                  <textarea
                    value={addressData.notes}
                    onChange={(e) => {
                      setAddressData({...addressData, notes: e.target.value});
                      if (errors.notes) setErrors({...errors, notes: null});
                    }}
                    rows={3}
                    className={`w-full bg-white/5 border rounded-2xl px-5 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 resize-none text-sm leading-relaxed ${
                      errors.notes ? 'border-rose-500 focus:ring-rose-500/50' : 'border-white/10 focus:ring-emerald-500/50'
                    }`}
                    placeholder="Ví dụ: Gần chung cư, gọi điện trước khi giao hàng..."
                    maxLength={500}
                  />
                  {errors.notes ? (
                    <p className="text-rose-400 text-xs mt-1 flex items-center gap-1 pl-1">
                      <span>⚠️</span> {errors.notes}
                    </p>
                  ) : addressData.notes && (
                    <p className="text-[10px] text-gray-500 font-mono text-right pr-2 mt-0.5">
                      {addressData.notes.length}/500 ký tự
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
