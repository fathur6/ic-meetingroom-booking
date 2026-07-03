var AdminService = {
  getDashboard: function () {
    var pending = SheetService.getPendingBookings();
    var recent = SheetService.getAllBookings(null);
    recent = recent.slice(0, 50);
    return { authorized: true, pending: pending, recent: recent };
  },

  approveBooking: function (bookingId, notes) {
    var booking = SheetService.getBookingById(bookingId);
    if (!booking) return { success: false, message: 'Booking not found.' };
    if (booking.status !== 'Pending') return { success: false, message: 'Booking is not pending. Current status: ' + booking.status + '.' };

    if (booking.calendarEventId) {
      CalendarService.updateEventColor(booking.calendarEventId, 'Approved', booking.room);
    }

    SheetService.updateBookingStatus(bookingId, 'Approved', 'Admin', notes, booking.calendarEventId);

    var updated = SheetService.getBookingById(bookingId);
    try { EmailService.sendApproval(updated); } catch (ex) { Logger.log('Approval email: ' + ex); }

    return { success: true, message: 'Booking approved.', booking: updated };
  },

  rejectBooking: function (bookingId, reason) {
    var booking = SheetService.getBookingById(bookingId);
    if (!booking) return { success: false, message: 'Booking not found.' };
    if (booking.status !== 'Pending') return { success: false, message: 'Booking is not pending.' };

    if (booking.calendarEventId) {
      CalendarService.deleteEvent(booking.calendarEventId);
    }

    SheetService.updateBookingStatus(bookingId, 'Rejected', 'Admin', reason, booking.calendarEventId);

    var updated = SheetService.getBookingById(bookingId);
    try { EmailService.sendRejection(updated); } catch (ex) { Logger.log('Rejection email: ' + ex); }

    return { success: true, message: 'Booking rejected.', booking: updated };
  },

  refreshBookings: function () {
    var pending = SheetService.getPendingBookings();
    return { authorized: true, pending: pending };
  },

  getAdmins: function () {
    return SheetService.getAdminList();
  },

  addAdmin: function (email, name) {
    return SheetService.addAdmin(email, name, 'Admin');
  },

  removeAdmin: function (email) {
    return SheetService.removeAdmin(email);
  }
};
