const Rentals = require('./models/rental');
const User = require('./models/user');
const Booking = require('./models/booking');

const fakeDbData = require('./data.json');

class FakeDb {
  constructor(){
    this.rentals = fakeDbData.rentals;

    this.users = fakeDbData.users;
  }

  async clearDB(){
    await User.deleteMany((err) => {
      if(err) {
        console.log(err);
      }
    });
    await Rentals.deleteMany((err) => {
      if(err){
        console.log(err);
      }
    });
    await Booking.deleteMany((err) => {
      if(err) {
        console.log(err);
      }
    })
  }

  pushDataToDb(){
    const user = new User(this.users[0]);
    const user1 = new User(this.users[1]);
    this.rentals.forEach((rental) => {
      const newRental = new Rentals(rental);
      newRental.user = user;

      user.rentals.push(newRental);
      newRental.save();
    });

    user.save();
    user1.save();
  }

  async seedDb() {
    await this.clearDB();
     await this.pushDataToDb();
  }
}

module.exports = FakeDb;
