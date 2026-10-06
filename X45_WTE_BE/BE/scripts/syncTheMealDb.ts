import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function run() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('MONGO_URI is not defined in .env');
    process.exit(1);
  }

  console.log('Connecting to MongoDB...');
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB successfully.');

  // Ensure an admin user exists
  const usersCollection = mongoose.connection.collection('users');
  let adminUser = await usersCollection.findOne({ role: 'admin' });

  if (!adminUser) {
    // Check if thanquyen0000@gmail.com or any user exists to promote
    const firstUser = await usersCollection.findOne({});
    if (firstUser) {
      await usersCollection.updateOne({ _id: firstUser._id }, { $set: { role: 'admin' } });
      adminUser = await usersCollection.findOne({ _id: firstUser._id });
      console.log(`Promoted user ${adminUser?.email} to admin role.`);
    } else {
      console.log('No user found to assign dishes to, continuing with generated ID...');
    }
  }

  const { theMealDbService } = await import('../src/services/themealdb.service');
  console.log('Starting TheMealDB Vietnamese recipes sync...');
  const result = await theMealDbService.syncVietnameseMeals(adminUser?._id?.toString());

  console.log('================ SYNC RESULTS ================');
  console.log(`Total Vietnamese meals found: ${result.totalFound}`);
  console.log(`Dishes upserted in DB:       ${result.dishesUpserted}`);
  console.log(`New ingredients created:     ${result.ingredientsUpserted}`);
  if (result.errors.length > 0) {
    console.log(`Errors encountered (${result.errors.length}):`);
    result.errors.forEach((e) => console.error(' - ', e));
  }
  console.log('==============================================');

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB. Sync complete!');
}

run().catch((err) => {
  console.error('Fatal error during TheMealDB sync:', err);
  process.exit(1);
});
