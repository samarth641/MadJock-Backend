/**
 * NORMALIZATION SCRIPT
 * Runs on the `users` collection and:
 * 1. Renames legacy field aliases to canonical names:
 *    - phoneNumber  → phone
 *    - salesPersonId → salesId
 *    - profileImageUrl → avatar (copy only, keep original for community compat)
 * 2. Ensures every document has all standard fields (sets empty defaults if missing)
 */

import dotenv from "dotenv";
dotenv.config();
import { MongoClient } from "mongodb";

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
if (!MONGO_URI) { console.error("No MONGO_URI in .env"); process.exit(1); }

// All standard fields every user document should have
// NOTE: phone and salesId use null (not "") because they have unique sparse indexes
//       — sparse indexes ignore null values, allowing multiple docs without a phone.
const DEFAULT_FIELDS = {
    // phone is intentionally omitted here — handled separately below
    email: "",
    name: "",
    avatar: "",
    bio: "",
    location: "",
    gender: "",
    dob: "",
    role: "user",
    approved: false,
    blocked: false,
    emailVerified: false,
    phoneVerified: false,
    // salesId is intentionally omitted here — handled separately below
    referralCode: "",
    followers: [],
    following: [],
    education: { tenth: "", twelfth: "", ug: "", pg: "" },
    experiences: [],
};

const client = new MongoClient(MONGO_URI);
await client.connect();
const db = client.db();
const col = db.collection("users");

const docs = await col.find({}).toArray();
console.log(`Processing ${docs.length} documents in users...\n`);

let normalized = 0;
let unchanged = 0;

for (const doc of docs) {
    const update = { $set: {}, $unset: {} };
    let hasChanges = false;

    // ── 1. RENAME ALIASES ──────────────────────────────────────────────────────

    // phoneNumber → phone
    if (doc.phoneNumber && !doc.phone) {
        update.$set.phone = doc.phoneNumber;
        update.$unset.phoneNumber = "";
        hasChanges = true;
    } else if (doc.phoneNumber && doc.phone) {
        // Both exist — keep phone, remove phoneNumber
        update.$unset.phoneNumber = "";
        hasChanges = true;
    }

    // salesPersonId → salesId
    if (doc.salesPersonId && !doc.salesId) {
        update.$set.salesId = doc.salesPersonId;
        update.$unset.salesPersonId = "";
        hasChanges = true;
    } else if (doc.salesPersonId) {
        update.$unset.salesPersonId = "";
        hasChanges = true;
    }

    // profileImageUrl → avatar (copy value if avatar is missing)
    if (doc.profileImageUrl && !doc.avatar) {
        update.$set.avatar = doc.profileImageUrl;
        hasChanges = true;
    }

    // ── 2. ENSURE ALL STANDARD FIELDS EXIST ───────────────────────────────────
    for (const [field, defaultValue] of Object.entries(DEFAULT_FIELDS)) {
        if (doc[field] === undefined || doc[field] === null) {
            // Skip salesId — null is valid (sparse index)
            if (field === "salesId") continue;
            update.$set[field] = defaultValue;
            hasChanges = true;
        }
    }

    // ── 3. APPLY UPDATE ────────────────────────────────────────────────────────
    if (hasChanges) {
        // Clean up empty $unset if nothing to unset
        if (Object.keys(update.$unset).length === 0) delete update.$unset;
        if (Object.keys(update.$set).length === 0) delete update.$set;

        await col.updateOne({ _id: doc._id }, update);
        console.log(`  NORMALIZED _id=${doc._id} (${doc.name || "no name"})`);
        normalized++;
    } else {
        unchanged++;
    }
}

console.log(`\n--- DONE ---`);
console.log(`Normalized: ${normalized} | Unchanged: ${unchanged}`);
console.log(`Total: ${docs.length}`);

await client.close();
