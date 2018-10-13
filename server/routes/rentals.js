const express = require('express');
const router = express.Router();
const Rental = require('../models/rental');

router.get('', (req, res) => {
  Rental.find({}, (err, findRentals) => {
    res.json(findRentals);
  });
});

router.get(`/:id`, (req, res) => {
  Rental.findById(req.params.id, (err, foundRental) => {
    if(err){
      res.status(422).send({errors:[{title: "Rental errors!", detail: "Could not find Rental"}]});
    }

    res.json(foundRental);
  });
});

module.exports = router;
