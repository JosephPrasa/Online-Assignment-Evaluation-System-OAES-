const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const { adminDB, facultyDB, studentDB } = require('../setup/db');
const Admin = require('../schemas/admin/Admin');

const FacultyProfile = require('../schemas/faculty/FacultyProfile');
const StudentProfile = require('../schemas/student/StudentProfile');

const resetPasswords = async () => {
    console.log('Resetting passwords to "123456"...');

    const waitForConnection = (name, conn) => {
        return new Promise((resolve, reject) => {
            if (conn.readyState === 1) {
                console.log(`[${name}] Already connected.`);
                resolve();
            } else {
                conn.once('connected', () => {
                    console.log(`[${name}] Connected.`);
                    resolve();
                });
                conn.once('error', (err) => {
                    console.error(`[${name}] Connection error:`, err);
                    reject(err);
                });
            }
        });
    };

    try {
        await Promise.all([
            waitForConnection('AdminDB', adminDB),
            waitForConnection('FacultyDB', facultyDB),
            waitForConnection('StudentDB', studentDB)
        ]);

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('123456', salt);

        // 1. Admin
        const admin = await Admin.findOne({ email: 'admin@oaes.com' });
        if (admin) {
            admin.passwordHash = hashedPassword;
            await admin.save();
            console.log('[AdminDB] Updated admin password.');
        } else {
            console.log('[AdminDB] Admin not found, creating...');
            await Admin.create({
                username: 'superadmin',
                email: 'admin@oaes.com',
                passwordHash: hashedPassword,
                role: 'admin'
            });
            console.log('[AdminDB] Created admin.');
        }

        // 2. Faculty
        const faculty = await FacultyProfile.findOne({ email: 'faculty@oaes.com' });
        if (faculty) {
            faculty.passwordHash = hashedPassword;
            await faculty.save();
            console.log('[FacultyDB] Updated faculty password.');
        } else {
            // We need a department ID for faculty
            const Department = require('../schemas/admin/Department');
            let dept = await Department.findOne({ code: 'CSE' });
            if (!dept) {
                dept = await Department.create({ name: 'Computer Science', code: 'CSE' });
            }

            await FacultyProfile.create({
                name: 'Dr. John Doe',
                email: 'faculty@oaes.com',
                passwordHash: hashedPassword,
                designation: 'Professor',
                departmentId: dept._id
            });
            console.log('[FacultyDB] Created faculty.');
        }

        // 3. Student
        const student = await StudentProfile.findOne({ email: 'student@oaes.com' });
        if (student) {
            student.passwordHash = hashedPassword;
            await student.save();
            console.log('[StudentDB] Updated student password.');
        } else {
            const Department = require('../schemas/admin/Department');
            let dept = await Department.findOne({ code: 'CSE' });

            await StudentProfile.create({
                name: 'Jane Doe',
                email: 'student@oaes.com',
                passwordHash: hashedPassword,
                enrollmentNumber: 'CSE2024001',
                departmentId: dept._id,
                semester: 1
            });
            console.log('[StudentDB] Created student.');
        }

        console.log('SUCCESS: Passwords reset to "123456".');

    } catch (error) {
        console.error('Reset failed:', error);
    }

    process.exit(0);
};

resetPasswords();
