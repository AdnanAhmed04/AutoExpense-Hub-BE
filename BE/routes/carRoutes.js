const express = require('express');
const router = express.Router();
const {
    getCars,
    getCarById,
    createCar,
    updateCar,
    deleteCar,
} = require('../controllers/carController');
const { protect } = require('../middleware/authMiddleware');

const expenseRouter = require('./expenseRoutes');

router.use('/:carId/expenses', expenseRouter);

router.route('/').get(protect, getCars).post(protect, createCar);
router.route('/:id').get(protect, getCarById).put(protect, updateCar).delete(protect, deleteCar);

module.exports = router;
