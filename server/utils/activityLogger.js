const Activity = require('../schemas/admin/Activity');
const { getIO } = require('../setup/socket');

/**
 * Log a system activity
 * @param {string} action - The action performed (e.g. 'New user registered')
 * @param {string} userName - Name of the user who performed the action
 * @param {string} target - Optional target of the action (e.g. name of new subject)
 */
const logActivity = async (action, userName, target = '') => {
    try {
        const activity = await Activity.create({
            action: action || 'Action',
            user: userName || 'Admin',
            target: target || '',
            timestamp: new Date()
        });

        // Emit global activity event for real-time dashboard updates
        getIO().emit('activity_logged', activity);

        console.log(`Activity Logged: ${action} by ${userName}`);
    } catch (error) {
        console.error('Failed to log activity:', error);
    }
};

module.exports = logActivity;
