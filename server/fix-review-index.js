import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env or .env.docker
dotenv.config({ path: join(__dirname, '.env') });
dotenv.config({ path: join(__dirname, '.env.docker') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://pose_mongodb:27017/AquaticStorePOSE';

async function fixIndex() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const reviews = db.collection('reviews');

    // Drop old index
    try {
      await reviews.dropIndex('productId_1_userId_1');
      console.log('✅ Dropped old index: productId_1_userId_1');
    } catch (e) {
      console.log('⚠️  Old index not found');
    }

    // Create new index
    await reviews.createIndex(
      { productId: 1, userId: 1, orderId: 1 },
      { unique: true }
    );
    console.log('✅ Created new index: productId_1_userId_1_orderId_1\n');
    console.log('💡 Now users can review same product in different orders!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

fixIndex();
