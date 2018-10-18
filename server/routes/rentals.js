const express = require('express');
const router = express.Router();
const Rental = require('../models/rental');
const UserCtrl = require('../controllers/user');
const MongooseHelpers = require('../helpers/mongoose');
const User = require('../models/user');

router.get('/secret', UserCtrl.authMiddleware ,(req, res) => {
  res.json({"secret": true});
});

router.get('', (req, res) => {
  const city = req.query.city;
  const query = city ? {city: city.toLowerCase()} : {};
  Rental.find(query)
      .select('-bookings')
      .exec(function(err, foundRentals){
        if(err) {
          return res.status(422).send({errors: MongooseHelpers.normalizeErrors(err.errors)});
        }
        if(city && foundRentals.length === 0) {
          return  res.status(422).send({errors:[{title: "No Rentals Found", detail: `There are no  rentals for city ${city}`}]});
        }
        return res.json(foundRentals);
    });
});

router.post('', UserCtrl.authMiddleware, function(req,res) {
  const {title, city, street, category, image, shared, bedrooms, description, dailyRate} = req.body;
  const user = res.locals.user;
  const rental = new Rental({title, city, street, category, image, shared, bedrooms, description, dailyRate});
  rental.user = user;
  Rental.create(rental, function(err, newRental){
    if(err) {
      return res.status(422).send({errors: MongooseHelpers.normalizeErrors(err.errors)});
    }
    User.update({_id: user.id}, {$push: {rentals: newRental}}, function(){});
    return res.json(newRental);
  });
});

router.get('/manage', UserCtrl.authMiddleware, function(req, res){
  const user = res.locals.user;
  Rental.where({user})
        .populate('bookings')
        .exec((err, foundRentals) => {
          if(err){
            return res.status(422).send({errors: MongooseHelpers.normalizeErrors(err.errors)});
          }
          return res.json(foundRentals);
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

router.delete('/:id', UserCtrl.authMiddleware, function(req, res){
  const user = res.locals.user;

  Rental.findById(req.params.id)
        .populate('user', '_id')
        .populate({
          path: 'bookings',
          select: 'startAt',
          match: { startAt: { $gt: new Date()}}
        })
        .exec(function(err, foundRental){
          if (err) {
            return res.status(422).send({errors: MongooseHelpers.normalizeErrors(err.errors)});
          }

          if( foundRental.user.id !== user.id) {
            return res.status(422).send({errors: [{title: 'Invalid User', detail: "it's not your Rental"}]});
          }

          if(foundRental.bookings.length > 0){
            return res.status(422).send({errors: [{title: 'Active Bookings', detail: "Canot delete rental with active bookings"}]});
          }

          foundRental.remove((err) => {
            if(err) {
              return res.status(422).send({errors: MongooseHelpers.normalizeErrors(err.errors)});
            }
            return res.json({'status': 'deleted'});
          });
        });
});



module.exports = router;
