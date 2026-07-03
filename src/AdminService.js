var AdminService = {
  getDashboard: function () {
    var pending = SheetService.getPendingBookings();
    var approved = SheetService.getBookingsByStatus('Approved');
    var rejected = SheetService.getBookingsByStatus('Rejected');
    var deleted = SheetService.getBookingsByStatus('Deleted');
    return {
      authorized: true,
      pending: pending,
      approved: approved,
      rejected: rejected,
      deleted: deleted
    };
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

  deleteBooking: function (bookingId) {
    var booking = SheetService.getBookingById(bookingId);
    if (!booking) return { success: false, message: 'Booking not found.' };
    if (booking.status !== 'Approved' && booking.status !== 'Pending') {
      return { success: false, message: 'Only approved or pending bookings can be deleted.' };
    }

    if (booking.calendarEventId) {
      CalendarService.deleteEvent(booking.calendarEventId);
    }

    SheetService.updateBookingStatus(bookingId, 'Deleted', 'Admin', 'Deleted by admin', '');
    return { success: true, message: 'Booking deleted and moved to Deleted panel.', booking: booking };
  },

  updateBooking: function (bookingId, updates) {
    var booking = SheetService.getBookingById(bookingId);
    if (!booking) return { success: false, message: 'Booking not found.' };
    if (booking.status !== 'Approved' && booking.status !== 'Pending') {
      return { success: false, message: 'Only approved or pending bookings can be edited.' };
    }

    SheetService.updateBookingFields(bookingId, updates);
    var updated = SheetService.getBookingById(bookingId);

    if (updated.status === 'Approved' && updated.calendarEventId) {
      try { CalendarService.deleteEvent(updated.calendarEventId); } catch (ex) {}
      try {
        var newEventId = CalendarService.createEvent(updated);
        if (newEventId) {
          var sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEET_BOOKINGS);
          sheet.getRange(updated.row, 15).setValue(newEventId);
        }
      } catch (ex) {
        Logger.log('Create new event on edit: ' + ex);
      }
    }

    return { success: true, message: 'Booking updated successfully.', booking: updated };
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
