import mongoose from 'mongoose';
import dotenv from 'dotenv';
import AddBusiness from './models/AddBusiness.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

// List of IDs to check (includes the ones you reported)
const TARGET_IDS = [
    'tZZEefZcuZkua9bGBLy9',
    'tZZEefZccuZkua9bGBLy9',
    '698ebf1c30f3e739ac507bbe'
];

async function verify() {
    try {
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected!');

        for (const id of TARGET_IDS) {
            console.log(`\n--- Checking ID: ${id} ---`);

            let business = await AddBusiness.findById(id);
            if (business) {
                console.log('✅ Found by _id (ObjectId)!');
            } else {
                business = await AddBusiness.findOne({ _id: id });
                if (business) console.log('✅ Found by _id (String)!');
            }

            if (!business) {
                business = await AddBusiness.findOne({
                    $or: [
                        { "selectedApprovedBusiness.id": id },
                        { "selectedApprovedBusiness.generatedid": id },
                        { "selectedApprovedBusiness.userId": id }
                    ]
                });
                if (business) console.log('✅ Found in nested fields!');
            }

            if (business) {
                console.log('📄 Business Name:', business.selectedApprovedBusiness?.businessName);
            } else {
                console.log('❌ NOT FOUND');
            }
        }

        console.log('\n====================================');
        console.log('📊 DATABASE STATUS');
        const total = await AddBusiness.countDocuments({});
        const approved = await AddBusiness.countDocuments({ status: 'approved' });
        console.log(`Total businesses: ${total}`);
        console.log(`Approved businesses: ${approved}`);

        if (total > 0) {
            console.log('\n💡 SUGGESTION: Try these REAL IDs from your database:');
            const realOnes = await AddBusiness.find({}).limit(5);
            realOnes.forEach(b => {
                const bid = b._id;
                const genid = b.selectedApprovedBusiness?.generatedid || b.selectedApprovedBusiness?.id;
                console.log(`- Name: "${b.selectedApprovedBusiness?.businessName}"`);
                console.log(`  Use this URL: http://localhost:3000/businesses/${bid}`);
                if (genid) {
                    console.log(`  OR this URL:  http://localhost:3000/businesses/${genid}`);
                }
                console.log('');
            });
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        mongoose.connection.close();
    }
}

verify();
