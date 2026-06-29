var SheetService = {
  init: function () {
    var ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    this._ensureSheet(ss, CONFIG.SHEET_BOOKINGS, [
      'BookingID', 'Timestamp', 'Name', 'Office', 'Tel', 'Email',
      'Room', 'Date', 'StartTime', 'EndTime', 'Purpose',
      'Status', 'DecisionBy', 'DecisionAt', 'CalendarEventId', 'Notes'
    ]);
    this._ensureSheet(ss, CONFIG.SHEET_ROOMS, ['RoomID', 'RoomName', 'Active', 'Description']);
    this._ensureSheet(ss, CONFIG.SHEET_SETTINGS, ['Key', 'Value']);
    this._ensureSheet(ss, CONFIG.SHEET_ADMINS, ['Email', 'Role']);
  },

  _ensureSheet: function (ss, name, headers) {
    var sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
      sheet.appendRow(headers);
    }
    return sheet;
  },

  _getSheet: function (name) {
    return SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(name);
  },

  getSettings: function () {
    var sheet = this._getSheet(CONFIG.SHEET_SETTINGS);
    if (!sheet) return {};
    var data = sheet.getDataRange().getValues();
    var settings = {};
    for (var i = 1; i < data.length; i++) {
      var key = String(data[i][0]).trim();
      var val = data[i][1];
      if (key) settings[key] = val;
    }
    return settings;
  },

  setSetting: function (key, value) {
    var sheet = this._getSheet(CONFIG.SHEET_SETTINGS);
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]).trim() === key) {
        sheet.getRange(i + 1, 2).setValue(value);
        return;
      }
    }
    sheet.appendRow([key, value]);
  },

  setSettings: function (kvPairs) {
    var keys = Object.keys(kvPairs);
    for (var k = 0; k < keys.length; k++) {
      this.setSetting(keys[k], kvPairs[keys[k]]);
    }
  },

  seedSettings: function () {
    var defaults = {
      'adminKey': 'ic-admin-2026',
      'timezone': CONFIG.TIMEZONE,
      'startHour': CONFIG.START_HOUR,
      'endHour': CONFIG.END_HOUR,
      'leadTimeDays': CONFIG.LEAD_TIME_DAYS,
      'slotMinutes': CONFIG.SLOT_MINUTES,
      'calendarName': CONFIG.CALENDAR_NAME,
      'approvalEmail': CONFIG.APPROVAL_EMAIL,
      'calendarOwner': CONFIG.SCRIPT_OWNER
    };
    var existing = this.getSettings();
    var keys = Object.keys(defaults);
    for (var k = 0; k < keys.length; k++) {
      if (!(keys[k] in existing)) {
        this.setSetting(keys[k], defaults[keys[k]]);
      }
    }
  },

  seedRooms: function () {
    var sheet = this._getSheet(CONFIG.SHEET_ROOMS);
    var data = sheet.getDataRange().getValues();
    if (data.length > 1) return;
    sheet.appendRow(['MR-01', 'Meeting Room 1', 'Yes', 'Main meeting room']);
    sheet.appendRow(['MR-02', 'Meeting Room 2', 'Yes', 'Secondary meeting room']);
    sheet.appendRow(['MR-03', 'Seminar Room',  'Yes', 'Seminar / workshop space']);
  },

  seedAdmins: function () {
    var sheet = this._getSheet(CONFIG.SHEET_ADMINS);
    var data = sheet.getDataRange().getValues();
    if (data.length > 1) return;
    sheet.appendRow(['fathurrahman@unisza.edu.my', 'Owner']);
    sheet.appendRow(['nasarudinsalleh@unisza.edu.my', 'Admin']);
  },

  getRooms: function () {
    var sheet = this._getSheet(CONFIG.SHEET_ROOMS);
    if (!sheet) return [];
    var data = sheet.getDataRange().getValues();
    var rooms = [];
    for (var i = 1; i < data.length; i++) {
      var active = String(data[i][2]).toLowerCase();
      if (active === 'yes' || active === 'true' || active === '1') {
        rooms.push({
          roomId: data[i][0],
          roomName: data[i][1],
          description: data[i][3] || ''
        });
      }
    }
    return rooms;
  },

  addBooking: function (booking) {
    var sheet = this._getSheet(CONFIG.SHEET_BOOKINGS);
    sheet.appendRow([
      booking.bookingId, new Date(), booking.name, booking.office, booking.tel,
      booking.email, booking.room, booking.date, booking.startTime, booking.endTime,
      booking.purpose, 'Pending', '', '', booking.calendarEventId || '', ''
    ]);
    return booking.bookingId;
  },

  getBookingsByDateAndRoom: function (date, room) {
    var sheet = this._getSheet(CONFIG.SHEET_BOOKINGS);
    if (!sheet) return [];
    var data = sheet.getDataRange().getValues();
    var bookings = [];
    for (var i = 1; i < data.length; i++) {
      var rowDate = String(data[i][7]);
      var rowRoom = String(data[i][6]);
      var status = String(data[i][11]);
      if (rowDate === date && rowRoom === room && (status === 'Pending' || status === 'Approved')) {
        bookings.push({
          row: i + 1,
          bookingId: String(data[i][0]),
          startTime: String(data[i][8]),
          endTime: String(data[i][9]),
          status: status
        });
      }
    }
    return bookings;
  },

  getBookingById: function (bookingId) {
    var sheet = this._getSheet(CONFIG.SHEET_BOOKINGS);
    if (!sheet) return null;
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]).trim() === String(bookingId).trim()) {
        return this._rowToBooking(i + 1, data[i]);
      }
    }
    return null;
  },

  updateBookingStatus: function (bookingId, status, decisionBy, notes, calendarEventId) {
    var booking = this.getBookingById(bookingId);
    if (!booking) return false;
    var sheet = this._getSheet(CONFIG.SHEET_BOOKINGS);
    var row = booking.row;
    sheet.getRange(row, 12).setValue(status);
    sheet.getRange(row, 13).setValue(decisionBy || 'System');
    sheet.getRange(row, 14).setValue(new Date());
    if (calendarEventId != null) sheet.getRange(row, 15).setValue(calendarEventId);
    if (notes != null) sheet.getRange(row, 16).setValue(notes);
    return true;
  },

  getPendingBookings: function () {
    var sheet = this._getSheet(CONFIG.SHEET_BOOKINGS);
    if (!sheet) return [];
    var data = sheet.getDataRange().getValues();
    var pending = [];
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][11]) === 'Pending') {
        pending.push(this._rowToBooking(i + 1, data[i]));
      }
    }
    pending.sort(function (a, b) { return a.timestamp.localeCompare(b.timestamp); });
    return pending;
  },

  getBookingsByEmail: function (email) {
    var sheet = this._getSheet(CONFIG.SHEET_BOOKINGS);
    if (!sheet) return [];
    var data = sheet.getDataRange().getValues();
    var bookings = [];
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][5]).toLowerCase() === String(email).toLowerCase()) {
        bookings.push(this._rowToBooking(i + 1, data[i]));
      }
    }
    bookings.sort(function (a, b) { return b.timestamp.localeCompare(a.timestamp); });
    return bookings;
  },

  getAllBookings: function (filter) {
    var sheet = this._getSheet(CONFIG.SHEET_BOOKINGS);
    if (!sheet) return [];
    var data = sheet.getDataRange().getValues();
    var bookings = [];
    for (var i = 1; i < data.length; i++) {
      var rowStatus = String(data[i][11]);
      if (filter && filter.status && rowStatus !== filter.status) continue;
      if (filter && filter.room && String(data[i][6]) !== filter.room) continue;
      if (filter && filter.dateFrom) {
        var rowDateStr = String(data[i][7]);
        if (rowDateStr < filter.dateFrom) continue;
      }
      if (filter && filter.dateTo) {
        var rowDateStr2 = String(data[i][7]);
        if (rowDateStr2 > filter.dateTo) continue;
      }
      bookings.push(this._rowToBooking(i + 1, data[i]));
    }
    bookings.sort(function (a, b) { return b.timestamp.localeCompare(a.timestamp); });
    return bookings;
  },

  generateBookingId: function () {
    var now = new Date();
    var dateStr = Utilities.formatDate(now, CONFIG.TIMEZONE, 'yyyyMMdd');
    var sheet = this._getSheet(CONFIG.SHEET_BOOKINGS);
    var lastRow = sheet.getLastRow();
    var seq = String(lastRow).padStart(4, '0');
    return 'IC-' + dateStr + '-' + seq;
  },

  cancelBooking: function (bookingId, email) {
    var booking = this.getBookingById(bookingId);
    if (!booking) return { success: false, message: 'Booking not found.' };
    if (String(booking.email).toLowerCase() !== String(email).toLowerCase()) {
      return { success: false, message: 'Email does not match the booking record.' };
    }
    if (booking.status !== 'Pending' && booking.status !== 'Approved') {
      return { success: false, message: 'Only pending or approved bookings can be cancelled. Current status: ' + booking.status };
    }
    this.updateBookingStatus(bookingId, 'Cancelled', email, 'Cancelled by user', '');
    return { success: true, booking: booking };
  },

  _rowToBooking: function (row, data) {
    return {
      row: row,
      bookingId: String(data[0]),
      timestamp: data[1] ? new Date(data[1]).toISOString() : '',
      name: String(data[2] || ''),
      office: String(data[3] || ''),
      tel: String(data[4] || ''),
      email: String(data[5] || ''),
      room: String(data[6] || ''),
      date: String(data[7] || ''),
      startTime: String(data[8] || ''),
      endTime: String(data[9] || ''),
      purpose: String(data[10] || ''),
      status: String(data[11] || ''),
      decisionBy: String(data[12] || ''),
      decisionAt: data[13] ? new Date(data[13]).toISOString() : '',
      calendarEventId: String(data[14] || ''),
      notes: String(data[15] || '')
    };
  }
};
