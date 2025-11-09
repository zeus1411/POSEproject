import mongoose from 'mongoose';
import dotenv from 'dotenv';
import readline from 'readline';
import User from './models/User.js';

dotenv.config();

/**
 * MIGRATION SCRIPT - FIXED VERSION
 * 
 * Chuyển đổi từ:
 * defaultAddress: {
 *   fullName, phone, street, ward, district, city...
 * }
 * 
 * Sang:
 * fullName: "..." (root level)
 * phone: "..." (root level)
 * address: {
 *   street, ward, district, city... (không có fullName, phone)
 * }
 */

const askConfirmation = () => {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    console.log('\n⚠️  MIGRATION: Chuyển đổi User Address Structure');
    console.log('⚠️  Script sẽ:');
    console.log('   1. Chuyển fullName và phone từ defaultAddress lên root level');
    console.log('   2. Đổi tên defaultAddress → address');
    console.log('   3. Xóa fullName và phone khỏi address');
    console.log('⚠️  Vui lòng đảm bảo đã backup database trước khi chạy!\n');
    
    rl.question('⚠️  Bạn có chắc chắn muốn tiếp tục? (y/n) ', (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y');
    });
  });
};

const migrateUserAddresses = async () => {
  try {
    console.log('\n🔄 Đang bắt đầu quá trình migration...');
    
    // Xác nhận từ user
    const confirmed = await askConfirmation();
    if (!confirmed) {
      console.log('❌ Migration đã bị hủy bởi người dùng');
      process.exit(0);
    }

    console.log('🚀 Bắt đầu migration...');
    
    // Connect to MongoDB
    console.log('🔗 Đang kết nối đến MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DATABASE_NAME
    });
    console.log('✅ Đã kết nối MongoDB thành công');

    // Lấy tất cả users có defaultAddress
    console.log('🔍 Đang tìm kiếm users có defaultAddress...');
    
    // Lấy tất cả users, sort theo createdAt
    const allUsers = await User.find({ 
      defaultAddress: { $exists: true, $ne: null } 
    }).sort({ createdAt: 1 }); // Sort cũ nhất lên đầu

    console.log(`📊 Tìm thấy ${allUsers.length} users có defaultAddress`);
    
    // Bỏ qua 5 user đầu tiên (dữ liệu mẫu)
    const usersToMigrate = allUsers.slice(5);
    console.log(`📌 Bỏ qua ${allUsers.length - usersToMigrate.length} users đầu tiên (dữ liệu mẫu)`);
    console.log(`🎯 Sẽ migrate ${usersToMigrate.length} users`);

    if (usersToMigrate.length === 0) {
      console.log('✅ Không có users nào cần migrate');
      return;
    }

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (const user of usersToMigrate) {
      try {
        console.log(`\n🔄 Đang xử lý user: ${user.username} (${user._id})`);
        
        const { defaultAddress } = user;

        // Kiểm tra defaultAddress có tồn tại không (không check street vì có thể bị encoding)
        if (!defaultAddress) {
          console.log(`⚠️  User ${user.username} không có defaultAddress, bỏ qua`);
          continue;
        }
        
        // Debug: In ra defaultAddress
        console.log(`   📝 defaultAddress:`, JSON.stringify(defaultAddress, null, 2));

        // Chuẩn bị dữ liệu mới
        const updateData = {
          // Chuyển fullName, phone lên root level
          fullName: defaultAddress.fullName || user.username,
          phone: defaultAddress.phone || user.phone || '',
          
          // Chuyển address info vào nested object (KHÔNG có fullName, phone)
          address: {
            street: defaultAddress.street || '',
            ward: defaultAddress.ward || '',
            district: defaultAddress.district || '',
            city: defaultAddress.city || '',
            country: defaultAddress.country || 'Việt Nam',
            postalCode: defaultAddress.postalCode || '',
            wardCode: '',
            districtId: null,
            cityId: null,
            notes: ''
          }
        };

        console.log(`   ✓ fullName: ${updateData.fullName}`);
        console.log(`   ✓ phone: ${updateData.phone}`);
        console.log(`   ✓ address.street: ${updateData.address.street}`);
        console.log(`   ✓ address.city: ${updateData.address.city}`);

        // Update user với cấu trúc mới
        await User.updateOne(
          { _id: user._id },
          {
            $set: updateData,
            $unset: { defaultAddress: 1 } // Xóa field cũ
          }
        );

        console.log(`✅ Migrated user: ${user.username}`);
        successCount++;

      } catch (error) {
        console.error(`❌ Error migrating user ${user.username}:`, error.message);
        errorCount++;
        errors.push({
          username: user.username,
          error: error.message
        });
      }
    }

    // Hiển thị kết quả
    console.log('\n' + '='.repeat(50));
    console.log('📈 KẾT QUẢ MIGRATION:');
    console.log('='.repeat(50));
    console.log(`✅ Thành công: ${successCount}`);
    console.log(`❌ Thất bại: ${errorCount}`);
    console.log(`📊 Tổng số users: ${users.length}`);

    if (errors.length > 0) {
      console.log('\n⚠️  Chi tiết lỗi:');
      errors.forEach(err => {
        console.log(`   - ${err.username}: ${err.error}`);
      });
    }

    // Verify kết quả
    console.log('\n🔍 Đang kiểm tra kết quả...');
    const oldStructureCount = await User.countDocuments({ 
      defaultAddress: { $exists: true, $ne: null } 
    });
    const newStructureCount = await User.countDocuments({ 
      'address.street': { $exists: true } 
    });

    console.log(`📌 Số users còn lại có defaultAddress: ${oldStructureCount}`);
    console.log(`📌 Số users đã có address mới: ${newStructureCount}`);

    if (oldStructureCount === 0 && newStructureCount > 0) {
      console.log('\n🎉 MIGRATION HOÀN TẤT THÀNH CÔNG!');
      console.log('✅ Tất cả users đã được chuyển đổi sang cấu trúc mới');
      
      // Hiển thị một số user mẫu
      console.log('\n📝 Kiểm tra một số user mẫu:');
      const sampleUsers = await User.find({ 'address.street': { $exists: true } })
        .limit(3)
        .select('username fullName phone address');
      
      sampleUsers.forEach(user => {
        console.log(`\n   User: ${user.username}`);
        console.log(`   fullName: ${user.fullName}`);
        console.log(`   phone: ${user.phone}`);
        console.log(`   address: ${user.address.street}, ${user.address.ward}, ${user.address.city}`);
      });
    } else {
      console.log('\n⚠️  Migration chưa hoàn tất. Vui lòng kiểm tra lại.');
      if (oldStructureCount > 0) {
        console.log(`   Còn ${oldStructureCount} users chưa được migrate`);
      }
    }

  } catch (error) {
    console.error('\n❌ Migration thất bại:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Đã ngắt kết nối MongoDB');
    process.exit(0);
  }
};

// Chạy migration
migrateUserAddresses();