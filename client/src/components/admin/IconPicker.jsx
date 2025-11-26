import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

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
  const [searchTerm, setSearchTerm] = useState('');

  const filteredIcons = AQUATIC_ICONS.filter(icon => 
    icon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    icon.keywords.toLowerCase().includes(searchTerm.toLowerCase()) ||
    icon.emoji.includes(searchTerm)
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Chọn icon cho danh mục</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm icon... (vd: cá, cây, đèn)"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {filteredIcons.length} icon được tìm thấy
          </p>
        </div>

        {/* Icon Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
            {filteredIcons.map((icon, index) => (
              <button
                key={index}
                onClick={() => {
                  onSelect(icon.emoji);
                  onClose();
                }}
                className={`
                  aspect-square flex items-center justify-center text-3xl rounded-lg
                  transition-all duration-200 hover:scale-110
                  ${selectedIcon === icon.emoji
                    ? 'bg-blue-100 ring-2 ring-blue-500 scale-105'
                    : 'bg-gray-50 hover:bg-gray-100'
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
              <p className="text-lg font-medium">Không tìm thấy icon phù hợp</p>
              <p className="text-sm mt-1">Thử tìm kiếm với từ khóa khác</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              {selectedIcon && (
                <span className="flex items-center gap-2">
                  <span className="text-2xl">{selectedIcon}</span>
                  <span>Icon đã chọn</span>
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition"
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
