import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

// Danh sách icon cho aquatic shop
const AQUATIC_ICONS = [
  { emoji: '🐠', name: 'Cá nhiệt đới', keywords: 'fish tropical' },
  { emoji: '🐟', name: 'Cá', keywords: 'fish' },
  { emoji: '🐡', name: 'Cá nóc', keywords: 'puffer fish' },
  { emoji: '🦈', name: 'Cá mập', keywords: 'shark' },
  { emoji: '🐙', name: 'Bạch tuộc', keywords: 'octopus' },
  { emoji: '🦑', name: 'Mực', keywords: 'squid' },
  { emoji: '🦐', name: 'Tôm', keywords: 'shrimp' },
  { emoji: '🦞', name: 'Tôm hùm', keywords: 'lobster' },
  { emoji: '🦀', name: 'Cua', keywords: 'crab' },
  { emoji: '🐚', name: 'Vỏ sò', keywords: 'shell' },
  { emoji: '🪸', name: 'San hô', keywords: 'coral' },
  { emoji: '🪼', name: 'Sứa', keywords: 'jellyfish' },
  { emoji: '🐢', name: 'Rùa', keywords: 'turtle' },
  { emoji: '🌿', name: 'Cây thủy sinh', keywords: 'plant aquatic' },
  { emoji: '🪴', name: 'Cây cảnh', keywords: 'potted plant' },
  { emoji: '🌱', name: 'Cây con', keywords: 'seedling' },
  { emoji: '🍃', name: 'Lá cây', keywords: 'leaf' },
  { emoji: '🌾', name: 'Rêu', keywords: 'moss' },
  { emoji: '💧', name: 'Nước', keywords: 'water drop' },
  { emoji: '💦', name: 'Giọt nước', keywords: 'water droplets' },
  { emoji: '🌊', name: 'Sóng nước', keywords: 'wave water' },
  { emoji: '🫧', name: 'Bong bóng', keywords: 'bubbles' },
  { emoji: '⚡', name: 'Điện', keywords: 'electric' },
  { emoji: '🔌', name: 'Thiết bị điện', keywords: 'plug electric' },
  { emoji: '💡', name: 'Đèn', keywords: 'light bulb' },
  { emoji: '🔦', name: 'Đèn pin', keywords: 'flashlight' },
  { emoji: '🪔', name: 'Đèn dầu', keywords: 'lamp' },
  { emoji: '🧪', name: 'Hóa chất', keywords: 'chemical test tube' },
  { emoji: '⚗️', name: 'Dụng cụ thí nghiệm', keywords: 'laboratory' },
  { emoji: '🧬', name: 'Vi sinh', keywords: 'bacteria dna' },
  { emoji: '🌡️', name: 'Nhiệt độ', keywords: 'thermometer temperature' },
  { emoji: '📏', name: 'Đo đạc', keywords: 'ruler measure' },
  { emoji: '⚖️', name: 'Cân', keywords: 'scale balance' },
  { emoji: '🔬', name: 'Kính hiển vi', keywords: 'microscope' },
  { emoji: '🧰', name: 'Hộp công cụ', keywords: 'toolbox' },
  { emoji: '🛠️', name: 'Công cụ', keywords: 'tools' },
  { emoji: '🔧', name: 'Cờ lê', keywords: 'wrench tool' },
  { emoji: '🪛', name: 'Tua vít', keywords: 'screwdriver' },
  { emoji: '🔩', name: 'Vít ốc', keywords: 'screw bolt' },
  { emoji: '⚙️', name: 'Bánh răng', keywords: 'gear settings' },
  { emoji: '🧲', name: 'Nam châm', keywords: 'magnet' },
  { emoji: '🪣', name: 'Xô', keywords: 'bucket pail' },
  { emoji: '🧴', name: 'Chai lọ', keywords: 'bottle lotion' },
  { emoji: '🧼', name: 'Xà phòng', keywords: 'soap cleaning' },
  { emoji: '🧽', name: 'Bọt biển', keywords: 'sponge' },
  { emoji: '🪥', name: 'Bàn chải', keywords: 'brush' },
  { emoji: '🧹', name: 'Chổi', keywords: 'broom cleaning' },
  { emoji: '🪠', name: 'Cây hút', keywords: 'plunger' },
  { emoji: '🎣', name: 'Câu cá', keywords: 'fishing' },
  { emoji: '🛟', name: 'Phao', keywords: 'life ring' },
  { emoji: '⛵', name: 'Thuyền buồm', keywords: 'sailboat' },
  { emoji: '🚤', name: 'Thuyền máy', keywords: 'speedboat' },
  { emoji: '🏊', name: 'Bơi lội', keywords: 'swimming' },
  { emoji: '🤿', name: 'Lặn', keywords: 'diving mask' },
  { emoji: '🧊', name: 'Đá', keywords: 'ice' },
  { emoji: '❄️', name: 'Tuyết lạnh', keywords: 'snowflake cold' },
  { emoji: '🌡', name: 'Nhiệt kế', keywords: 'thermometer' },
  { emoji: '🔥', name: 'Lửa nóng', keywords: 'fire hot' },
  { emoji: '💨', name: 'Gió', keywords: 'wind air' },
  { emoji: '🌪️', name: 'Lốc xoáy', keywords: 'tornado cyclone' },
  { emoji: '🌈', name: 'Cầu vồng', keywords: 'rainbow' },
  { emoji: '☀️', name: 'Mặt trời', keywords: 'sun light' },
  { emoji: '🌙', name: 'Mặt trăng', keywords: 'moon night' },
  { emoji: '⭐', name: 'Ngôi sao', keywords: 'star' },
  { emoji: '✨', name: 'Lấp lánh', keywords: 'sparkles shine' },
  { emoji: '💎', name: 'Kim cương', keywords: 'diamond gem' },
  { emoji: '🪨', name: 'Đá cuội', keywords: 'rock stone' },
  { emoji: '🏔️', name: 'Núi đá', keywords: 'mountain rock' },
  { emoji: '🗿', name: 'Tượng đá', keywords: 'moai statue' },
  { emoji: '🏖️', name: 'Bãi biển', keywords: 'beach sand' },
  { emoji: '🏝️', name: 'Đảo hoang', keywords: 'desert island' },
  { emoji: '🗺️', name: 'Bản đồ', keywords: 'map world' },
  { emoji: '🧭', name: 'La bàn', keywords: 'compass direction' },
  { emoji: '📦', name: 'Hộp', keywords: 'box package' },
  { emoji: '📫', name: 'Hộp thư', keywords: 'mailbox post' },
  { emoji: '🎁', name: 'Quà tặng', keywords: 'gift present' },
  { emoji: '🎀', name: 'Nơ', keywords: 'ribbon bow' },
  { emoji: '🏆', name: 'Cúp vàng', keywords: 'trophy winner' },
  { emoji: '🥇', name: 'Huy chương vàng', keywords: 'gold medal first' },
  { emoji: '🥈', name: 'Huy chương bạc', keywords: 'silver medal second' },
  { emoji: '🥉', name: 'Huy chương đồng', keywords: 'bronze medal third' },
  { emoji: '🔖', name: 'Bookmark', keywords: 'tag label' },
  { emoji: '🏷️', name: 'Nhãn', keywords: 'label tag' },
  { emoji: '💰', name: 'Tiền', keywords: 'money bag' },
  { emoji: '💵', name: 'Tiền giấy', keywords: 'dollar bill' },
  { emoji: '💳', name: 'Thẻ tín dụng', keywords: 'credit card payment' },
  { emoji: '🛒', name: 'Giỏ hàng', keywords: 'shopping cart' },
  { emoji: '🛍️', name: 'Túi mua sắm', keywords: 'shopping bags' },
  { emoji: '🏪', name: 'Cửa hàng', keywords: 'shop store' },
  { emoji: '🏬', name: 'Trung tâm thương mại', keywords: 'mall department store' },
  { emoji: '🎯', name: 'Mục tiêu', keywords: 'target goal' },
  { emoji: '📊', name: 'Biểu đồ', keywords: 'chart statistics' },
  { emoji: '📈', name: 'Tăng trưởng', keywords: 'trending up growth' },
  { emoji: '📉', name: 'Giảm xuống', keywords: 'trending down decrease' },
  { emoji: '📌', name: 'Ghim', keywords: 'pin pushpin' },
  { emoji: '📍', name: 'Địa điểm', keywords: 'location pin' },
  { emoji: '🔔', name: 'Chuông', keywords: 'bell notification' },
  { emoji: '🔕', name: 'Tắt chuông', keywords: 'bell muted' },
  { emoji: '⚠️', name: 'Cảnh báo', keywords: 'warning alert' },
  { emoji: '❗', name: 'Quan trọng', keywords: 'important exclamation' },
  { emoji: '❓', name: 'Câu hỏi', keywords: 'question help' },
  { emoji: '✅', name: 'Hoàn thành', keywords: 'checkmark done' },
  { emoji: '❌', name: 'Hủy', keywords: 'cross cancel' },
  { emoji: '🎨', name: 'Nghệ thuật', keywords: 'art palette color' },
  { emoji: '🖌️', name: 'Cọ vẽ', keywords: 'paintbrush' },
  { emoji: '🖍️', name: 'Bút màu', keywords: 'crayon' },
  { emoji: '✏️', name: 'Bút chì', keywords: 'pencil' },
  { emoji: '🖊️', name: 'Bút', keywords: 'pen' },
  { emoji: '📝', name: 'Ghi chú', keywords: 'memo note' },
  { emoji: '📄', name: 'Tài liệu', keywords: 'document paper' },
  { emoji: '📋', name: 'Clipboard', keywords: 'clipboard' },
  { emoji: '📁', name: 'Thư mục', keywords: 'folder' },
  { emoji: '📂', name: 'Thư mục mở', keywords: 'folder open' },
  { emoji: '🗂️', name: 'Phân loại', keywords: 'file dividers' },
  { emoji: '📚', name: 'Sách', keywords: 'books library' },
  { emoji: '📖', name: 'Sách mở', keywords: 'book open reading' },
  { emoji: '📕', name: 'Sách đỏ', keywords: 'book red closed' },
  { emoji: '📗', name: 'Sách xanh lá', keywords: 'book green' },
  { emoji: '📘', name: 'Sách xanh dương', keywords: 'book blue' },
  { emoji: '📙', name: 'Sách vàng', keywords: 'book orange yellow' },
];

const IconPicker = ({ selectedIcon, onSelect, onClose }) => {
  const { isDark } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredIcons = AQUATIC_ICONS.filter(icon => 
    icon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    icon.keywords.toLowerCase().includes(searchTerm.toLowerCase()) ||
    icon.emoji.includes(searchTerm)
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[105] p-4 transition-all duration-300">
      <div className={`glass-panel solid-modal w-full max-w-3xl max-h-[80vh] overflow-hidden rounded-3xl border shadow-2xl transition-all duration-300 flex flex-col ${
        isDark ? 'border-white/10 text-white shadow-black/40' : 'border-water/40 text-slate-800 shadow-slate-900/10'
      }`}>
        {/* Header */}
        <div className={`p-4 border-b flex justify-between items-center transition-colors duration-300 ${
          isDark ? 'border-white/5 bg-[#051c1c]/95' : 'border-water/10 bg-[#FFFDF0]/95'
        }`}>
          <h3 className={`text-lg font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
            Chọn icon cho danh mục
          </h3>
          <button
            onClick={onClose}
            className={`transition-colors duration-200 ${isDark ? 'text-gray-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
          >
            <X size={24} />
          </button>
        </div>

        {/* Search */}
        <div className={`p-4 border-b transition-colors duration-300 ${
          isDark ? 'border-white/5' : 'border-water/10'
        }`}>
          <div className="relative">
            <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-slate-500'}`} size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm icon... (vd: cá, cây, đèn)"
              className={`w-full pl-11 pr-4 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ${
                isDark ? 'bg-white/5 border-white/10 text-white focus:bg-white/10' : 'bg-water/5 border-water/20 text-slate-800 focus:bg-water/10'
              }`}
            />
          </div>
          <p className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>
            {filteredIcons.length} icon được tìm thấy
          </p>
        </div>

        {/* Icon Grid */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2.5">
            {filteredIcons.map((icon, index) => (
              <button
                key={index}
                onClick={() => {
                  onSelect(icon.emoji);
                  onClose();
                }}
                className={`
                  aspect-square flex items-center justify-center text-3xl rounded-xl
                  transition-all duration-200 hover:scale-110 shadow-sm
                  ${selectedIcon === icon.emoji
                    ? (isDark ? 'bg-emerald-500/20 ring-2 ring-emerald-500 scale-105' : 'bg-primary/10 ring-2 ring-primary scale-105')
                    : (isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-water/5 hover:bg-water/10 text-slate-800')
                  }
                `}
                title={icon.name}
              >
                {icon.emoji}
              </button>
            ))}
          </div>

          {filteredIcons.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">🔍</div>
              <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Không tìm thấy icon phù hợp</p>
              <p className={`text-sm mt-1 ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>Thử tìm kiếm với từ khóa khác</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`p-4 border-t transition-colors duration-300 ${
          isDark ? 'border-white/5 bg-white/5' : 'border-water/10 bg-water/5'
        }`}>
          <div className="flex items-center justify-between text-sm">
            <div>
              {selectedIcon && (
                <span className="flex items-center gap-2">
                  <span className="text-2xl">{selectedIcon}</span>
                  <span className={`font-semibold ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>Icon đã chọn</span>
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95 border ${
                isDark 
                  ? 'border-white/10 text-gray-300 hover:bg-white/10 hover:text-white' 
                  : 'border-water/20 text-slate-700 hover:bg-water/10 hover:text-slate-900'
              }`}
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IconPicker;
