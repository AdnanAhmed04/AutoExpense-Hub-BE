const express = require('express');
const router = express.Router();
const { uploadMemory, uploadBufferToCloudinary, cloudinary } = require('../config/cloudinary');
const { protect } = require('../middleware/authMiddleware');
const Car = require('../models/Car');

// @desc    Upload one or more gallery images for a car
// @route   POST /api/gallery/:carId
// @access  Private
router.post('/:carId', protect, (req, res, next) => {
    uploadMemory.array('images', 10)(req, res, (err) => {
        if (err) {
            console.error('Multer Error:', err);
            return res.status(500).json({ message: 'Upload failed', details: err.message || JSON.stringify(err) });
        }
        next();
    });
}, async (req, res) => {
    try {
        const { carId } = req.params;

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No images uploaded' });
        }

        const car = await Car.findById(carId);
        if (!car) {
            return res.status(404).json({ message: 'Car not found' });
        }

        if (car.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Upload each buffer to Cloudinary (sequentially for reliability)
        const newImages = [];
        for (const file of req.files) {
            const result = await uploadBufferToCloudinary(file.buffer);
            newImages.push({ url: result.secure_url, publicId: result.public_id });
        }

        car.gallery.push(...newImages);
        await car.save();

        res.status(200).json({ gallery: car.gallery, car });
    } catch (error) {
        console.error('Gallery Upload Error:', error);
        res.status(500).json({ message: 'Server error during upload', details: error.message });
    }
});

// @desc    Delete a single gallery image for a car
// @route   DELETE /api/gallery/:carId/:imageId
// @access  Private
router.delete('/:carId/:imageId', protect, async (req, res) => {
    try {
        const { carId, imageId } = req.params;

        const car = await Car.findById(carId);
        if (!car) {
            return res.status(404).json({ message: 'Car not found' });
        }

        if (car.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const image = car.gallery.id(imageId);
        if (!image) {
            return res.status(404).json({ message: 'Image not found' });
        }

        // Attempt to remove from Cloudinary (best effort)
        if (image.publicId) {
            try {
                await cloudinary.uploader.destroy(image.publicId);
            } catch (err) {
                console.error('Cloudinary destroy error:', err.message);
            }
        }

        image.deleteOne();
        await car.save();

        res.status(200).json({ gallery: car.gallery, car });
    } catch (error) {
        console.error('Gallery Delete Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
