import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const MJ_URI = process.env.MONGO_URI;

async function checkData() {
    try {
        await mongoose.connect(MJ_URI);
        console.log('CONNECTED TO MONGO');

        const db = mongoose.connection.db;
        const posts = await db.collection('communityposts').find().sort({ createdAt: -1 }).limit(3).toArray();

        console.log('--- RECENT POSTS ---');
        console.log(JSON.stringify(posts, null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkData();
