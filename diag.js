import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/madjock');
    const db = mongoose.connection.db;

    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));

    const targetId = 'TnQBzjZPXIhlMwYVGDp2bajSzev2';
    const currentUserId = '6991263ff565c790764f82fa';

    for (const collName of ['users', 'usersInfo']) {
        console.log(`\nChecking collection: ${collName}`);
        const coll = db.collection(collName);

        const userByString = await coll.findOne({ _id: targetId });
        console.log(`  - Find ${targetId} as string:`, userByString ? 'FOUND' : 'NOT FOUND');

        try {
            const userByObj = await coll.findOne({ _id: new mongoose.Types.ObjectId(currentUserId) });
            console.log(`  - Find ${currentUserId} as ObjectId:`, userByObj ? 'FOUND' : 'NOT FOUND');
        } catch (e) {
            console.log(`  - ${currentUserId} is not a valid ObjectId`);
        }

        const userByStringId = await coll.findOne({ _id: currentUserId });
        console.log(`  - Find ${currentUserId} as string:`, userByStringId ? 'FOUND' : 'NOT FOUND');
    }

    process.exit(0);
};

run();
