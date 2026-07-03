var _roomDisplay = {
  'UGS-MR': 'UGS Meeting Room (UGS-MR)',
  'UGS-DR': 'UGS Discussion Room (UGS-DR)',
  'UGS-VR1': 'Viva Room 1 (UGS-VR1)',
  'UGS-VR2': 'Viva Room 2 (UGS-VR2)',
  'UGS Meeting Room': 'UGS Meeting Room (UGS-MR)',
  'UGS Discussion Room': 'UGS Discussion Room (UGS-DR)',
  'Viva Room 1': 'Viva Room 1 (UGS-VR1)',
  'Viva Room 2': 'Viva Room 2 (UGS-VR2)'
};

function _fmtRoom(r) {
  if (_roomDisplay[r]) return _roomDisplay[r];
  return String(r || '');
}

function _fmtDate(ds) {
  if (!ds) return '';
  var p = ds.split('-');
  if (p.length !== 3) return ds;
  var dt = new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10));
  var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  return days[dt.getDay()] + ', ' + parseInt(p[2], 10) + ' ' + months[dt.getMonth()] + ' ' + p[0];
}

function _adminPanelUrl() {
  return getDeploymentUrl() + '?page=admin';
}

function _myBookingsUrl() {
  return getDeploymentUrl() + '?page=my';
}

function _feedbackUrl(bookingId) {
  return getDeploymentUrl() + '?page=feedback&bid=' + encodeURIComponent(bookingId);
}

var EmailService = {
  _getAdminEmails: function () {
    var admins = SheetService.getAdminList();
    var emails = [];
    for (var i = 0; i < admins.length; i++) {
      if (admins[i].email) emails.push(admins[i].email.trim());
    }
    return emails;
  },

  sendReceipt: function (booking) {
    var subject = 'Booking Received: ' + booking.bookingId + ' — UGS Meeting Room';
    var body = [
      '<div style="font-family:Inter,sans-serif;color:#e6f1ff;background:#05060d;padding:32px;border-radius:12px;max-width:560px">',
      '<div style="text-align:center;margin-bottom:16px"><img src="https://i.postimg.cc/WzPdKT2p/GS-logo-color-light-crop.png" alt="UGS" style="height:48px"></div>',
      '<h2 style="color:#00f0ff;text-shadow:0 0 12px rgba(0,240,255,.4)">UniSZA Graduate School · Meeting Room</h2>',
      '<p>Your booking request has been <strong style="color:#ffb020">received</strong>.</p>',
      '<table cellpadding="8" style="background:rgba(15,23,42,.8);border-radius:10px;width:100%;margin:16px 0">',
      '<tr><td style="color:#8892b0;white-space:nowrap">Booking ID</td><td style="color:#e6f1ff;font-family:monospace">' + booking.bookingId + '</td></tr>',
      '<tr><td style="color:#8892b0">Room</td><td style="color:#e6f1ff">' + _fmtRoom(booking.room) + '</td></tr>',
      '<tr><td style="color:#8892b0">Date</td><td style="color:#e6f1ff">' + _fmtDate(booking.date) + '</td></tr>',
      '<tr><td style="color:#8892b0">Time</td><td style="color:#e6f1ff">' + booking.startTime + ' – ' + booking.endTime + '</td></tr>',
      '<tr><td style="color:#8892b0">Purpose</td><td style="color:#e6f1ff">' + (booking.purpose || '—') + '</td></tr>',
      '</table>',
      '<p style="color:#8892b0">You will be notified within <strong>1 working day</strong> once your booking is reviewed.</p>',
      '<hr style="border-color:rgba(0,240,255,.12)">',
      '<p style="font-size:11px;color:#555">UniSZA Graduate School · Meeting Room Booking System</p>',
      '</div>'
    ].join('');
    this._send(booking.email, subject, body);
  },

  sendAdminNotice: function (booking) {
    var adminEmails = this._getAdminEmails();
    if (!adminEmails.length) return;
    var subject = 'New Booking: ' + booking.bookingId + ' — Needs Approval';
    var body = [
      '<div style="font-family:Inter,sans-serif;color:#e6f1ff;background:#05060d;padding:32px;border-radius:12px;max-width:560px">',
      '<div style="text-align:center;margin-bottom:16px"><img src="https://i.postimg.cc/WzPdKT2p/GS-logo-color-light-crop.png" alt="UGS" style="height:48px"></div>',
      '<h2 style="color:#00f0ff;text-shadow:0 0 12px rgba(0,240,255,.4)">New Booking · Needs Review</h2>',
      '<table cellpadding="8" style="background:rgba(15,23,42,.8);border-radius:10px;width:100%;margin:16px 0">',
      '<tr><td style="color:#8892b0">Booking ID</td><td style="color:#e6f1ff;font-family:monospace">' + booking.bookingId + '</td></tr>',
      '<tr><td style="color:#8892b0">Name</td><td style="color:#e6f1ff">' + booking.name + '</td></tr>',
      '<tr><td style="color:#8892b0">Office</td><td style="color:#e6f1ff">' + booking.office + '</td></tr>',
      '<tr><td style="color:#8892b0">Email</td><td style="color:#e6f1ff">' + booking.email + '</td></tr>',
      '<tr><td style="color:#8892b0">Room</td><td style="color:#e6f1ff">' + _fmtRoom(booking.room) + '</td></tr>',
      '<tr><td style="color:#8892b0">Date</td><td style="color:#e6f1ff">' + _fmtDate(booking.date) + '</td></tr>',
      '<tr><td style="color:#8892b0">Time</td><td style="color:#e6f1ff">' + booking.startTime + ' – ' + booking.endTime + '</td></tr>',
      '<tr><td style="color:#8892b0">Purpose</td><td style="color:#e6f1ff">' + (booking.purpose || '—') + '</td></tr>',
      '</table>',
      '<p style="color:#8892b0;margin-bottom:16px">Log in to the Admin Panel to approve or reject.</p>',
      this._adminBtn(),
      '<hr style="border-color:rgba(0,240,255,.12)">',
      '<p style="font-size:11px;color:#555">UniSZA Graduate School · Meeting Room Booking System</p>',
      '</div>'
    ].join('');
    this._send(adminEmails[0], subject, body, adminEmails.slice(1).join(','));
  },

  sendApproval: function (booking) {
    var subject = 'Booking Approved: ' + booking.bookingId + ' — UGS Meeting Room';
    var body = [
      '<div style="font-family:Inter,sans-serif;color:#e6f1ff;background:#05060d;padding:32px;border-radius:12px;max-width:560px">',
      '<div style="text-align:center;margin-bottom:16px"><img src="https://i.postimg.cc/WzPdKT2p/GS-logo-color-light-crop.png" alt="UGS" style="height:48px"></div>',
      '<h2 style="color:#39ff14;text-shadow:0 0 12px rgba(57,255,20,.4)">Booking Approved</h2>',
      '<p>Your booking has been <strong style="color:#39ff14">approved</strong> and added to the UGS Booking Schedule calendar.</p>',
      '<table cellpadding="8" style="background:rgba(15,23,42,.8);border-radius:10px;width:100%;margin:16px 0">',
      '<tr><td style="color:#8892b0">Booking ID</td><td style="color:#e6f1ff;font-family:monospace">' + booking.bookingId + '</td></tr>',
      '<tr><td style="color:#8892b0">Room</td><td style="color:#e6f1ff">' + _fmtRoom(booking.room) + '</td></tr>',
      '<tr><td style="color:#8892b0">Date</td><td style="color:#e6f1ff">' + _fmtDate(booking.date) + '</td></tr>',
      '<tr><td style="color:#8892b0">Time</td><td style="color:#e6f1ff">' + booking.startTime + ' – ' + booking.endTime + '</td></tr>',
      '<tr><td style="color:#8892b0">Notes</td><td style="color:#e6f1ff">' + (booking.notes || '—') + '</td></tr>',
      '</table>',
      '<p style="color:#8892b0">Thank you for using the UGS Meeting Room Booking System.</p>',
      '<hr style="border-color:rgba(57,255,20,.12)">',
      '<p style="font-size:11px;color:#555">UniSZA Graduate School · Meeting Room Booking System</p>',
      '</div>'
    ].join('');
    this._send(booking.email, subject, body);
  },

  sendRejection: function (booking) {
    var subject = 'Booking Update: ' + booking.bookingId + ' — UGS Meeting Room';
    var body = [
      '<div style="font-family:Inter,sans-serif;color:#e6f1ff;background:#05060d;padding:32px;border-radius:12px;max-width:560px">',
      '<div style="text-align:center;margin-bottom:16px"><img src="https://i.postimg.cc/WzPdKT2p/GS-logo-color-light-crop.png" alt="UGS" style="height:48px"></div>',
      '<h2 style="color:#ff3860;text-shadow:0 0 12px rgba(255,56,96,.4)">Booking Not Approved</h2>',
      '<p>Unfortunately your booking could not be accommodated.</p>',
      '<table cellpadding="8" style="background:rgba(15,23,42,.8);border-radius:10px;width:100%;margin:16px 0">',
      '<tr><td style="color:#8892b0">Booking ID</td><td style="color:#e6f1ff;font-family:monospace">' + booking.bookingId + '</td></tr>',
      '<tr><td style="color:#8892b0">Room</td><td style="color:#e6f1ff">' + _fmtRoom(booking.room) + '</td></tr>',
      '<tr><td style="color:#8892b0">Date</td><td style="color:#e6f1ff">' + _fmtDate(booking.date) + '</td></tr>',
      '<tr><td style="color:#8892b0">Time</td><td style="color:#e6f1ff">' + booking.startTime + ' – ' + booking.endTime + '</td></tr>',
      '<tr><td style="color:#8892b0">Reason</td><td style="color:#ffadb6">' + (booking.notes || 'Slot unavailable') + '</td></tr>',
      '</table>',
      '<p style="color:#8892b0">Please try another time slot on the booking page.</p>',
      '<hr style="border-color:rgba(255,56,96,.12)">',
      '<p style="font-size:11px;color:#555">UniSZA Graduate School · Meeting Room Booking System</p>',
      '</div>'
    ].join('');
    this._send(booking.email, subject, body);
  },

  sendCancellationNotice: function (booking) {
    var adminEmails = this._getAdminEmails();
    if (!adminEmails.length) return;
    var subject = 'Booking Cancelled by User: ' + booking.bookingId;
    var body = [
      '<div style="font-family:Inter,sans-serif;color:#e6f1ff;background:#05060d;padding:32px;border-radius:12px;max-width:560px">',
      '<div style="text-align:center;margin-bottom:16px"><img src="https://i.postimg.cc/WzPdKT2p/GS-logo-color-light-crop.png" alt="UGS" style="height:48px"></div>',
      '<h2 style="color:#8892b0">Booking Cancelled by User</h2>',
      '<p><strong>' + booking.bookingId + '</strong> has been cancelled by the user.</p>',
      '<table cellpadding="8" style="background:rgba(15,23,42,.8);border-radius:10px;width:100%;margin:16px 0">',
      '<tr><td style="color:#8892b0">Name</td><td style="color:#e6f1ff">' + (booking.name || '—') + '</td></tr>',
      '<tr><td style="color:#8892b0">Email</td><td style="color:#e6f1ff">' + (booking.email || '—') + '</td></tr>',
      '<tr><td style="color:#8892b0">Room</td><td style="color:#e6f1ff">' + (_fmtRoom(booking.room) || '—') + '</td></tr>',
      '<tr><td style="color:#8892b0">Date</td><td style="color:#e6f1ff">' + (_fmtDate(booking.date) || '—') + '</td></tr>',
      '<tr><td style="color:#8892b0">Time</td><td style="color:#e6f1ff">' + (booking.startTime || '—') + ' – ' + (booking.endTime || '—') + '</td></tr>',
      '</table>',
      '<p style="color:#8892b0;margin-bottom:16px">The slot is now available. Check the Admin Panel for details.</p>',
      this._adminBtn(),
      '<hr style="border-color:rgba(136,146,176,.12)">',
      '<p style="font-size:11px;color:#555">UniSZA Graduate School · Meeting Room Booking System</p>',
      '</div>'
    ].join('');
    this._send(adminEmails[0], subject, body, adminEmails.slice(1).join(','));
  },

  sendCancellationToUser: function (booking) {
    var subject = 'Booking Cancelled: ' + booking.bookingId + ' — UGS Meeting Room';
    var body = [
      '<div style="font-family:Inter,sans-serif;color:#e6f1ff;background:#05060d;padding:32px;border-radius:12px;max-width:560px">',
      '<div style="text-align:center;margin-bottom:16px"><img src="https://i.postimg.cc/WzPdKT2p/GS-logo-color-light-crop.png" alt="UGS" style="height:48px"></div>',
      '<h2 style="color:#8892b0">Booking Cancelled</h2>',
      '<p>Your booking <strong style="color:#e6f1ff">' + booking.bookingId + '</strong> has been cancelled as requested.</p>',
      '<table cellpadding="8" style="background:rgba(15,23,42,.8);border-radius:10px;width:100%;margin:16px 0">',
      '<tr><td style="color:#8892b0">Room</td><td style="color:#e6f1ff">' + (_fmtRoom(booking.room) || '—') + '</td></tr>',
      '<tr><td style="color:#8892b0">Date</td><td style="color:#e6f1ff">' + (_fmtDate(booking.date) || '—') + '</td></tr>',
      '<tr><td style="color:#8892b0">Time</td><td style="color:#e6f1ff">' + (booking.startTime || '—') + ' – ' + (booking.endTime || '—') + '</td></tr>',
      '<tr><td style="color:#8892b0">Purpose</td><td style="color:#e6f1ff">' + (booking.purpose || '—') + '</td></tr>',
      '</table>',
      '<p style="color:#8892b0">The slot is now available for other bookings.</p>',
      '<hr style="border-color:rgba(136,146,176,.12)">',
      '<p style="font-size:11px;color:#555">UniSZA Graduate School · Meeting Room Booking System</p>',
      '</div>'
    ].join('');
    if (booking.email) this._send(booking.email, subject, body);
  },

  sendReminder24h: function (booking) {
    var room = _fmtRoom(booking.roomName || booking.room) || 'a room';
    var subject = 'Reminder: ' + booking.bookingId + ' tomorrow — UGS Meeting Room';
    var body = [
      '<div style="font-family:Inter,sans-serif;color:#e6f1ff;background:#05060d;padding:32px;border-radius:12px;max-width:560px">',
      '<div style="text-align:center;margin-bottom:16px"><img src="https://i.postimg.cc/WzPdKT2p/GS-logo-color-light-crop.png" alt="UGS" style="height:48px"></div>',
      '<h2 style="color:#00f0ff;text-shadow:0 0 12px rgba(0,240,255,.4)">Booking Reminder</h2>',
      '<p>Your meeting room booking is scheduled for <strong>tomorrow</strong>.</p>',
      '<table cellpadding="8" style="background:rgba(15,23,42,.8);border-radius:10px;width:100%;margin:16px 0">',
      '<tr><td style="color:#8892b0">Booking ID</td><td style="color:#e6f1ff;font-family:monospace">' + booking.bookingId + '</td></tr>',
      '<tr><td style="color:#8892b0">Room</td><td style="color:#e6f1ff">' + room + '</td></tr>',
      '<tr><td style="color:#8892b0">Date</td><td style="color:#e6f1ff">' + _fmtDate(booking.date) + '</td></tr>',
      '<tr><td style="color:#8892b0">Time</td><td style="color:#e6f1ff">' + booking.startTime + ' – ' + booking.endTime + '</td></tr>',
      '</table>',
      '<p style="color:#8892b0">Please arrive on time. You may view your booking details below.</p>',
      this._myBookingsBtn(),
      '<hr style="border-color:rgba(0,240,255,.12)">',
      '<p style="font-size:11px;color:#555">UniSZA Graduate School · Meeting Room Booking System</p>',
      '</div>'
    ].join('');
    var adminEmails = this._getAdminEmails();
    this._send(booking.email, subject, body);
    if (adminEmails.length) this._send(adminEmails[0], subject, body, adminEmails.slice(1).join(','));
  },

  sendReminder1hUser: function (booking) {
    var room = _fmtRoom(booking.roomName || booking.room) || 'a room';
    var subject = 'Reminder: ' + booking.bookingId + ' starts in 1 hour — UGS Meeting Room';
    var body = [
      '<div style="font-family:Inter,sans-serif;color:#e6f1ff;background:#05060d;padding:32px;border-radius:12px;max-width:560px">',
      '<div style="text-align:center;margin-bottom:16px"><img src="https://i.postimg.cc/WzPdKT2p/GS-logo-color-light-crop.png" alt="UGS" style="height:48px"></div>',
      '<h2 style="color:#00f0ff;text-shadow:0 0 12px rgba(0,240,255,.4)">Your Booking Starts in 1 Hour</h2>',
      '<p>Your meeting room booking begins at <strong>' + booking.startTime + '</strong> today.</p>',
      '<table cellpadding="8" style="background:rgba(15,23,42,.8);border-radius:10px;width:100%;margin:16px 0">',
      '<tr><td style="color:#8892b0">Booking ID</td><td style="color:#e6f1ff;font-family:monospace">' + booking.bookingId + '</td></tr>',
      '<tr><td style="color:#8892b0">Room</td><td style="color:#e6f1ff">' + room + '</td></tr>',
      '<tr><td style="color:#8892b0">Time</td><td style="color:#e6f1ff">' + booking.startTime + ' – ' + booking.endTime + '</td></tr>',
      '</table>',
      '<p style="color:#8892b0">Please proceed to the room. View your booking details below.</p>',
      this._myBookingsBtn(),
      '<hr style="border-color:rgba(0,240,255,.12)">',
      '<p style="font-size:11px;color:#555">UniSZA Graduate School · Meeting Room Booking System</p>',
      '</div>'
    ].join('');
    this._send(booking.email, subject, body);
  },

  sendReminder1hAdmin: function (booking) {
    var room = _fmtRoom(booking.roomName || booking.room) || 'a room';
    var adminEmails = this._getAdminEmails();
    if (!adminEmails.length) return;
    var subject = 'Room Prep: ' + booking.bookingId + ' starts in 1 hour — ' + room;
    var body = [
      '<div style="font-family:Inter,sans-serif;color:#e6f1ff;background:#05060d;padding:32px;border-radius:12px;max-width:560px">',
      '<div style="text-align:center;margin-bottom:16px"><img src="https://i.postimg.cc/WzPdKT2p/GS-logo-color-light-crop.png" alt="UGS" style="height:48px"></div>',
      '<h2 style="color:#ffb020;text-shadow:0 0 12px rgba(255,176,32,.4)">Room Preparation Needed</h2>',
      '<p><strong>' + (booking.name || 'A user') + '</strong> has booked <strong>' + room + '</strong> starting at <strong>' + booking.startTime + '</strong> today (' + _fmtDate(booking.date) + ').</p>',
      '<table cellpadding="8" style="background:rgba(15,23,42,.8);border-radius:10px;width:100%;margin:16px 0">',
      '<tr><td style="color:#8892b0">Booking ID</td><td style="color:#e6f1ff;font-family:monospace">' + booking.bookingId + '</td></tr>',
      '<tr><td style="color:#8892b0">Room</td><td style="color:#e6f1ff">' + room + '</td></tr>',
      '<tr><td style="color:#8892b0">Time</td><td style="color:#e6f1ff">' + booking.startTime + ' – ' + booking.endTime + '</td></tr>',
      '<tr><td style="color:#8892b0">Purpose</td><td style="color:#e6f1ff">' + (booking.purpose || '—') + '</td></tr>',
      '</table>',
      '<p style="color:#e6f1ff;font-weight:600">Please ensure:</p>',
      '<ul style="color:#8892b0;padding-left:18px;line-height:1.8">',
      '<li>The air-conditioner and lights are turned on</li>',
      '<li>All equipment and appliances are in working order</li>',
      '<li>The room is clean and ready for use</li>',
      '</ul>',
      this._adminBtn(),
      '<hr style="border-color:rgba(255,176,32,.12)">',
      '<p style="font-size:11px;color:#555">UniSZA Graduate School · Meeting Room Booking System</p>',
      '</div>'
    ].join('');
    this._send(adminEmails[0], subject, body, adminEmails.slice(1).join(','));
  },

  sendReminder15min: function (booking) {
    var room = _fmtRoom(booking.roomName || booking.room) || 'a room';
    var adminEmails = this._getAdminEmails();
    if (!adminEmails.length) return;
    var subject = 'Room Closing: ' + booking.bookingId + ' ends in 15 min — ' + room;
    var body = [
      '<div style="font-family:Inter,sans-serif;color:#e6f1ff;background:#05060d;padding:32px;border-radius:12px;max-width:560px">',
      '<div style="text-align:center;margin-bottom:16px"><img src="https://i.postimg.cc/WzPdKT2p/GS-logo-color-light-crop.png" alt="UGS" style="height:48px"></div>',
      '<h2 style="color:#ffb020;text-shadow:0 0 12px rgba(255,176,32,.4)">Room Closing Reminder</h2>',
      '<p>The booking for <strong>' + room + '</strong> ends at <strong>' + booking.endTime + '</strong> today (' + _fmtDate(booking.date) + ').</p>',
      '<table cellpadding="8" style="background:rgba(15,23,42,.8);border-radius:10px;width:100%;margin:16px 0">',
      '<tr><td style="color:#8892b0">Booking ID</td><td style="color:#e6f1ff;font-family:monospace">' + booking.bookingId + '</td></tr>',
      '<tr><td style="color:#8892b0">Room</td><td style="color:#e6f1ff">' + room + '</td></tr>',
      '<tr><td style="color:#8892b0">Name</td><td style="color:#e6f1ff">' + (booking.name || '—') + '</td></tr>',
      '</table>',
      '<p style="color:#e6f1ff;font-weight:600">Please ensure after use:</p>',
      '<ul style="color:#8892b0;padding-left:18px;line-height:1.8">',
      '<li>Turn off the air-conditioner and lights</li>',
      '<li>Switch off all equipment and appliances</li>',
      '<li>The room is left clean and tidy</li>',
      '</ul>',
      this._adminBtn(),
      '<hr style="border-color:rgba(255,176,32,.12)">',
      '<p style="font-size:11px;color:#555">UniSZA Graduate School · Meeting Room Booking System</p>',
      '</div>'
    ].join('');
    this._send(adminEmails[0], subject, body, adminEmails.slice(1).join(','));
  },

  sendEndThankYou: function (booking) {
    var room = _fmtRoom(booking.roomName || booking.room) || 'a room';
    var subject = 'Thank you for using the meeting room — UGS Meeting Room';
    var body = [
      '<div style="font-family:Inter,sans-serif;color:#e6f1ff;background:#05060d;padding:32px;border-radius:12px;max-width:560px">',
      '<div style="text-align:center;margin-bottom:16px"><img src="https://i.postimg.cc/WzPdKT2p/GS-logo-color-light-crop.png" alt="UGS" style="height:48px"></div>',
      '<h2 style="color:#39ff14;text-shadow:0 0 12px rgba(57,255,20,.4)">Thank You</h2>',
      '<p>Your booking at <strong>' + room + '</strong> has ended. We hope the room served your needs well.</p>',
      '<table cellpadding="8" style="background:rgba(15,23,42,.8);border-radius:10px;width:100%;margin:16px 0">',
      '<tr><td style="color:#8892b0">Booking ID</td><td style="color:#e6f1ff;font-family:monospace">' + booking.bookingId + '</td></tr>',
      '<tr><td style="color:#8892b0">Room</td><td style="color:#e6f1ff">' + room + '</td></tr>',
      '<tr><td style="color:#8892b0">Date</td><td style="color:#e6f1ff">' + _fmtDate(booking.date) + '</td></tr>',
      '<tr><td style="color:#8892b0">Time</td><td style="color:#e6f1ff">' + booking.startTime + ' – ' + booking.endTime + '</td></tr>',
      '</table>',
      '<p style="color:#8892b0">We value your feedback — please take a moment to rate your experience.</p>',
      this._feedbackBtn(booking.bookingId),
      '<hr style="border-color:rgba(57,255,20,.12)">',
      '<p style="font-size:11px;color:#555">UniSZA Graduate School · Meeting Room Booking System</p>',
      '</div>'
    ].join('');
    this._send(booking.email, subject, body);
  },

  _myBookingsBtn: function () {
    var url = _myBookingsUrl();
    return '<table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 16px"><tr><td style="border-radius:8px;background:#00f0ff;padding:10px 22px;text-align:center">' +
      '<a href="' + url + '" style="color:#001216;font-size:14px;font-weight:700;text-decoration:none;letter-spacing:.3px;display:inline-block">My Bookings</a>' +
      '</td></tr></table>';
  },

  _feedbackBtn: function (bookingId) {
    var url = _feedbackUrl(bookingId);
    return '<table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 16px"><tr><td style="border-radius:8px;background:#39ff14;padding:10px 22px;text-align:center">' +
      '<a href="' + url + '" style="color:#001216;font-size:14px;font-weight:700;text-decoration:none;letter-spacing:.3px;display:inline-block">Give Feedback</a>' +
      '</td></tr></table>';
  },

  _adminBtn: function () {
    var url = _adminPanelUrl();
    return '<table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 16px"><tr><td style="border-radius:8px;background:#00f0ff;padding:10px 22px;text-align:center">' +
      '<a href="' + url + '" style="color:#001216;font-size:14px;font-weight:700;text-decoration:none;letter-spacing:.3px;display:inline-block">Go to Admin Panel</a>' +
      '</td></tr></table>';
  },

  _send: function (to, subject, htmlBody, bcc) {
    var from = CONFIG.APPROVAL_EMAIL;
    var opts = {
      htmlBody: htmlBody,
      name: 'UGS Meeting Room'
    };
    if (bcc) opts.bcc = bcc;
    try {
      opts.from = from;
      GmailApp.sendEmail(to, subject, '', opts);
    } catch (e) {
      Logger.log('Email send failed from ' + from + ': ' + e.toString());
      delete opts.from;
      GmailApp.sendEmail(to, subject, '', opts);
    }
  }
};
