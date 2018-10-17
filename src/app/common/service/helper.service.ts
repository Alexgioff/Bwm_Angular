import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { Booking } from '../../booking/shared/booking.model';

@Injectable()
export class HelperService {
  private getRangeOfDates(startAt, endAt, dateFormat) {
    const tempDays = [];
    const mEndAt = moment(endAt);
    let mStartAt = moment(startAt);

    while (mStartAt < mEndAt) {
      tempDays.push(mStartAt.format(dateFormat));
      mStartAt = mStartAt.add(1, 'day');
    }

    tempDays.push(moment(startAt).format(dateFormat));
    tempDays.push(mEndAt.format(dateFormat));
    return tempDays;
  }

    private formatDate(date, dateFormat) {
      return moment(date).format(dateFormat);
    }

    public getBookingRangeOfDates(startAt, endAt) {
    return this.getRangeOfDates(startAt, endAt, Booking.BOOKING_FORMAT);
    }

    public getBookingDateFormat(date) {
      return this.formatDate(date, Booking.BOOKING_FORMAT);
    }

}

