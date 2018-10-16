const express = require('express');
const router = express.Router();


const UserCtrl = require('../controllers/user');
const BookingCtlr = require('../controllers/booking');


router.post('', UserCtrl.authMiddleware, BookingCtlr.createBooking );


module.exports = router;
