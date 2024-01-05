const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const Booking = require('../models/Booking');
const User = require('../models/User');

//Middleware to protect routes
//router.use(auth);
router.get('/unique-doctors', async (req, res) => {
    try {
        const uniqueDoctors = await Booking.distinct('Username_doctor');
        res.status(200).json(uniqueDoctors.length); // Sending the fetched data in the response
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error' });
    }
});

router.get('/bookings-by-doctor', async (req, res) => {
    try {
        const bookingsByDoctor = await Booking.aggregate([
            { $unwind: '$bookedServicesData' },
            { $group: { _id: '$Username_doctor', count: { $sum: 1 } } },
        ]);
        res.status(200).json(bookingsByDoctor); // Sending the fetched data in the response
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error' });
    }
});


router.get('/total-earnings-all-doctors', async (req, res) => {
    try {
        const totalEarningsAllDoctors = await Booking.aggregate([
            { $unwind: '$bookedServicesData' },
            {
                $group: {
                    _id: null,
                    totalEarnings: {
                        $sum: {
                            $cond: [
                                { $eq: ['$bookedServicesData.isPaymentSuccessful', true] },
                                '$bookedServicesData.amount',
                                0,
                            ],
                        },
                    },
                },
            },
        ]);
        // Send the total earnings as a response
        res.status(200).json( totalEarningsAllDoctors[0]?.totalEarnings || 0);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error' });
    }
});


router.get('/total-earnings-by-doctor', async (req, res) => {
    try {
        const totalEarningsByDoctor = await Booking.aggregate([
            { $unwind: '$bookedServicesData' },
            {
                $group: {
                    _id: '$Username_doctor',
                    totalEarnings: {
                        $sum: {
                            $cond: [
                                { $eq: ['$bookedServicesData.isPaymentSuccessful', true] },
                                '$bookedServicesData.amount',
                                0,
                            ],
                        },
                    },
                },
            },
        ]);

        res.status(200).json(totalEarningsByDoctor);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error' });
    }
});

router.get('/top-earning-doctors', async (req, res) => {
    try {
        const topEarningDoctors = await Booking.aggregate([
            { $unwind: '$bookedServicesData' },
            {
                $group: {
                    _id: '$Username_doctor',
                    totalEarnings: {
                        $sum: {
                            $cond: [
                                { $eq: ['$bookedServicesData.isPaymentSuccessful', true] },
                                '$bookedServicesData.amount',
                                0,
                            ],
                        },
                    },
                },
            },
            { $sort: { totalEarnings: -1 } },
            { $limit: 10 },
        ]);

        res.status(200).json(topEarningDoctors);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error' });
    }
});

router.get('/service-categories-by-doctor', async (req, res) => {
    try {
        const serviceCategoriesByDoctor = await Booking.aggregate([
            { $unwind: '$bookedServicesData' },
            {
                $group: {
                    _id: {
                        doctor: '$Username_doctor',
                        serviceCategory: '$bookedServicesData.serviceCategory',
                    },
                    count: { $sum: 1 },
                },
            },
            {
                $group: {
                    _id: '$_id.doctor',
                    serviceCategories: {
                        $push: {
                            serviceCategory: '$_id.serviceCategory',
                            count: '$count',
                        },
                    },
                },
            },
        ]);

        res.status(200).json(serviceCategoriesByDoctor);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error' });
    }
});


router.get('/earnings-by-service-category-by-doctor', async (req, res) => {
    try {
        const earningsByServiceCategoryByDoctor = await Booking.aggregate([
            { $unwind: '$bookedServicesData' },
            {
                $group: {
                    _id: {
                        doctor: '$Username_doctor',
                        serviceCategory: '$bookedServicesData.serviceCategory',
                    },
                    totalEarnings: {
                        $sum: {
                            $cond: [
                                { $eq: ['$bookedServicesData.isPaymentSuccessful', true] },
                                '$bookedServicesData.amount',
                                0,
                            ],
                        },
                    },
                },
            },
            {
                $group: {
                    _id: '$_id.doctor',
                    earningsByServiceCategory: {
                        $push: {
                            serviceCategory: '$_id.serviceCategory',
                            totalEarnings: '$totalEarnings',
                        },
                    },
                },
            },
        ]);

        res.status(200).json(earningsByServiceCategoryByDoctor);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error' });
    }
});

// Assuming you have a Booking model imported from Mongoose

router.get('/bookings', async (req, res) => {
    try {
        const {
            doctorName,
            customerName,
            startTime,
            endTime,
            duration,
            phoneNumber,
            earnings
        } = req.query;

        const filters = {};

        if (doctorName) filters.Username_doctor = doctorName;
        if (customerName) {
            const regex = new RegExp(escapeRegex(customerName), 'i');
            filters['bookedServicesData.customerName'] = { $regex: regex };
        }
        if (startTime) filters['bookedServicesData.meetingStartTime'] = { $gte: startTime };
        if (endTime) filters['bookedServicesData.meetingEndTime'] = { $lte: endTime };
        // Implementing duration logic based on your schema structure
        if (duration) {
            // Implement the logic to calculate duration and filter accordingly
        }
        if (phoneNumber) filters['bookedServicesData.customerPhoneNumber'] = phoneNumber;
        if (earnings) filters['bookedServicesData.amount'] = earnings;

        const projection = {
            Username_doctor: 1,
            'bookedServicesData.customerName': 1,
            'bookedServicesData.meetingStartTime': 1,
            'bookedServicesData.meetingEndTime': 1,
            'bookedServicesData.amount': 1,
            'bookedServicesData.customerPhoneNumber': 1,
        };

        const bookings = await Booking.find(filters, projection).lean();

        res.json({ bookings });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error' });
    }
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

module.exports = router;
