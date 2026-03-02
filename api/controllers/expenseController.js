const Expense = require('../models/Expense');
const Car = require('../models/Car');

// @desc    Get expenses for a car
// @route   GET /api/cars/:carId/expenses
// @access  Private
const getExpenses = async (req, res) => {
    try {
        const carId = req.params.carId;

        // Check if car exists and belongs to user
        const car = await Car.findById(carId);

        if (!car) {
            return res.status(404).json({ message: 'Car not found' });
        }

        if (car.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        const expenses = await Expense.find({ car: carId }).sort({ createdAt: -1 });

        res.status(200).json(expenses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Add a new expense
// @route   POST /api/cars/:carId/expenses
// @access  Private
const createExpense = async (req, res) => {
    try {
        const { title, description, price, type, image } = req.body;
        const carId = req.params.carId;

        if (!title) {
            return res.status(400).json({ message: 'Please add a title' });
        }

        // Check if car exists and belongs to user
        const car = await Car.findById(carId);

        if (!car) {
            return res.status(404).json({ message: 'Car not found' });
        }

        if (car.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        const expense = await Expense.create({
            title,
            description,
            price: price || 0,
            type: type || 'Other',
            image,
            car: carId,
            user: req.user.id,
        });

        res.status(201).json(expense);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update an expense
// @route   PUT /api/expenses/:id
// @access  Private
const updateExpense = async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);

        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        // Check for user
        if (!req.user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Make sure the logged in user matches the expense user
        if (expense.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        const updatedExpense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });

        res.status(200).json(updatedExpense);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);

        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        // Check for user
        if (!req.user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Make sure the logged in user matches the expense user
        if (expense.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        await expense.deleteOne();

        res.status(200).json({ id: req.params.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
};
