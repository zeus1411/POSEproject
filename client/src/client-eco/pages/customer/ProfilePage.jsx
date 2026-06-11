import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { User, MapPin, Phone, Mail, Edit2, Save, X, Eye, EyeOff, Camera, Loader2, Lock } from 'lucide-react';
import userService from '../../services/userService';
import addressService from '../../services/addressService';
import { setUser } from '../../redux/slices/authSlice';
import Swal from 'sweetalert2';
import { useTheme } from '../../context/ThemeContext';

const ProfilePage = () => {
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const { isDark } = useTheme();
  const isGoogleAccount = Boolean(user?.isGoogleAccount || user?.googleId);
  
  const [activeTab, setActiveTab] = useState('personal'); // 'personal', 'address', 'password'
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
      setPasswordStrength({ label: 'Yếu', color: 'border-rose-300 dark:border-rose-500/50', textColor: 'text-rose-600 dark:text-rose-400', bar: 'bg-rose-500', width: '25%' });
    } else if (strength === 3) {
      setPasswordStrength({ label: 'Trung bình', color: 'border-amber-300 dark:border-amber-500/50', textColor: 'text-amber-600 dark:text-amber-400', bar: 'bg-amber-500', width: '50%' });
    } else if (strength >= 4) {
      setPasswordStrength({ label: 'Mạnh', color: 'border-emerald-300 dark:border-emerald-500/50', textColor: 'text-emerald-600 dark:text-emerald-400', bar: 'bg-emerald-500', width: '100%' });
    } else {
      setPasswordStrength({ label: '', color: 'border-water/30 dark:border-white/10', textColor: 'text-muted-foreground', bar: '', width: '0%' });
    }
  };

  const handleChangePassword = async () => {
    setErrors({});
    if (isGoogleAccount) {
      Swal.fire({
        icon: 'info',
        title: 'Tài khoản Google',
        text: 'Tài khoản này đăng nhập bằng Google. Bạn không có mật khẩu riêng trên hệ thống. Vui lòng quản lý mật khẩu trong tài khoản Google.',
        confirmButtonColor: 'rgb(var(--natural-green))',
        customClass: {
          popup: 'aquatic-swal-popup',
          title: 'aquatic-swal-title',
          htmlContainer: 'aquatic-swal-html',
          confirmButton: 'aquatic-swal-confirm-btn'
        }
      });
      return;
    }

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

      {/* 2. Hệ thống vân sóng vô chậm lặp lại toàn trang */}
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
      <div className="relative z-10 max-w-6xl mx-auto px-4">
        
        {/* Grid Layout chính */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* CỘT TRÁI: SIDEBAR THÔNG TIN TÓM TẮT & DI CHUYỂN NHANH */}
          <div className="md:col-span-4 space-y-6">
            <div className="glass-panel shadow-2xl rounded-3xl p-6 border border-water/45 dark:border-white/10 backdrop-blur-md bg-white/80 dark:bg-white/[0.02]">
              
              {/* Ảnh Đại Diện & Thông Tin Cơ Bản */}
              <div className="flex flex-col items-center text-center">
                <div className="relative group w-28 h-28 rounded-full overflow-hidden border-2 border-water/40 dark:border-white/20 shadow-inner cursor-pointer" onClick={handleAvatarClick}>
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-14 h-14 text-muted-foreground m-auto" />
                  )}
                  {/* Lớp phủ hover mượt mà - Chỉ xuất hiện khi rê chuột vào vòng tròn ảnh đại diện */}
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

                <h2 className="mt-4 text-xl font-bold tracking-tight text-gray-950 dark:text-white">{user?.username}</h2>
                <p className="text-gray-600 dark:text-gray-400 text-xs mt-1 flex items-center gap-1.5 justify-center">
                  <Mail className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                  {user?.email}
                </p>
                
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  disabled={isUploading}
                  className="mt-3 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors disabled:opacity-50"
                >
                  {isUploading ? 'Đang tải lên...' : '✨ Đổi ảnh đại diện'}
                </button>
              </div>

              {/* Đường kẻ ngăn cách */}
              <div className="border-t border-black/10 dark:border-white/10 my-6"></div>

              {/* Menu Điều Hướng Tabs */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('personal');
                    setIsEditingPersonal(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                    activeTab === 'personal'
                      ? 'bg-emerald-600/10 dark:bg-emerald-600/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 dark:border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white border border-transparent'
                  }`}
                >
                  <User className="w-5 h-5" />
                  Thông tin cá nhân
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('address');
                    setIsEditingAddress(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                    activeTab === 'address'
                      ? 'bg-emerald-600/10 dark:bg-emerald-600/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 dark:border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white border border-transparent'
                  }`}
                >
                  <MapPin className="w-5 h-5" />
                  Sổ địa chỉ nhận hàng
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('password');
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                    activeTab === 'password'
                      ? 'bg-emerald-600/10 dark:bg-emerald-600/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 dark:border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white border border-transparent'
                  }`}
                >
                  <Lock className="w-5 h-5" />
                  Đổi mật khẩu
                </button>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: CHI TIẾT CỦA TAB ĐANG CHỌN */}
          <div className="md:col-span-8">
            <div className="glass-panel shadow-2xl rounded-3xl p-8 border border-water/45 dark:border-white/10 backdrop-blur-md bg-white/80 dark:bg-white/[0.02] min-h-[460px]">
              
              {/* TAB 1: THÔNG TIN CÁ NHÂN */}
              {activeTab === 'personal' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-black/10 dark:border-white/10 pb-4">
                    <h2 className="text-xl font-bold tracking-tight text-gray-950 dark:text-white flex items-center gap-2">
                      <User className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      Thông tin cá nhân
                    </h2>
                    {isEditingPersonal ? (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setIsEditingPersonal(false)}
                          className="px-4 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-xl text-sm font-semibold transition-colors"
                        >
                          Hủy
                        </button>
                        <button
                          type="button"
                          onClick={handleUpdatePersonal}
                          disabled={loading}
                          className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl transition-colors shadow-md shadow-emerald-950/30 disabled:bg-gray-700 disabled:opacity-50"
                        >
                          <Save className="w-4 h-4" />
                          {loading ? 'Đang lưu...' : 'Lưu lại'}
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsEditingPersonal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-emerald-700 dark:text-emerald-400 text-sm font-bold rounded-xl border border-emerald-500/20 transition-all duration-300"
                      >
                        <Edit2 className="w-4 h-4" />
                        Chỉnh sửa
                      </button>
                    )}
                  </div>

                  {!isEditingPersonal ? (
                    /* Chế độ xem: Hiển thị các ô thông tin sang trọng */
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05] rounded-2xl p-4 transition-all duration-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] hover:border-emerald-500/20 group">
                        <span className="text-gray-700 dark:text-gray-400 text-xs block mb-1 font-medium">Tên đăng nhập</span>
                        <span className="text-gray-900 dark:text-white font-bold text-base">{user?.username || 'Chưa cập nhật'}</span>
                      </div>

                      <div className="bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05] rounded-2xl p-4 transition-all duration-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] hover:border-emerald-500/20 group">
                        <span className="text-gray-700 dark:text-gray-400 text-xs block mb-1 font-medium">Họ và tên</span>
                        <span className="text-gray-900 dark:text-white font-bold text-base">{user?.fullName || 'Chưa cập nhật'}</span>
                      </div>

                      <div className="bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05] rounded-2xl p-4 transition-all duration-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] hover:border-emerald-500/20 group">
                        <span className="text-gray-700 dark:text-gray-400 text-xs block mb-1 font-medium">Số điện thoại</span>
                        <span className="text-gray-900 dark:text-white font-bold text-base font-mono">{user?.phone || 'Chưa cập nhật'}</span>
                      </div>

                      <div className="bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05] rounded-2xl p-4 transition-all duration-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] hover:border-emerald-500/20 group">
                        <span className="text-gray-700 dark:text-gray-400 text-xs block mb-1 font-medium">Ngày sinh</span>
                        <span className="text-gray-900 dark:text-white font-bold text-base font-mono">{formatDateForDisplay(user?.dateOfBirth)}</span>
                      </div>

                      <div className="bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05] rounded-2xl p-4 transition-all duration-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] hover:border-emerald-500/20 group sm:col-span-2">
                        <span className="text-gray-700 dark:text-gray-400 text-xs block mb-1 font-medium">Giới tính</span>
                        <span className="text-gray-900 dark:text-white font-bold text-base">
                          {user?.gender === 'male' ? 'Nam' : user?.gender === 'female' ? 'Nữ' : 'Chưa cập nhật'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* Chế độ chỉnh sửa: Form chỉnh sửa tinh tế */
                    <div className="space-y-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-900 dark:text-gray-200 pl-1">Tên người dùng</label>
                        <input
                          type="text"
                          value={personalData.username}
                          onChange={(e) => setPersonalData({...personalData, username: e.target.value})}
                          className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl px-5 py-3 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all shadow-inner text-sm"
                          placeholder="Nhập tên người dùng..."
                        />
                      </div>
                      
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-900 dark:text-gray-200 pl-1">
                          Họ tên <span className="text-rose-600 dark:text-rose-450 font-bold">*</span>
                        </label>
                        <input
                          type="text"
                          value={personalData.fullName}
                          onChange={(e) => {
                            setPersonalData({...personalData, fullName: e.target.value});
                            if (errors.fullName) setErrors({...errors, fullName: null});
                          }}
                          className={`w-full bg-black/5 dark:bg-white/5 border rounded-2xl px-5 py-3 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all shadow-inner text-sm ${
                            errors.fullName ? 'border-rose-500 focus:ring-rose-500/50' : 'border-black/10 dark:border-white/10'
                          }`}
                          placeholder="Nguyễn Văn A"
                          maxLength={100}
                        />
                        {errors.fullName && (
                          <p className="text-rose-600 dark:text-rose-400 text-xs mt-1 flex items-center gap-1 pl-1 font-semibold">
                            <span>⚠️</span> {errors.fullName}
                          </p>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-gray-900 dark:text-gray-200 pl-1">
                            Số điện thoại <span className="text-rose-600 dark:text-rose-450 font-bold">*</span>
                          </label>
                          <input
                            type="tel"
                            value={personalData.phone}
                            onChange={(e) => {
                              setPersonalData({...personalData, phone: e.target.value});
                              if (errors.phone) setErrors({...errors, phone: null});
                            }}
                            className={`w-full bg-black/5 dark:bg-white/5 border rounded-2xl px-5 py-3 text-gray-900 dark:text-white font-mono placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all shadow-inner text-sm ${
                              errors.phone ? 'border-rose-500 focus:ring-rose-500/50' : 'border-black/10 dark:border-white/10'
                            }`}
                            placeholder="0912345678"
                          />
                          {errors.phone ? (
                            <p className="text-rose-600 dark:text-rose-400 text-xs mt-1 flex items-center gap-1 pl-1 font-semibold">
                              <span>⚠️</span> {errors.phone}
                            </p>
                          ) : personalData.phone && (
                            <p className="text-[11px] text-gray-600 dark:text-gray-400 pl-1 mt-0.5 font-mono">Định dạng chuẩn: 0912345678</p>
                          )}
                        </div>
                        
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-gray-900 dark:text-gray-200 pl-1">Ngày sinh</label>
                          <input
                            type="date"
                            value={personalData.dateOfBirth}
                            onChange={(e) => setPersonalData({...personalData, dateOfBirth: e.target.value})}
                            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl px-5 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all shadow-inner text-sm dark:scheme-dark"
                          />
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-1.5 pt-1">
                        <label className="text-xs font-bold text-gray-900 dark:text-gray-200 pl-1">Giới tính</label>
                        <div className="flex gap-6 pl-1 mt-1">
                          <label className="flex items-center text-sm font-semibold gap-2 cursor-pointer text-gray-900 dark:text-gray-200 hover:text-gray-950 dark:hover:text-white transition-colors">
                            <input
                              type="radio"
                              value="male"
                              checked={personalData.gender === 'male'}
                              onChange={(e) => setPersonalData({...personalData, gender: e.target.value})}
                              className="accent-emerald-500 w-4 h-4"
                            />
                            Nam
                          </label>
                          <label className="flex items-center text-sm font-semibold gap-2 cursor-pointer text-gray-900 dark:text-gray-200 hover:text-gray-950 dark:hover:text-white transition-colors">
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
              )}

              {/* TAB 2: SỔ ĐỊA CHỈ NHẬN HÀNG */}
              {activeTab === 'address' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-black/10 dark:border-white/10 pb-4">
                    <h2 className="text-xl font-bold tracking-tight text-gray-950 dark:text-white flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                      Sổ địa chỉ nhận hàng
                    </h2>
                    {isEditingAddress ? (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setIsEditingAddress(false)}
                          className="px-4 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-xl text-sm font-semibold transition-colors"
                        >
                          Hủy
                        </button>
                        <button
                          type="button"
                          onClick={handleUpdateAddress}
                          disabled={loading}
                          className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl transition-colors shadow-md disabled:bg-gray-700 disabled:opacity-50"
                        >
                          <Save className="w-4 h-4" />
                          {loading ? 'Đang lưu...' : 'Lưu lại'}
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsEditingAddress(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-emerald-700 dark:text-emerald-400 text-sm font-bold rounded-xl border border-emerald-500/20 transition-all duration-300"
                      >
                        <Edit2 className="w-4 h-4" />
                        {user?.address?.street ? 'Chỉnh sửa' : 'Thêm địa chỉ'}
                      </button>
                    )}
                  </div>

                  {!isEditingAddress ? (
                    /* Chế độ xem địa chỉ */
                    <div className="bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05] rounded-2xl p-6 transition-all duration-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.04]">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400">
                          <MapPin className="w-6 h-6" />
                        </div>
                        <div className="space-y-3 flex-1">
                          <span className="text-xs text-gray-700 dark:text-gray-400 uppercase tracking-wider font-bold">Địa chỉ nhận hàng mặc định</span>
                          <p className="text-gray-900 dark:text-white font-bold text-lg leading-relaxed">{getFullAddress()}</p>
                          
                          {user?.address?.notes && (
                            <div className="mt-4 p-3 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl font-mono text-xs text-gray-900 dark:text-gray-300 flex items-start gap-2">
                              <span className="text-cyan-600 dark:text-cyan-400">📝</span>
                              <div>
                                <span className="font-bold block mb-0.5 text-[11px] text-gray-700 dark:text-gray-400">Ghi chú giao kho:</span>
                                {user.address.notes}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Chế độ chỉnh sửa địa chỉ */
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-gray-900 dark:text-gray-200 pl-1">
                            Tỉnh/Thành phố <span className="text-rose-600 dark:text-rose-450 font-bold">*</span>
                          </label>
                          <select
                            value={addressData.cityId}
                            onChange={(e) => {
                              handleProvinceChange(e);
                              if (errors.city) setErrors({...errors, city: null});
                            }}
                            disabled={loadingLocation}
                            className={`w-full bg-black/5 dark:bg-white/5 border rounded-2xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer appearance-none ${
                              errors.city ? 'border-rose-500 focus:ring-rose-500/50' : 'border-black/10 dark:border-white/10'
                            }`}
                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='${isDark ? 'white' : 'black'}'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1em' }}
                          >
                            <option value="" className="bg-white dark:bg-[#0a2828] text-gray-500">-- Chọn Tỉnh/TP --</option>
                            {provinces.map(province => (
                              <option key={province.id} value={province.id} className="bg-white dark:bg-[#0a2828] text-gray-900 dark:text-white">
                                {province.name}
                              </option>
                            ))}
                          </select>
                          {errors.city && (
                            <p className="text-rose-600 dark:text-rose-400 text-xs mt-1 flex items-center gap-1 pl-1 font-semibold">
                              <span>⚠️</span> {errors.city}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-gray-900 dark:text-gray-200 pl-1">
                            Quận/Huyện <span className="text-rose-600 dark:text-rose-450 font-bold">*</span>
                          </label>
                          <select
                            value={addressData.districtId}
                            onChange={(e) => {
                              handleDistrictChange(e);
                              if (errors.district) setErrors({...errors, district: null});
                            }}
                            disabled={!addressData.cityId || loadingLocation}
                            className={`w-full bg-black/5 dark:bg-white/5 border rounded-2xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer appearance-none ${
                              errors.district ? 'border-rose-500 focus:ring-rose-500/50' : 'border-black/10 dark:border-white/10'
                            }`}
                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='${isDark ? 'white' : 'black'}'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1em' }}
                          >
                            <option value="" className="bg-white dark:bg-[#0a2828] text-gray-500">-- Chọn Quận/Huyện --</option>
                            {districts.map(district => (
                              <option key={district.id} value={district.id} className="bg-white dark:bg-[#0a2828] text-gray-900 dark:text-white">
                                {district.name}
                              </option>
                            ))}
                          </select>
                          {errors.district && (
                            <p className="text-rose-600 dark:text-rose-400 text-xs mt-1 flex items-center gap-1 pl-1 font-semibold">
                              <span>⚠️</span> {errors.district}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-gray-900 dark:text-gray-200 pl-1">
                            Phường/Xã <span className="text-rose-600 dark:text-rose-450 font-bold">*</span>
                          </label>
                          <select
                            value={addressData.wardCode}
                            onChange={(e) => {
                              handleWardChange(e);
                              if (errors.ward) setErrors({...errors, ward: null});
                            }}
                            disabled={!addressData.districtId || loadingLocation}
                            className={`w-full bg-black/5 dark:bg-white/5 border rounded-2xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer appearance-none ${
                              errors.ward ? 'border-rose-500 focus:ring-rose-500/50' : 'border-black/10 dark:border-white/10'
                            }`}
                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='${isDark ? 'white' : 'black'}'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1em' }}
                          >
                            <option value="" className="bg-white dark:bg-[#0a2828] text-gray-500">-- Chọn Phường/Xã --</option>
                            {wards.map(ward => (
                              <option key={ward.id} value={ward.id} className="bg-white dark:bg-[#0a2828] text-gray-900 dark:text-white">
                                {ward.name}
                              </option>
                            ))}
                          </select>
                          {errors.ward && (
                            <p className="text-rose-600 dark:text-rose-400 text-xs mt-1 flex items-center gap-1 pl-1 font-semibold">
                              <span>⚠️</span> {errors.ward}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-900 dark:text-gray-200 pl-1">
                          Địa chỉ cụ thể (số nhà, tên đường) <span className="text-rose-600 dark:text-rose-450 font-bold">*</span>
                        </label>
                        <input
                          type="text"
                          value={addressData.street}
                          onChange={(e) => {
                            setAddressData({...addressData, street: e.target.value});
                            if (errors.street) setErrors({...errors, street: null});
                          }}
                          className={`w-full bg-black/5 dark:bg-white/5 border rounded-2xl px-5 py-3 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all shadow-inner text-sm ${
                            errors.street ? 'border-rose-500 focus:ring-rose-500/50' : 'border-black/10 dark:border-white/10'
                          }`}
                          placeholder="Số 123, Đường Nguyễn Văn Linh..."
                          maxLength={200}
                        />
                        {errors.street && (
                          <p className="text-rose-600 dark:text-rose-400 text-xs mt-1 flex items-center gap-1 pl-1 font-semibold">
                            <span>⚠️</span> {errors.street}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-900 dark:text-gray-200 pl-1">Ghi chú giao kho (tùy chọn)</label>
                        <textarea
                          value={addressData.notes}
                          onChange={(e) => {
                            setAddressData({...addressData, notes: e.target.value});
                            if (errors.notes) setErrors({...errors, notes: null});
                          }}
                          rows={3}
                          className={`w-full bg-black/5 dark:bg-white/5 border rounded-2xl px-5 py-3 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none text-sm leading-relaxed ${
                            errors.notes ? 'border-rose-500 focus:ring-rose-500/50' : 'border-black/10 dark:border-white/10'
                          }`}
                          placeholder="Ví dụ: Gần chung cư, gọi điện trước khi giao hàng..."
                          maxLength={500}
                        />
                        {errors.notes ? (
                          <p className="text-rose-600 dark:text-rose-400 text-xs mt-1 flex items-center gap-1 pl-1 font-semibold">
                            <span>⚠️</span> {errors.notes}
                          </p>
                        ) : addressData.notes && (
                          <p className="text-[10px] text-gray-600 dark:text-gray-400 font-mono text-right pr-2 mt-0.5">
                            {addressData.notes.length}/500 ký tự
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: ĐỔI MẬT KHẨU */}
              {activeTab === 'password' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-black/10 dark:border-white/10 pb-4">
                    <h2 className="text-xl font-bold tracking-tight text-gray-950 dark:text-white flex items-center gap-2">
                      <Lock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      Bảo mật & Đổi mật khẩu
                    </h2>
                    {!isGoogleAccount && (
                    <button
                      type="button"
                      onClick={handleChangePassword}
                      disabled={loading}
                      className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl transition-colors shadow-md shadow-emerald-950/30 disabled:bg-gray-700 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {loading ? 'Đang lưu...' : 'Lưu mật khẩu'}
                    </button>
                    )}
                  </div>

                  {isGoogleAccount ? (
                    <div className="flex min-h-[260px] flex-col items-center justify-center text-center">
                      <div className="mb-5 flex h-24 w-24 items-center justify-center rounded-full border-4 border-rose-500 text-rose-500 dark:border-rose-400 dark:text-rose-400">
                        <X className="h-14 w-14" strokeWidth={2.75} />
                      </div>
                      <p className="text-xl font-bold text-gray-950 dark:text-white">Tài khoản này đăng nhập bằng Google</p>
                      <p className="mt-3 max-w-xl text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                        Bạn không có mật khẩu riêng trên hệ thống. Vui lòng quản lý mật khẩu trong tài khoản Google.
                      </p>
                    </div>
                  ) : (
                  <div className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-900 dark:text-gray-200 pl-1">
                        Mật khẩu hiện tại <span className="text-rose-600 dark:text-rose-450 font-bold">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={passwordVisible.current ? 'text' : 'password'}
                          value={passwordData.currentPassword}
                          onChange={(e) => {
                            setPasswordData({...passwordData, currentPassword: e.target.value});
                            if (errors.currentPassword) setErrors({...errors, currentPassword: null});
                          }}
                          className={`w-full bg-black/5 dark:bg-white/5 border rounded-2xl pl-5 pr-12 py-3 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all shadow-inner text-sm ${
                            errors.currentPassword ? 'border-rose-500 focus:ring-rose-500/50' : 'border-black/10 dark:border-white/10'
                          }`}
                          placeholder="Nhập mật khẩu hiện tại..."
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('current')}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                          {passwordVisible.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors.currentPassword && (
                        <p className="text-rose-600 dark:text-rose-400 text-xs mt-1 flex items-center gap-1 pl-1 font-semibold">
                          <span>⚠️</span> {errors.currentPassword}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-900 dark:text-gray-200 pl-1">
                        Mật khẩu mới <span className="text-rose-600 dark:text-rose-450 font-bold">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={passwordVisible.new ? 'text' : 'password'}
                          value={passwordData.newPassword}
                          onChange={(e) => {
                            handlePasswordChange(e.target.value);
                            if (errors.newPassword) setErrors({...errors, newPassword: null});
                          }}
                          className={`w-full bg-black/5 dark:bg-white/5 border rounded-2xl pl-5 pr-12 py-3 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all shadow-inner text-sm ${
                            errors.newPassword ? 'border-rose-500 focus:ring-rose-500/50' : 'border-black/10 dark:border-white/10'
                          }`}
                          placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)..."
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('new')}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                          {passwordVisible.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      
                      {/* Password Strength Meter */}
                      {passwordData.newPassword && (
                        <div className="mt-2 pl-1 space-y-1.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-700 dark:text-gray-300 font-medium">Độ mạnh mật khẩu:</span>
                            <span className={`font-bold ${passwordStrength.textColor}`}>{passwordStrength.label}</span>
                          </div>
                          <div className="w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-500 ${passwordStrength.bar}`}
                              style={{ width: passwordStrength.width }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {errors.newPassword && (
                        <p className="text-rose-600 dark:text-rose-400 text-xs mt-1 flex items-center gap-1 pl-1 font-semibold">
                          <span>⚠️</span> {errors.newPassword}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-gray-900 dark:text-gray-200 pl-1">
                        Xác nhận mật khẩu mới <span className="text-rose-600 dark:text-rose-450 font-bold">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={passwordVisible.confirm ? 'text' : 'password'}
                          value={passwordData.confirmPassword}
                          onChange={(e) => {
                            setPasswordData({...passwordData, confirmPassword: e.target.value});
                            if (errors.confirmPassword) setErrors({...errors, confirmPassword: null});
                          }}
                          className={`w-full bg-black/5 dark:bg-white/5 border rounded-2xl pl-5 pr-12 py-3 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all shadow-inner text-sm ${
                            errors.confirmPassword ? 'border-rose-500 focus:ring-rose-500/50' : 'border-black/10 dark:border-white/10'
                          }`}
                          placeholder="Nhập lại mật khẩu mới..."
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('confirm')}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                          {passwordVisible.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-rose-600 dark:text-rose-400 text-xs mt-1 flex items-center gap-1 pl-1 font-semibold">
                          <span>⚠️</span> {errors.confirmPassword}
                        </p>
                      )}
                    </div>
                  </div>
                  )}
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
