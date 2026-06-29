var EmailService = {
  sendReceipt: function (booking) {
    var subject = 'Booking Received: ' + booking.bookingId + ' — IC Meeting Room';
    var body = [
      '<div style="font-family:Inter,sans-serif;color:#e6f1ff;background:#05060d;padding:32px;border-radius:12px;max-width:560px">',
      '<h2 style="color:#00f0ff;text-shadow:0 0 12px rgba(0,240,255,.4)">International Centre · Meeting Room</h2>',
      '<p>Your booking request has been <strong style="color:#ffb020">received</strong>.</p>',
      '<table cellpadding="8" style="background:rgba(15,23,42,.8);border-radius:10px;width:100%;margin:16px 0">',
      '<tr><td style="color:#8892b0;white-space:nowrap">Booking ID</td><td style="color:#e6f1ff;font-family:monospace">' + booking.bookingId + '</td></tr>',
      '<tr><td style="color:#8892b0">Room</td><td style="color:#e6f1ff">' + booking.room + '</td></tr>',
      '<tr><td style="color:#8892b0">Date</td><td style="color:#e6f1ff">' + booking.date + '</td></tr>',
      '<tr><td style="color:#8892b0">Time</td><td style="color:#e6f1ff">' + booking.startTime + ' – ' + booking.endTime + '</td></tr>',
      '<tr><td style="color:#8892b0">Purpose</td><td style="color:#e6f1ff">' + (booking.purpose || '—') + '</td></tr>',
      '</table>',
      '<p style="color:#8892b0">You will be notified within <strong>1 working day</strong> once your booking is reviewed.</p>',
      '<hr style="border-color:rgba(0,240,255,.12)">',
      '<p style="font-size:11px;color:#555">UniSZA International Centre · Meeting Room Booking System</p>',
      '</div>'
    ].join('');
    this._send(booking.email, subject, body);
  },

  sendAdminNotice: function (booking) {
    var adminEmail = CONFIG.APPROVAL_EMAIL;
    var subject = 'New Booking: ' + booking.bookingId + ' — Needs Approval';
    var body = [
      '<div style="font-family:Inter,sans-serif;color:#e6f1ff;background:#05060d;padding:32px;border-radius:12px;max-width:560px">',
      '<h2 style="color:#00f0ff;text-shadow:0 0 12px rgba(0,240,255,.4)">New Booking · Needs Review</h2>',
      '<table cellpadding="8" style="background:rgba(15,23,42,.8);border-radius:10px;width:100%;margin:16px 0">',
      '<tr><td style="color:#8892b0">Booking ID</td><td style="color:#e6f1ff;font-family:monospace">' + booking.bookingId + '</td></tr>',
      '<tr><td style="color:#8892b0">Name</td><td style="color:#e6f1ff">' + booking.name + '</td></tr>',
      '<tr><td style="color:#8892b0">Office</td><td style="color:#e6f1ff">' + booking.office + '</td></tr>',
      '<tr><td style="color:#8892b0">Email</td><td style="color:#e6f1ff">' + booking.email + '</td></tr>',
      '<tr><td style="color:#8892b0">Room</td><td style="color:#e6f1ff">' + booking.room + '</td></tr>',
      '<tr><td style="color:#8892b0">Date</td><td style="color:#e6f1ff">' + booking.date + '</td></tr>',
      '<tr><td style="color:#8892b0">Time</td><td style="color:#e6f1ff">' + booking.startTime + ' – ' + booking.endTime + '</td></tr>',
      '<tr><td style="color:#8892b0">Purpose</td><td style="color:#e6f1ff">' + (booking.purpose || '—') + '</td></tr>',
      '</table>',
      '<p style="color:#8892b0">Log in to the <strong>Admin Panel</strong> to approve or reject.</p>',
      '</div>'
    ].join('');
    this._send(adminEmail, subject, body);
  },

  sendApproval: function (booking) {
    var subject = 'Booking Approved: ' + booking.bookingId + ' — IC Meeting Room';
    var body = [
      '<div style="font-family:Inter,sans-serif;color:#e6f1ff;background:#05060d;padding:32px;border-radius:12px;max-width:560px">',
      '<h2 style="color:#39ff14;text-shadow:0 0 12px rgba(57,255,20,.4)">Booking Approved</h2>',
      '<p>Your booking has been <strong style="color:#39ff14">approved</strong> and added to the IC Booking Schedule calendar.</p>',
      '<table cellpadding="8" style="background:rgba(15,23,42,.8);border-radius:10px;width:100%;margin:16px 0">',
      '<tr><td style="color:#8892b0">Booking ID</td><td style="color:#e6f1ff;font-family:monospace">' + booking.bookingId + '</td></tr>',
      '<tr><td style="color:#8892b0">Room</td><td style="color:#e6f1ff">' + booking.room + '</td></tr>',
      '<tr><td style="color:#8892b0">Date</td><td style="color:#e6f1ff">' + booking.date + '</td></tr>',
      '<tr><td style="color:#8892b0">Time</td><td style="color:#e6f1ff">' + booking.startTime + ' – ' + booking.endTime + '</td></tr>',
      '<tr><td style="color:#8892b0">Notes</td><td style="color:#e6f1ff">' + (booking.notes || '—') + '</td></tr>',
      '</table>',
      '<p style="color:#8892b0">Thank you for using the IC Meeting Room Booking System.</p>',
      '<hr style="border-color:rgba(57,255,20,.12)">',
      '<p style="font-size:11px;color:#555">UniSZA International Centre · Meeting Room Booking System</p>',
      '</div>'
    ].join('');
    this._send(booking.email, subject, body);
  },

  sendRejection: function (booking) {
    var subject = 'Booking Update: ' + booking.bookingId + ' — IC Meeting Room';
    var body = [
      '<div style="font-family:Inter,sans-serif;color:#e6f1ff;background:#05060d;padding:32px;border-radius:12px;max-width:560px">',
      '<h2 style="color:#ff3860;text-shadow:0 0 12px rgba(255,56,96,.4)">Booking Not Approved</h2>',
      '<p>Unfortunately your booking could not be accommodated.</p>',
      '<table cellpadding="8" style="background:rgba(15,23,42,.8);border-radius:10px;width:100%;margin:16px 0">',
      '<tr><td style="color:#8892b0">Booking ID</td><td style="color:#e6f1ff;font-family:monospace">' + booking.bookingId + '</td></tr>',
      '<tr><td style="color:#8892b0">Room</td><td style="color:#e6f1ff">' + booking.room + '</td></tr>',
      '<tr><td style="color:#8892b0">Date</td><td style="color:#e6f1ff">' + booking.date + '</td></tr>',
      '<tr><td style="color:#8892b0">Time</td><td style="color:#e6f1ff">' + booking.startTime + ' – ' + booking.endTime + '</td></tr>',
      '<tr><td style="color:#8892b0">Reason</td><td style="color:#ffadb6">' + (booking.notes || 'Slot unavailable') + '</td></tr>',
      '</table>',
      '<p style="color:#8892b0">Please try another time slot on the booking page.</p>',
      '<hr style="border-color:rgba(255,56,96,.12)">',
      '<p style="font-size:11px;color:#555">UniSZA International Centre · Meeting Room Booking System</p>',
      '</div>'
    ].join('');
    this._send(booking.email, subject, body);
  },

  sendCancellationNotice: function (booking) {
    var adminEmail = CONFIG.APPROVAL_EMAIL;
    var subject = 'Booking Cancelled by User: ' + booking.bookingId;
    var body = [
      '<div style="font-family:Inter,sans-serif;color:#e6f1ff;background:#05060d;padding:32px;border-radius:12px;max-width:560px">',
      '<h2 style="color:#8892b0">Booking Cancelled by User</h2>',
      '<p><strong>' + booking.bookingId + '</strong> has been cancelled by the user.</p>',
      '<table cellpadding="8" style="background:rgba(15,23,42,.8);border-radius:10px;width:100%;margin:16px 0">',
      '<tr><td style="color:#8892b0">Name</td><td style="color:#e6f1ff">' + (booking.name || '—') + '</td></tr>',
      '<tr><td style="color:#8892b0">Email</td><td style="color:#e6f1ff">' + (booking.email || '—') + '</td></tr>',
      '<tr><td style="color:#8892b0">Room</td><td style="color:#e6f1ff">' + (booking.room || '—') + '</td></tr>',
      '<tr><td style="color:#8892b0">Date</td><td style="color:#e6f1ff">' + (booking.date || '—') + '</td></tr>',
      '<tr><td style="color:#8892b0">Time</td><td style="color:#e6f1ff">' + (booking.startTime || '—') + ' – ' + (booking.endTime || '—') + '</td></tr>',
      '</table>',
      '<hr style="border-color:rgba(136,146,176,.12)">',
      '<p style="font-size:11px;color:#555">UniSZA International Centre · Meeting Room Booking System</p>',
      '</div>'
    ].join('');
    this._send(adminEmail, subject, body);
  },

  sendCancellationToUser: function (booking) {
    var subject = 'Booking Cancelled: ' + booking.bookingId + ' — IC Meeting Room';
    var body = [
      '<div style="font-family:Inter,sans-serif;color:#e6f1ff;background:#05060d;padding:32px;border-radius:12px;max-width:560px">',
      '<h2 style="color:#8892b0">Booking Cancelled</h2>',
      '<p>Your booking <strong style="color:#e6f1ff">' + booking.bookingId + '</strong> has been cancelled as requested.</p>',
      '<table cellpadding="8" style="background:rgba(15,23,42,.8);border-radius:10px;width:100%;margin:16px 0">',
      '<tr><td style="color:#8892b0">Room</td><td style="color:#e6f1ff">' + (booking.room || '—') + '</td></tr>',
      '<tr><td style="color:#8892b0">Date</td><td style="color:#e6f1ff">' + (booking.date || '—') + '</td></tr>',
      '<tr><td style="color:#8892b0">Time</td><td style="color:#e6f1ff">' + (booking.startTime || '—') + ' – ' + (booking.endTime || '—') + '</td></tr>',
      '<tr><td style="color:#8892b0">Purpose</td><td style="color:#e6f1ff">' + (booking.purpose || '—') + '</td></tr>',
      '</table>',
      '<p style="color:#8892b0">The slot is now available for other bookings.</p>',
      '<hr style="border-color:rgba(136,146,176,.12)">',
      '<p style="font-size:11px;color:#555">UniSZA International Centre · Meeting Room Booking System</p>',
      '</div>'
    ].join('');
    if (booking.email) this._send(booking.email, subject, body);
  },

  _send: function (to, subject, htmlBody) {
    var from = CONFIG.APPROVAL_EMAIL;
    try {
      GmailApp.sendEmail(to, subject, '', {
        from: from,
        htmlBody: htmlBody,
        name: 'IC Meeting Room'
      });
    } catch (e) {
      Logger.log('Email send failed from ' + from + ': ' + e.toString());
      GmailApp.sendEmail(to, subject, '', {
        htmlBody: htmlBody,
        name: 'IC Meeting Room'
      });
    }
  }
};
