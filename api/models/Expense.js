const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        price: {
            type: Number,
            default: 0,
        },
        type: {
            type: String,
            required: true,
            enum: ['Car purchase', 'Paint work', 'Repairs', 'Maintenance', 'Fuel', 'Other'],
            default: 'Other',
        },
        image: {
            type: String, // URL of the image
        },
        car: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Car',
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        }
    },
    {
        timestamps: true,
    }
);

const Expense = mongoose.model('Expense', expenseSchema);
module.exports = Expense;
