const mongoose = require('mongoose');
const { studentDB, facultyDB, adminDB } = require('./setup/db');
const Submission = require('./schemas/student/Submission');
const Assignment = require('./schemas/faculty/Assignment');

async function audit() {
    try {
        console.log("Checking Submissions...");
        const submissions = await Submission.find({});
        console.log(`Found ${submissions.length} submissions.`);

        for (const sub of submissions) {
            console.log(`Sub ID: ${sub._id}, Student: ${sub.studentId}, Assignment: ${sub.assignmentId}`);
            if (!sub.assignmentId) {
                console.error(`- MISSING ASSIGNMENT ID for ${sub._id}`);
            } else {
                const ass = await Assignment.findById(sub.assignmentId);
                if (!ass) {
                    console.error(`- ORPHANED SUBMISSION: Assignment ${sub.assignmentId} not found for sub ${sub._id}`);
                }
            }
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

setTimeout(audit, 2000); // Give DBs time to connect
