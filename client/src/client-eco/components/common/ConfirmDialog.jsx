import React from 'react';
import { AlertCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ConfirmDialog = ({ isOpen, title, message, confirmText = 'Xác nhận', cancelText = 'Hủy', onConfirm, onCancel, isDangerous = false }) => {
  const { isDark } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] transition-all duration-300">
      <div className={`glass-panel solid-modal shadow-2xl rounded-3xl max-w-md w-full mx-4 border transition-all duration-300 overflow-hidden ${
        isDark ? 'border-white/10 shadow-black/50' : 'border-water/40 shadow-slate-900/10'
      }`}>
        <div className={`flex items-center gap-3.5 p-6 border-b transition-colors duration-300 ${
          isDark ? 'border-white/5' : 'border-water/10'
        }`}>
          <AlertCircle size={24} className={isDangerous ? 'text-red-500' : (isDark ? 'text-emerald-400' : 'text-primary')} />
          <h2 className={`text-lg font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>{title}</h2>
        </div>

        <div className="p-6">
          <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-slate-600'}`}>{message}</p>
        </div>

        <div className={`flex gap-3 justify-end p-6 border-t transition-colors duration-300 ${
          isDark ? 'border-white/5 bg-white/5' : 'border-water/10 bg-water/5'
        }`}>
          <button
            onClick={onCancel}
            className={`px-5 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 active:scale-95 ${
              isDark 
                ? 'border-white/10 text-gray-300 hover:bg-white/10 hover:text-white' 
                : 'border-water/20 text-slate-700 hover:bg-water/10 hover:text-slate-900'
            }`}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2.5 text-white rounded-xl transition-all duration-200 font-semibold text-sm active:scale-95 shadow-lg ${
              isDangerous
                ? 'bg-red-500 hover:bg-red-600 shadow-red-500/10 hover:shadow-red-500/20'
                : (isDark 
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-500/10 hover:shadow-emerald-500/20'
                    : 'bg-gradient-to-r from-primary to-water hover:opacity-90 shadow-primary/10 hover:shadow-primary/20')
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
