const express = require('express');
const router = express.Router();
const {
    updateExpense,
    deleteExpense,
} = require('../controllers/expenseController');
const { protect } = require('../middleware/authMiddleware');

router.route('/:id').put(protect, updateExpense).delete(protect, deleteExpense);

module.exports = router;
