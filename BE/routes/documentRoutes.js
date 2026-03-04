const express = require('express');
const router = express.Router();
const { upload, cloudinary } = require('../config/cloudinary');
const { protect } = require('../middleware/authMiddleware');
const Car = require('../models/Car');
const https = require('https');

// @desc    Upload document for car (sale or purchase)
// @route   POST /api/documents/:carId/:type
// @access  Private
router.post('/:carId/:type', protect, (req, res, next) => {
    upload.single('document')(req, res, (err) => {
        if (err) {
            console.error("Cloudinary/Multer Error:", err);
            return res.status(500).json({ message: 'Upload failed', details: err.message || JSON.stringify(err) });
        }
        next();
    });
}, async (req, res) => {
    try {
        const carId = req.params.carId;
        const type = req.params.type; // 'sale' or 'purchase'

        if (!['sale', 'purchase'].includes(type)) {
            return res.status(400).json({ message: 'Invalid document type. Must be sale or purchase.' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const car = await Car.findById(carId);
        if (!car) {
            return res.status(404).json({ message: 'Car not found' });
        }

        if (car.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Cloudinary handles PDF viewing perfectly fine by default on most modern browsers.
        // If it attempts to download instead of inline view, checking the default behavior 
        // without URL injections is the safest and most standard route!
        let docUrl = req.file.path;

        if (type === 'sale') {
            car.saleDocumentUrl = docUrl;
        } else {
            car.purchaseDocumentUrl = docUrl;
        }

        await car.save();

        res.status(200).json({ url: docUrl, car });
    } catch (error) {
        console.error("Route Error:", error);
        res.status(500).json({ message: 'Server error during upload', details: error.message });
    }
});

// @desc    View/Stream a document bypassing Cloudinary PDF restrictions
// @route   GET /api/documents/view/:carId/:type
// @access  Public (for sharing via WhatsApp or Google Viewers)
router.get('/view/:carId/:type', async (req, res) => {
    try {
        const { carId, type } = req.params;

        if (!['sale', 'purchase'].includes(type)) {
            return res.status(400).send('Invalid document type');
        }

        const car = await Car.findById(carId);
        if (!car) {
            return res.status(404).send('Car not found');
        }

        const docUrl = type === 'sale' ? car.saleDocumentUrl : car.purchaseDocumentUrl;

        if (!docUrl) {
            return res.status(404).send('Document not found');
        }

        // Fetch the file as a stream through our backend to bypass strict public Cloudinary rules
        https.get(docUrl, (proxyRes) => {
            if (proxyRes.statusCode !== 200) {
                return res.status(proxyRes.statusCode).send('Failed to fetch document from cloud storage');
            }

            // Set headers to display the PDF inline within the browser wrapper
            res.setHeader('Content-Type', proxyRes.headers['content-type'] || 'application/pdf');
            res.setHeader('Content-Disposition', 'inline; filename="document.pdf"');

            // Pipe the Cloudinary data stream directly to the client's browser
            proxyRes.pipe(res);
        }).on('error', (e) => {
            console.error("Fetch Proxy Error:", e);
            res.status(500).send('Error securely retrieving the document.');
        });

    } catch (error) {
        console.error('View Document Error:', error);
        res.status(500).send('Server error');
    }
});

// @desc    Delete a document for a car
// @route   DELETE /api/documents/:carId/:type
// @access  Private
router.delete('/:carId/:type', protect, async (req, res) => {
    try {
        const carId = req.params.carId;
        const type = req.params.type;

        if (!['sale', 'purchase'].includes(type)) {
            return res.status(400).json({ message: 'Invalid document type. Must be sale or purchase.' });
        }

        const car = await Car.findById(carId);
        if (!car) {
            return res.status(404).json({ message: 'Car not found' });
        }

        if (car.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Technically we should delete from Cloudinary here too, but for simplicity we just remove from DB
        if (type === 'sale') {
            car.saleDocumentUrl = '';
        } else {
            car.purchaseDocumentUrl = '';
        }

        await car.save();

        res.status(200).json({ message: 'Document removed', car });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
