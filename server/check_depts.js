const mongoose = require('mongoose');
require('dotenv').config();
const { adminDB } = require('./setup/db');
const Department = require('./schemas/admin/Department');

async function checkDepartments() {
    try {
        await new Promise(resolve => setTimeout(resolve, 3000));

        const count = await Department.countDocuments();
        console.log('Department count:', count);

        if (count > 0) {
            const depts = await Department.find({});
            console.log('Departments:', depts);
        } else {
            console.log('No departments found. Creating default departments...');
            await Department.create([
                { name: 'Computer Science', code: 'CS' },
                { name: 'Electronics', code: 'ECE' },
                { name: 'Mechanical', code: 'ME' }
            ]);
            console.log('Default departments created.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkDepartments();
