import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function checkIds() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const db = mongoose.connection.db;
        const categories = await db.collection('add-category').find({}).toArray();

        console.log('Total categories:', categories.length);
        categories.forEach(cat => {
            console.log(`Name: ${cat.name}, ID: ${cat._id}, Type: ${typeof cat._id}`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkIds();
