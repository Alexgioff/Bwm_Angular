import { Component, OnInit, Input, ViewChild, ViewEncapsulation } from '@angular/core';
import { Rental } from '../../shared/rental.model';
import { Booking } from '../../../booking/shared/booking.model';
import * as moment from 'moment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HelperService} from '../../../common/service/helper.service';
import {BookingService} from '../../../booking/shared/booking.service';
import { ToastrService } from 'ngx-toastr';
import { DaterangePickerComponent } from 'ng2-daterangepicker';
import {AuthService} from '../../../auth/shared/auth.service';


@Component({
  encapsulation: ViewEncapsulation.None,
  // tslint:disable-next-line:component-selector
  selector: 'bwm-rental-detail-booking',
  templateUrl: './rental-detail-booking.component.html',
  styleUrls: ['./rental-detail-booking.component.scss']
})
export class RentalDetailBookingComponent implements OnInit {

  @Input() rental: Rental;
  @ViewChild(DaterangePickerComponent)
  private picker: DaterangePickerComponent;

  newBooking: Booking;
  modalRef: any;
  errors: any[] = [];

  daterange: any = {};
  bookedOutDates: any[] = [];
  options: any = {
    locale: { format: Booking.BOOKING_FORMAT },
    alwaysShowCalendars: false,
    opens: 'left',
    autoUpdateInput: false,
    isInvalidDate: this.checkForInvalidDates.bind(this)
};
  constructor(private helper: HelperService,
              private modalService: NgbModal,
              private bookingService: BookingService,
              private toastr: ToastrService,
              public auth: AuthService) { }

  ngOnInit() {
    this.newBooking = new Booking();

    this.getBookOutDates();
  }

  private checkForInvalidDates(date) {
    return this.bookedOutDates.includes(this.helper.getBookingDateFormat(date)) || date.diff(moment(), 'days') < 0;
  }

  private getBookOutDates() {
    const bookings: Booking[] = this.rental.bookings;
    if (bookings && bookings.length > 0 ) {
      bookings.forEach((booking) => {
        const dateRange = this.helper.getBookingRangeOfDates(booking.startAt, booking.endAt );
        this.bookedOutDates.push(...dateRange);
      });
    }
  }

  private addNewBookedDates(bookingdata) {
    const dateRange = this.helper.getBookingRangeOfDates(bookingdata.startAt, bookingdata.endAt );
    this.bookedOutDates.push(...dateRange);
  }

  private resetDatePicker() {
    this.picker.datePicker.setStartDate(moment());
    this.picker.datePicker.setEndDate(moment());
    this.picker.datePicker.element.val('');

  }
  openConfirmModal(content) {
    this.errors = [];
   this.modalRef = this.modalService.open(content);
  }

  createBooking() {
    this.newBooking.rental = this.rental;
    this.bookingService.createBooking(this.newBooking).subscribe(
      (bookingData: any) => {
        this.addNewBookedDates(bookingData);
        this.newBooking = new Booking();
        this.modalRef.close();
        this.resetDatePicker();
        this.toastr.success('Booking has been succefuly created, chek your bookin detail in manage section', 'Success!');
      },
      (err: any) => {
        this.errors = err.error.errors;
      }
    );
  }

   selectedDate(value: any, datepicker?: any) {
    this.options.autoUpdateInput = true;
    this.newBooking.startAt = this.helper.getBookingDateFormat(value.start);
    this.newBooking.endAt = this.helper.getBookingDateFormat(value.end);
    this.newBooking.days = -(value.start.diff(value.end, 'days'));
    this.newBooking.totalPrice = this.newBooking.days * this.rental.dailyRate;


    this.daterange.start = value.start;
    this.daterange.end = value.end;
    this.daterange.label = value.label;
  }

}
