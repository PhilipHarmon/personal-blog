require('dotenv').config();

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Post = require('./models/Post');

// Seeds the admin user and a welcome post. Idempotent — safe to run repeatedly.
async function seed() {
  const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env');
    process.exit(1);
  }

  await connectDB();

  // Upsert the admin user: create if missing, otherwise refresh credentials/role.
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  const admin = await User.findOneAndUpdate(
    { email: adminEmail },
    { $set: { name: 'Philip', email: adminEmail, passwordHash, role: 'admin' } },
    { new: true, upsert: true },
  );
  console.log(`Admin user ready: ${admin.email} (role: ${admin.role})`);

  // Create a welcome post by the admin if the blog has no posts yet.
  const postCount = await Post.countDocuments({});
  if (postCount === 0) {
    await Post.create({
      title: 'Welcome to the blog',
      slug: 'welcome-to-the-blog',
      content:
        '# Welcome\n\nThis is the first post on the blog. More writing coming soon — stay tuned.',
      excerpt: 'The very first post on the blog.',
      tags: ['welcome'],
      coverImage: '',
      author: admin._id,
      published: true,
      publishedAt: new Date(),
    });
    console.log('Created welcome post (slug: welcome-to-the-blog)');
  } else {
    console.log(`Skipped welcome post — ${postCount} post(s) already exist`);
  }

  console.log('Seed complete.');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
