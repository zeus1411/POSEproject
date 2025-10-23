import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-gray-600">
            &copy; {new Date().getFullYear()} POSE Shop. All rights reserved.
          </div>
          <div className="flex space-x-6">
            <Link to="/terms" className="text-sm text-gray-600 hover:text-primary-600 transition">
              Điều khoản
            </Link>
            <Link to="/privacy" className="text-sm text-gray-600 hover:text-primary-600 transition">
              Bảo mật
            </Link>
            <Link to="/contact" className="text-sm text-gray-600 hover:text-primary-600 transition">
              Liên hệ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
