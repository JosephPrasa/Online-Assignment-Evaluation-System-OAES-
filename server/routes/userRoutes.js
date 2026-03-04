const express = require('express');
const router = express.Router();
const { getUsers, addUser, deleteUser, updateUser } = require('../controllers/userController');
const { protect } = require('../security/authMiddleware');
const { authorize } = require('../security/roleMiddleware');

router.route('/')
    .get(protect, authorize('admin'), getUsers)
    .post(protect, authorize('admin'), addUser);

router.route('/:id')
    .put(protect, authorize('admin'), updateUser)
    .delete(protect, authorize('admin'), deleteUser);

module.exports = router;
