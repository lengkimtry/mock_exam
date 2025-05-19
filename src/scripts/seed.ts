import { MongoClient } from 'mongodb';

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/mock-exam-db';
const client = new MongoClient(uri);

async function seedDatabase() {
  try {
    await client.connect();
    const db = client.db();
    const usersCollection = db.collection('users');

    // Insert a test user
    const testUser = {
      username: 'johndoe',
      email: 'johndoe@example.com',
      password: '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Zf5lN9E8K9XH2J5nY1W2K', // bcrypt hash for 'StrongPassword123!'
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const existingUser = await usersCollection.findOne({ username: testUser.username });
    if (!existingUser) {
      await usersCollection.insertOne(testUser);
      console.log('Test user inserted successfully.');
    } else {
      console.log('Test user already exists.');
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await client.close();
  }
}

seedDatabase();
