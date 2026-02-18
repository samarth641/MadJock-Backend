import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const migrate = async () => {
    try {
        console.log('🚀 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected.');

        // 1. Find all users who have profileImageUrl but NO avatar (or empty avatar)
        const usersToMigrate = await User.find({
            $or: [
                { avatar: { $exists: false } },
                { avatar: "" },
                { avatar: null }
            ],
            profileImageUrl: { $exists: true, $ne: "" }
        });

        console.log(`🔍 Found ${usersToMigrate.length} users needing avatar sync.`);

        let count = 0;
        for (const user of usersToMigrate) {
            user.avatar = user.profileImageUrl;
            // No need to manually remove profileImageUrl if strict: true, 
            // but we can use $unset to be sure the DB is clean
            await user.save();
            count++;
        }

        console.log(`✅ Synced ${count} users.`);

        // 2. Optional: Global cleanup of profileImageUrl field for ALL users
        console.log('🧹 Cleaning up redundant profileImageUrl fields...');
        const result = await User.updateMany(
            { profileImageUrl: { $exists: true } },
            { $unset: { profileImageUrl: "" } }
        );
        console.log(`✅ Cleanup complete. Modified ${result.modifiedCount} documents.`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
};

migrate();
