const Car = require('../models/Car');
const Expense = require('../models/Expense');

// @desc    Get all cars for a user
// @route   GET /api/cars
// @access  Private
const getCars = async (req, res) => {
    try {
        const cars = await Car.find({ user: req.user.id });

        // We can lean() and calculate total expenses if we want it here,
        // or aggregate if we expect many cars, but an aggregate is better for big data.
        // Let's do a simple aggregate to get total expenses for each car.

        const carsWithExpenses = await Promise.all(
            cars.map(async (car) => {
                const expenses = await Expense.aggregate([
                    { $match: { car: car._id } },
                    { $group: { _id: null, total: { $sum: '$price' } } }
                ]);

                return {
                    ...car._doc,
                    totalExpenses: expenses.length > 0 ? expenses[0].total : 0,
                };
            })
        );

        res.status(200).json(carsWithExpenses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get a specific car
// @route   GET /api/cars/:id
// @access  Private
const getCarById = async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);

        if (!car) {
            return res.status(404).json({ message: 'Car not found' });
        }

        if (car.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const expenses = await Expense.aggregate([
            { $match: { car: car._id } },
            { $group: { _id: null, total: { $sum: '$price' } } }
        ]);

        res.status(200).json({
            ...car._doc,
            totalExpenses: expenses.length > 0 ? expenses[0].total : 0,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a new car
// @route   POST /api/cars
// @access  Private
const createCar = async (req, res) => {
    try {
        const { make, model, year } = req.body;

        if (!make || !model || !year) {
            return res.status(400).json({ message: 'Please add all required fields' });
        }

        const car = await Car.create({
            make,
            model,
            year,
            user: req.user.id,
        });

        res.status(201).json(car);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update a car
// @route   PUT /api/cars/:id
// @access  Private
const updateCar = async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);

        if (!car) {
            return res.status(404).json({ message: 'Car not found' });
        }

        // Check for user
        if (!req.user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Make sure the logged in user matches the car user
        if (car.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        let updateData = { ...req.body };

        if (updateData.status === 'Sold' || car.status === 'Sold') {
            const expenses = await Expense.aggregate([
                { $match: { car: car._id } },
                { $group: { _id: null, total: { $sum: '$price' } } }
            ]);
            const totalInvested = expenses.length > 0 ? expenses[0].total : 0;
            const soldPrice = Number(updateData.soldPrice !== undefined ? updateData.soldPrice : car.soldPrice) || 0;
            updateData.profit = soldPrice - totalInvested;
        }

        const updatedCar = await Car.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
        });

        res.status(200).json(updatedCar);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a car
// @route   DELETE /api/cars/:id
// @access  Private
const deleteCar = async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);

        if (!car) {
            return res.status(404).json({ message: 'Car not found' });
        }

        // Check for user
        if (!req.user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Make sure the logged in user matches the car user
        if (car.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        await car.deleteOne();

        // Also delete expenses associated with this car
        await Expense.deleteMany({ car: req.params.id });

        res.status(200).json({ id: req.params.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getCars,
    getCarById,
    createCar,
    updateCar,
    deleteCar,
};
