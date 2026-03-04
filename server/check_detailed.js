const mongoose = require('mongoose');
const { studentDB, facultyDB, adminDB } = require('./setup/db');
const Submission = require('./schemas/student/Submission');
const StudentProfile = require('./schemas/student/StudentProfile');

async function check() {
    try {
        const student = await StudentProfile.findOne({}); // Just check any student
        if (!student) {
            console.log("No students found.");
            process.exit(0);
        }
        console.log(`Checking student: ${student.name} (${student._id})`);

        const allSubs = await Submission.find({});
        console.log(`Total submissions in DB: ${allSubs.length}`);

        for (const s of allSubs) {
            console.log(`- Sub ID: ${s._id}, StudentId in Sub: ${s.studentId} (${typeof s.studentId})`);
            const matchObj = s.studentId.toString() === student._id.toString();
            console.log(`  Match with ${student.name}? ${matchObj}`);
        }

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

setTimeout(check, 2000);
