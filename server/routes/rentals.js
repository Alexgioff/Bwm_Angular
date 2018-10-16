const express = require('express');
const router = express.Router();
const Rental = require('../models/rental');
const UserCtrl = require('../controllers/user');

router.get('/secret', UserCtrl.authMiddleware ,(req, res) => {
  res.json({"secret": true});
});

router.get('', (req, res) => {
  Rental.find({})
        .select('-bookings')
        .exec(function(err, foundRentals){
          res.json(foundRentals);
        });
});

router.get(`/:id`, (req, res) => {

  Rental.findById(req.params.id)
        .populate('user', 'username -_id')
        .populate('bookings', 'startAt endAt -_id')
        .exec(function(err, foundRental) {
          if(err){
          return  res.status(422).send({errors:[{title: "Rental errors!", detail: "Could not find Rental"}]});
          }

         return res.json(foundRental);
        });
});

module.exports = router;
