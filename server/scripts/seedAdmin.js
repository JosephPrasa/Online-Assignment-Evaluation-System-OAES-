const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');

        let admin = await User.findOne({ role: 'admin' });

        if (admin) {
            console.log('Updating existing admin user...');
            admin.name = 'Admin';
            admin.email = 'admin@gmail.com';
            admin.password = '123';
            await admin.save();
        } else {
            console.log('Creating new admin user...');
            admin = await User.create({
                name: 'Admin',
                email: 'admin@gmail.com',
                password: '123',
                role: 'admin'
            });
        }

        console.log('Admin user created successfully!');
        console.log('Email: admin@gmail.com');
        console.log('Password: 123');
        process.exit();
    } catch (error) {
        console.error('Error seeding admin:', error.message);
        process.exit(1);
    }
};

seedAdmin();
