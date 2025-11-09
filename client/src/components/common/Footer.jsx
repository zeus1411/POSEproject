import React from "react";
import { Link } from "react-router-dom";
import {
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Twitter,
  Youtube,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">

        {/* --- Cột 1: Logo + Mô tả --- */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-3">POSE Shop</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            POSE Shop là nơi mang đến cho bạn những sản phẩm và phụ kiện về thủy sinh chất lượng, giúp bạn tiến đến gần với đam mê.
          </p>

          <div className="flex space-x-4 mt-4">
            <a href="#" className="hover:text-white transition">
              <Facebook size={20} />
            </a>
            <a href="#" className="hover:text-white transition">
              <Instagram size={20} />
            </a>
            <a href="#" className="hover:text-white transition">
              <Twitter size={20} />
            </a>
            <a href="#" className="hover:text-white transition">
              <Youtube size={20} />
            </a>
          </div>
        </div>

        {/* --- Cột 2: Về chúng tôi --- */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Về chúng tôi</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/about" className="hover:text-white transition">
                Giới thiệu POSE
              </Link>
            </li>
            <li>
              <Link to="/terms" className="hover:text-white transition">
                Điều khoản sử dụng
              </Link>
            </li>
            <li>
              <Link to="/privacy" className="hover:text-white transition">
                Chính sách bảo mật
              </Link>
            </li>
            <li>
              <Link to="/career" className="hover:text-white transition">
                Tuyển dụng
              </Link>
            </li>
          </ul>
        </div>

        {/* --- Cột 3: Hỗ trợ khách hàng --- */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Hỗ trợ khách hàng</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/faq" className="hover:text-white transition">
                Câu hỏi thường gặp
              </Link>
            </li>
            <li>
              <Link to="/return-policy" className="hover:text-white transition">
                Chính sách đổi trả
              </Link>
            </li>
            <li>
              <Link to="/shipping" className="hover:text-white transition">
                Chính sách giao hàng
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-white transition">
                Liên hệ hỗ trợ
              </Link>
            </li>
          </ul>
        </div>

        {/* --- Cột 4: Thông tin liên hệ --- */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Liên hệ</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <MapPin size={18} className="text-primary-400 mt-1" />
              <span>1 Võ Văn Ngân, Linh Chiểu, TP HCM</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone size={18} className="text-primary-400" />
              <span>+84 337 826 369</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail size={18} className="text-primary-400" />
              <span>22110077@student.hcmute.edu.vn</span>
            </li>
          </ul>
        </div>
      </div>

      {/* --- Dòng bản quyền --- */}
      <div className="border-t border-gray-700 py-4 text-center text-sm text-gray-400">
        &copy; {new Date().getFullYear()} POSE Shop. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
