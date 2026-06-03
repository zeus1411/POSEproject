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
    <footer className="bg-abyss text-gray-400 mt-auto border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">

        {/* --- Cột 1: Logo + Mô tả --- */}
        <div>
          <h2 className="text-2xl font-headline font-bold text-white mb-3 flex items-center gap-2">
            <span className="text-neon-cyan">🐠</span> AquaticCaps
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed font-body">
            Khám phá sản phẩm đẳng cấp, biến không gian sống thành tác phẩm nghệ thuật thủy sinh.
          </p>

          <div className="flex space-x-4 mt-5">
            <a href="#" className="text-gray-500 hover:text-neon-cyan transition-colors duration-200">
              <Facebook size={20} />
            </a>
            <a href="#" className="text-gray-500 hover:text-neon-cyan transition-colors duration-200">
              <Instagram size={20} />
            </a>
            <a href="#" className="text-gray-500 hover:text-neon-cyan transition-colors duration-200">
              <Youtube size={20} />
            </a>
            <a href="#" className="text-gray-500 hover:text-neon-cyan transition-colors duration-200">
              <Twitter size={20} />
            </a>
          </div>
        </div>

        {/* --- Cột 2: Trang chủ --- */}
        <div>
          <h3 className="text-sm font-body font-semibold text-white uppercase tracking-wider mb-4">Trang chủ</h3>
          <ul className="space-y-2.5 text-sm font-body">
            <li>
              <Link to="/" className="hover:text-neon-cyan transition-colors duration-200">
                Trang chủ
              </Link>
            </li>
            <li>
              <Link to="/shop" className="hover:text-neon-cyan transition-colors duration-200">
                Cửa hàng
              </Link>
            </li>
            <li>
              <Link to="/blogs" className="hover:text-neon-cyan transition-colors duration-200">
                Blog
              </Link>
            </li>
          </ul>
        </div>

        {/* --- Cột 3: Blog --- */}
        <div>
          <h3 className="text-sm font-body font-semibold text-white uppercase tracking-wider mb-4">Blog</h3>
          <ul className="space-y-2.5 text-sm font-body">
            <li>
              <Link to="/blogs" className="hover:text-neon-cyan transition-colors duration-200">
                Bài viết
              </Link>
            </li>
            <li>
              <Link to="/blogs" className="hover:text-neon-cyan transition-colors duration-200">
                Mẹo vặt
              </Link>
            </li>
            <li>
              <Link to="/blogs" className="hover:text-neon-cyan transition-colors duration-200">
                Cách nuôi cá
              </Link>
            </li>
          </ul>
        </div>

        {/* --- Cột 4: Info Liên hệ --- */}
        <div>
          <h3 className="text-sm font-body font-semibold text-white uppercase tracking-wider mb-4">Liên hệ</h3>
          <ul className="space-y-3 text-sm font-body">
            <li className="flex items-start gap-2">
              <MapPin size={18} className="text-neon-cyan/60 mt-0.5 flex-shrink-0" />
              <span>1 Võ Văn Ngân, Linh Chiểu, TP HCM</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone size={18} className="text-neon-cyan/60 flex-shrink-0" />
              <span>+84 969258024</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail size={18} className="text-neon-cyan/60 flex-shrink-0" />
              <span>22110039@student.hcmute.edu.vn</span>
            </li>
          </ul>

          {/* Social icons row for mobile */}
          <div className="flex space-x-3 mt-5">
            <a href="#" className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:text-neon-cyan hover:border-neon-cyan/30 transition-all duration-200">
              <Facebook size={16} />
            </a>
            <a href="#" className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:text-neon-cyan hover:border-neon-cyan/30 transition-all duration-200">
              <Instagram size={16} />
            </a>
            <a href="#" className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:text-neon-cyan hover:border-neon-cyan/30 transition-all duration-200">
              <Youtube size={16} />
            </a>
            <a href="#" className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:text-neon-cyan hover:border-neon-cyan/30 transition-all duration-200">
              <Twitter size={16} />
            </a>
          </div>
        </div>
      </div>

      {/* --- Dòng bản quyền --- */}
      <div className="border-t border-white/5 py-4 text-center text-sm text-gray-600 font-body">
        Copyright © {new Date().getFullYear()} AquaticCaps. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
