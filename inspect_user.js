import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/madjock');
        const db = mongoose.connection.db;

        const targetId = 'TnQBzjZPXIhlMwYVGDp2bajSzev2';
        console.log(`Searching for user ${targetId} in usersInfo...`);

        const user = await db.collection('usersInfo').findOne({ _id: targetId });

        if (user) {
            console.log('User found:', JSON.stringify(user, null, 2));
        } else {
            console.log('User not found in usersInfo');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

run();
