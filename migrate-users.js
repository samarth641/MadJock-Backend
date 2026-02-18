import dotenv from "dotenv";
dotenv.config();
import { MongoClient } from "mongodb";

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
if (!MONGO_URI) { console.error("No MONGO_URI in .env"); process.exit(1); }

const client = new MongoClient(MONGO_URI);
await client.connect();

const db = client.db(); // uses the DB from the connection string
const src = db.collection("usersInfo");
const dst = db.collection("users");

const before = await dst.countDocuments();
const docs = await src.find({}).toArray();
console.log(`usersInfo: ${docs.length} | users before: ${before}`);

// Get all existing _ids in users as strings
const existingRaw = await dst.find({}, { projection: { _id: 1 } }).toArray();
const existingIds = new Set(existingRaw.map(d => String(d._id)));
console.log(`Existing _ids in users: ${existingIds.size}`);
console.log("Existing _ids:", [...existingIds].join(", "));

let inserted = 0;
let merged = 0;
let errors = 0;

for (const doc of docs) {
    const idStr = String(doc._id);
    if (existingIds.has(idStr)) {
        // Merge missing fields
        const existing = await dst.findOne({ _id: doc._id });
        const { _id, ...fields } = doc;
        const setFields = {};
        for (const [k, v] of Object.entries(fields)) {
            if (existing[k] === undefined || existing[k] === null || existing[k] === "") {
                setFields[k] = v;
            }
        }
        if (Object.keys(setFields).length > 0) {
            await dst.updateOne({ _id }, { $set: setFields });
        }
        merged++;
    } else {
        try {
            await dst.insertOne(doc);
            inserted++;
        } catch (err) {
            console.log(`ERROR _id=${doc._id}: code=${err.code} msg=${err.message}`);
            errors++;
        }
    }
}

const after = await dst.countDocuments();
console.log(`\nInserted: ${inserted} | Merged: ${merged} | Errors: ${errors}`);
console.log(`users before: ${before} | users after: ${after}`);

await client.close();
