const express = require('express');
const router = express.Router();


const UserCtrl = require('../controllers/user');
const BookingCtlr = require('../controllers/booking');


router.post('', UserCtrl.authMiddleware, BookingCtlr.createBooking );

router.get('/manage', UserCtrl.authMiddleware, BookingCtlr.getUserBooking)

module.exports = router;
