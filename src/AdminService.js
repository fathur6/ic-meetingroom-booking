var AdminService = {
  getDashboard: function (adminKey) {
    if (!Auth.validateKey(adminKey)) {
      return { authorized: false, message: 'Invalid admin key.' };
    }
    var pending = SheetService.getPendingBookings();
    var recent = SheetService.getAllBookings(null);
    recent = recent.slice(0, 50);
    return { authorized: true, pending: pending, recent: recent };
  },

  approveBooking: function (bookingId, adminKey, notes) {
    if (!Auth.validateKey(adminKey)) {
      return { success: false, message: 'Invalid admin key.' };
    }

    var booking = SheetService.getBookingById(bookingId);
    if (!booking) return { success: false, message: 'Booking not found.' };
    if (booking.status !== 'Pending') return { success: false, message: 'Booking is not pending. Current status: ' + booking.status + '.' };

    if (booking.calendarEventId) {
      CalendarService.updateEventColor(booking.calendarEventId, 'Approved');
    }

    SheetService.updateBookingStatus(bookingId, 'Approved', 'Admin', notes, booking.calendarEventId);

    var updated = SheetService.getBookingById(bookingId);
    try { EmailService.sendApproval(updated); } catch (ex) { Logger.log('Approval email: ' + ex); }

    return { success: true, message: 'Booking approved.', booking: updated };
  },

  rejectBooking: function (bookingId, adminKey, reason) {
    if (!Auth.validateKey(adminKey)) {
      return { success: false, message: 'Invalid admin key.' };
    }

    var booking = SheetService.getBookingById(bookingId);
    if (!booking) return { success: false, message: 'Booking not found.' };
    if (booking.status !== 'Pending') return { success: false, message: 'Booking is not pending.' };

    if (booking.calendarEventId) {
      CalendarService.prefixEventTitle(booking.calendarEventId, 'Rejected');
    }

    SheetService.updateBookingStatus(bookingId, 'Rejected', 'Admin', reason, booking.calendarEventId);

    var updated = SheetService.getBookingById(bookingId);
    try { EmailService.sendRejection(updated); } catch (ex) { Logger.log('Rejection email: ' + ex); }

    return { success: true, message: 'Booking rejected.', booking: updated };
  },

  refreshBookings: function (adminKey) {
    if (!Auth.validateKey(adminKey)) {
      return { authorized: false };
    }
    var pending = SheetService.getPendingBookings();
    return { authorized: true, pending: pending };
  }
};
