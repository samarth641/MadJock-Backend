// Quick check: show a sample of normalized users
import dotenv from "dotenv";
dotenv.config();
import { MongoClient } from "mongodb";
const client = new MongoClient(process.env.MONGO_URI || process.env.MONGODB_URI);
await client.connect();
const db = client.db();
const docs = await db.collection("users").find({}).limit(3).toArray();
docs.forEach(d => {
    console.log("---");
    console.log("_id:", d._id);
    console.log("name:", d.name);
    console.log("phone:", d.phone);
    console.log("phoneNumber:", d.phoneNumber, "(should be gone)");
    console.log("salesId:", d.salesId);
    console.log("salesPersonId:", d.salesPersonId, "(should be gone)");
    console.log("avatar:", d.avatar);
    console.log("bio:", d.bio);
    console.log("followers:", Array.isArray(d.followers) ? d.followers.length + " followers" : d.followers);
    console.log("role:", d.role);
    console.log("blocked:", d.blocked);
});
await client.close();
