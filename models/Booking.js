// models/Booking.js

const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  Username_doctor: String,
  accId: String,
  doctorEmail: String,
  doctorTimezone: String,
  bookedServicesData: [{
    bookingId: String,
    orderId: String,
    customerEmail: String,
    customerPhoneNumber: String,
    customerName: String,
    amount: Number,
    currency: String,
    serviceTitle: String,
    serviceCategory: String,
    serviceNumber: Number,
    isServicePackage: Boolean,
    packageValidity: String,
    transactionId: String,
    isRescheduled: Boolean,
    isCancelled: Boolean,
    numberOfReschedules: Number,
    rescheduledBy: String,
    questionObj: [{
      question: String,
      answer: String
    }],
    contextQuestion: [{
      question: String,
      answer: String
    }],
    transactionStatus: String,
    bookingStatus: String,
    meetingStartTime: String,
    meetingEndTime: String,
    date: {
      day: Number,
      month: String,
      weekDay: String
    },
    customerTimezone: String,
    location: {
      country: String,
      city: String,
      state: String
    },
    isPaymentSuccessful: Boolean,
    correlationId: String
  }]
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
