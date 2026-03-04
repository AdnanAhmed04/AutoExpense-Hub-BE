const mongoose = require('mongoose');

const carSchema = new mongoose.Schema(
    {
        make: {
            type: String,
            required: true,
        },
        model: {
            type: String,
            required: true,
        },
        year: {
            type: Number,
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        status: {
            type: String,
            enum: ['Available', 'Sold'],
            default: 'Available'
        },
        soldPrice: {
            type: Number,
            default: 0
        },
        profit: {
            type: Number,
            default: 0
        },
        saleDocumentUrl: {
            type: String
        },
        purchaseDocumentUrl: {
            type: String
        }
    },
    {
        timestamps: true,
    }
);

// We can add a virtual field for totalExpenses if needed, 
// but it's often more efficient to calculate it via aggregation when fetching.

const Car = mongoose.model('Car', carSchema);
module.exports = Car;
