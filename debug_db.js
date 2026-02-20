import mongoose from 'mongoose';

const MONGO_URI = "mongodb+srv://mjsales:mjsales@mjsales.2p01zix.mongodb.net/madjock";

async function debug() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to DB");

        const db = mongoose.connection.db;
        const collection = db.collection('add-category');

        const categories = await collection.find({}).toArray();
        console.log(`Found ${categories.length} categories`);

        categories.slice(0, 5).forEach(cat => {
            console.log(`ID: ${cat._id} (Type: ${typeof cat._id}), Name: ${cat.name}`);
        });

        // Specifically check for the problematic ID
        const targetId = "6996e19082ad6a9ff73d2a7c";
        const foundStr = await collection.findOne({ _id: targetId });
        console.log(`Search by string "${targetId}": ${foundStr ? "Found" : "Not Found"}`);

        if (mongoose.Types.ObjectId.isValid(targetId)) {
            const foundObj = await collection.findOne({ _id: new mongoose.Types.ObjectId(targetId) });
            console.log(`Search by ObjectId "${targetId}": ${foundObj ? "Found" : "Not Found"}`);
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debug();
