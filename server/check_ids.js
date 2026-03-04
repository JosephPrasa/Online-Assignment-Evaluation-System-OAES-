const mongoose = require('mongoose');
const { studentDB, facultyDB, adminDB } = require('./setup/db');
const Submission = require('./schemas/student/Submission');
const StudentProfile = require('./schemas/student/StudentProfile');

async function check() {
    try {
        const students = await StudentProfile.find({});
        console.log(`Checking ${students.length} students.`);

        for (const s of students) {
            const subs = await Submission.find({ studentId: s._id });
            const subsString = await Submission.find({ studentId: s._id.toString() });
            console.log(`Student: ${s.name} (${s._id}) - Subs(Obj): ${subs.length}, Subs(Str): ${subsString.length}`);

            if (subs.length === 0 && subsString.length > 0) {
                console.warn(`!!! POTENTIAL MISMATCH for ${s.name}: Submissions exist but only match via String!`);
            }
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

setTimeout(check, 2000);
