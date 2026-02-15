import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

async function cleanupIndexes() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        const db = mongoose.connection.db;
        const collection = db.collection("users");

        // List current indexes
        const indexes = await collection.indexes();
        console.log("📊 Current indexes in 'users' collection:");
        indexes.forEach((idx) => console.log(` - ${idx.name}: ${JSON.stringify(idx.key)}`));

        const indexesToDrop = ["salesPersonId_1", "salesId_1", "salesId"];

        for (const id of indexesToDrop) {
            if (indexes.find((idx) => idx.name === id)) {
                console.log(`🗑️ Dropping '${id}' index...`);
                await collection.dropIndex(id);
                console.log(`✅ '${id}' dropped successfully.`);
            } else {
                console.log(`ℹ️ '${id}' index not found.`);
            }
        }

        // 🔥 CRITICAL: Unset ALL 'null' salesId values to fix the sparse index conflict
        console.log("🧹 Cleaning up 'null' values from 'salesId' and 'salesPersonId'...");
        await collection.updateMany({ salesId: null }, { $unset: { salesId: "" } });
        await collection.updateMany({ salesPersonId: null }, { $unset: { salesPersonId: "" } });
        console.log("✅ Null values unset.");

        console.log("✨ All done!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Cleanup failed:", error);
        process.exit(1);
    }
}

cleanupIndexes();
