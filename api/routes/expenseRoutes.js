const express = require('express');
const router = express.Router({ mergeParams: true });
const {
    getExpenses,
    createExpense,
} = require('../controllers/expenseController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getExpenses).post(protect, createExpense);

module.exports = router;
