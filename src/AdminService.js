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

    var room = '';
    var rooms = SheetService.getRooms();
    for (var r = 0; r < rooms.length; r++) {
      if (rooms[r].roomId === booking.room) {
        room = rooms[r].roomName;
        break;
      }
    }
    booking.roomName = room || booking.room;
    booking.notes = notes || '';
    booking.decisionBy = 'Admin';

    var eventId = CalendarService.createEvent(booking);
    SheetService.updateBookingStatus(bookingId, 'Approved', 'Admin', notes, eventId);

    var updated = SheetService.getBookingById(bookingId);
    try { EmailService.sendApproval(updated); } catch (e) { Logger.log('Approval email failed: ' + e); }

    return { success: true, message: 'Booking approved and calendar event created.', booking: updated };
  },

  rejectBooking: function (bookingId, adminKey, reason) {
    if (!Auth.validateKey(adminKey)) {
      return { success: false, message: 'Invalid admin key.' };
    }

    var booking = SheetService.getBookingById(bookingId);
    if (!booking) return { success: false, message: 'Booking not found.' };
    if (booking.status !== 'Pending') return { success: false, message: 'Booking is not pending.' };

    booking.notes = reason || 'Not specified';
    booking.decisionBy = 'Admin';

    SheetService.updateBookingStatus(bookingId, 'Rejected', 'Admin', reason, '');

    var updated = SheetService.getBookingById(bookingId);
    try { EmailService.sendRejection(updated); } catch (e) { Logger.log('Rejection email failed: ' + e); }

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
