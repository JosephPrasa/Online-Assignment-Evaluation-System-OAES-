const Activity = require('../schemas/admin/Activity');

/**
 * Log a system activity
 * @param {string} action - The action performed (e.g. 'New user registered')
 * @param {string} userName - Name of the user who performed the action
 * @param {string} target - Optional target of the action (e.g. name of new subject)
 */
const logActivity = async (action, userName, target = '') => {
    try {
        await Activity.create({
            action,
            user: userName,
            target,
            timestamp: new Date()
        });
        console.log(`Activity Logged: ${action} by ${userName}`);
    } catch (error) {
        console.error('Failed to log activity:', error);
    }
};

module.exports = logActivity;
