var APP_TITLE = 'UGS Meeting Room Booking';

function doGet(e) {
  var page = e && e.parameter && e.parameter.page ? e.parameter.page : 'index';
  var fileMap = {
    'index': 'Index',
    'booking': 'pages/Booking',
    'my': 'pages/MyBookings',
    'admin': 'pages/Admin',
    'feedback': 'pages/Feedback'
  };
  var titleMap = {
    'index': APP_TITLE,
    'booking': APP_TITLE,
    'my': 'My Bookings — ' + APP_TITLE,
    'admin': 'Admin — ' + APP_TITLE,
    'feedback': 'Feedback — ' + APP_TITLE
  };

  var file = fileMap[page] || fileMap['index'];
  var title = titleMap[page] || APP_TITLE;

  var tmpl = HtmlService.createTemplateFromFile(file);
  tmpl.param_bid = (e && e.parameter && e.parameter.bid) ? e.parameter.bid : '';

  return tmpl.evaluate()
    .setTitle(title)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function getDeploymentUrl() {
  var id = CONFIG.DEPLOYMENT_ID || PropertiesService.getScriptProperties().getProperty('DEPLOYMENT_ID') || '';
  if (!id || id.indexOf('YOUR_') === 0) return 'https://script.google.com/macros/s/AKfycbw9nthz4zYsknIVcQWAoke45peeYWzTzljaUu1UZ4dumHOoxSItbSOfWzocRUq81mI/exec';
  return 'https://script.google.com/macros/s/' + id + '/exec';
}

function getCurrentUser() {
  var email = '';
  try { email = Session.getActiveUser().getEmail(); } catch (ex) {}
  return email || '';
}

function checkAuth() {
  var email = '';
  try { email = Session.getActiveUser().getEmail(); } catch (ex) {}
  if (!email) return { authorized: false, user: '', needsAuth: true, authUrl: '' };

  try {
    var info = ScriptApp.getAuthorizationInfo(ScriptApp.AuthMode.FULL);
    if (info.getAuthorizationStatus() === ScriptApp.AuthorizationStatus.REQUIRED) {
      return { authorized: false, user: email, needsAuth: true, authUrl: info.getAuthorizationUrl() };
    }
  } catch (e) {}

  return { authorized: true, user: email, needsAuth: false, authUrl: '' };
}

function forceOAuth() {
  var token = ScriptApp.getOAuthToken();
  var user = Session.getActiveUser().getEmail();
  var count = GmailApp.getInboxUnreadCount();
  var calId = CalendarService.getCalendarId();
  var calName = CalendarApp.getCalendarById(calId).getName();
  return {
    authorized: true,
    tokenPrefix: token.substring(0, 10) + '...',
    user: user,
    inboxUnread: count,
    calendar: calName,
  };
}

function getAuthUrl() {
  try {
    return ScriptApp.getAuthorizationInfo(ScriptApp.AuthMode.FULL).getAuthorizationUrl();
  } catch (ex) {
    return '';
  }
}

function setup(sheetId, approvalEmail) {
  if (!sheetId) sheetId = '1PSdfrQN1xnCtPx_dGKoj7v_ttIFO1u1zN3P4-nEQQ_8';
  if (!approvalEmail) approvalEmail = 'pps@unisza.edu.my';

  var adminEmails = '';
  try { adminEmails = Session.getActiveUser().getEmail() + ',' + approvalEmail; } catch (ex) {}
  PropertiesService.getScriptProperties().setProperties({
    'SHEET_ID': sheetId,
    'APPROVAL_EMAIL': approvalEmail,
    'ADMIN_EMAILS': adminEmails,
    'CALENDAR_ID': 'c_9efcafb3465e76b522ec27e40c57def79acd2fb31e8ab78fa08813b960d942f9@group.calendar.google.com',
    'SCRIPT_OWNER': Session.getActiveUser().getEmail() || 'YOUR_EMAIL',
    'DEPLOYMENT_ID': 'YOUR_DEPLOYMENT_ID'
  }, true);

  try {
    SheetService.init();
    SheetService.seedSettings();
    SheetService.seedRooms();
    SheetService.seedAdmins();
    var calId = CalendarService.ensureCalendar();
    var shareResult = CalendarService.shareCalendar();
    var triggerResult = setupReminderTrigger();
    return {
      success: true,
      message: 'Setup complete. Calendar: ' + calId + '. ' + shareResult + ' ' + triggerResult,
      calendarId: calId,
      shareResult: shareResult
    };
  } catch (e) {
    return { success: false, message: 'Setup error: ' + e.toString() };
  }
}

function getRooms() {
  return SheetService.getRooms();
}

function getConfig() {
  return {
    workdayNumbers: CONFIG.WORKDAY_NUMBERS,
    startHour: CONFIG.START_HOUR,
    endHour: CONFIG.END_HOUR,
    leadTimeDays: CONFIG.LEAD_TIME_DAYS,
    slotMinutes: CONFIG.SLOT_MINUTES,
    todayStr: Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'yyyy-MM-dd')
  };
}

// --- Global wrappers for google.script.run ---

function getAvailability(roomId, dateStr) {
  return BookingService.getAvailability(roomId, dateStr);
}

function submitBooking(form) {
  return BookingService.submitBooking(form);
}

function getMyBookings(email) {
  return BookingService.getMyBookings(email);
}

function cancelMyBooking(bookingId, email) {
  return BookingService.cancelMyBooking(bookingId, email);
}

function getDashboard(adminKey) {
  return AdminService.getDashboard();
}

function approveBooking(bookingId, adminKey, notes) {
  return AdminService.approveBooking(bookingId, notes);
}

function rejectBooking(bookingId, adminKey, reason) {
  return AdminService.rejectBooking(bookingId, reason);
}

function getBookingById(bookingId) {
  return SheetService.getBookingById(bookingId);
}

function getAdminListFn(adminKey) {
  return AdminService.getAdmins();
}

function addAdmin(adminKey, email, name) {
  return AdminService.addAdmin(email, name);
}

function removeAdminFn(adminKey, email) {
  return AdminService.removeAdmin(email);
}

function getBookingForFeedback(bookingId) {
  var booking = SheetService.getBookingById(bookingId);
  if (!booking) return null;
  var existing = SheetService.getFeedbackByBookingId(bookingId);
  if (existing) return { alreadySubmitted: true };
  return {
    bookingId: booking.bookingId,
    name: booking.name,
    office: booking.office,
    room: booking.room,
    date: booking.date,
    startTime: booking.startTime,
    endTime: booking.endTime,
    alreadySubmitted: false
  };
}

function submitFeedback(feedback) {
  var existing = SheetService.getFeedbackByBookingId(feedback.bookingId);
  if (existing) return { success: false, message: 'Feedback already submitted for this booking.' };
  return SheetService.submitFeedback(feedback);
}

function processReminders() {
  return ReminderService.checkAndSendReminders();
}

function setupReminderTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'processReminders') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  ScriptApp.newTrigger('processReminders')
    .timeBased()
    .everyMinutes(5)
    .create();
  return 'Reminder trigger created. Runs every 5 minutes.';
}

function diagnose() {
  var out = [];
  out.push('=== DIAGNOSTIC REPORT ===');

  out.push('');
  out.push('--- Calendar ---');
  out.push('CONFIG.CALENDAR_ID: ' + CONFIG.CALENDAR_ID);
  var resolvedId = CalendarService.getCalendarId();
  out.push('Resolved calendar ID: ' + resolvedId);
  try {
    var cal = CalendarApp.getCalendarById(resolvedId);
    out.push('Calendar accessible: ' + (cal ? 'YES' : 'NO'));
    if (cal) out.push('Calendar name: ' + cal.getName());
  } catch (e) {
    out.push('Calendar access ERROR: ' + e.toString());
  }

  out.push('');
  out.push('--- Script Properties ---');
  var sp = PropertiesService.getScriptProperties().getProperties();
  var spKeys = Object.keys(sp);
  out.push('Properties count: ' + spKeys.length);
  for (var i = 0; i < spKeys.length; i++) {
    var val = sp[spKeys[i]];
    if (String(val).length > 40) val = String(val).substring(0, 40) + '...';
    out.push('  ' + spKeys[i] + ' = ' + val);
  }

  out.push('');
  out.push('--- Bookings ---');
  var bookings = SheetService.getAllBookings(null);
  out.push('Total bookings: ' + bookings.length);
  var withEvent = 0;
  var withoutEvent = 0;
  for (var i = 0; i < bookings.length; i++) {
    var b = bookings[i];
    if (b.calendarEventId) {
      withEvent++;
      out.push('  [HAS EVENT] ' + b.bookingId + ' status=' + b.status + ' event=' + b.calendarEventId);
    } else {
      withoutEvent++;
      out.push('  [NO EVENT]  ' + b.bookingId + ' status=' + b.status + ' date=' + b.date);
    }
  }
  out.push('With eventId: ' + withEvent + ', Without: ' + withoutEvent);

  Logger.log(out.join('\n'));
  return out.join('\n');
}

function backfillCalendarEvents() {
  var bookings = SheetService.getAllBookings(null);
  var created = 0;
  var skipped = 0;
  var errors = 0;

  for (var i = 0; i < bookings.length; i++) {
    var b = bookings[i];
    if (b.calendarEventId) { skipped++; continue; }
    if (b.status === 'Cancelled' || b.status === 'Rejected') { skipped++; continue; }

    try {
      var dt = new Date(b.date);
      var dateStr = Utilities.formatDate(dt, CONFIG.TIMEZONE, 'yyyy-MM-dd');

      var booking = {
        bookingId: b.bookingId,
        name: b.name,
        office: b.office,
        tel: b.tel,
        email: b.email,
        room: b.room,
        roomName: b.room,
        date: dateStr,
        startTime: b.startTime,
        endTime: b.endTime,
        purpose: b.purpose
      };

      var eventId = CalendarService.createEvent(booking);
      if (eventId) {
        if (b.status === 'Approved') {
          CalendarService.updateEventColor(eventId, 'Approved', b.room);
        }
        var sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEET_BOOKINGS);
        sheet.getRange(b.row, 15).setValue(eventId);
        created++;
      } else {
        errors++;
        Logger.log('Backfill: createEvent returned empty for ' + b.bookingId);
      }
    } catch (ex) {
      errors++;
      Logger.log('Backfill error for ' + b.bookingId + ': ' + ex.toString());
    }
  }

  var msg = 'Backfill complete. Created: ' + created + ' events. Skipped: ' + skipped + ' (no event needed). Errors: ' + errors + '.';
  Logger.log(msg);
  return msg;
}

function verifyCalendarEvents() {
  var calId = CalendarService.getCalendarId();
  var out = [];
  out.push('Calendar ID: ' + calId);
  var cal = CalendarApp.getCalendarById(calId);
  if (!cal) { out.push('ERROR: Cannot access calendar.'); Logger.log(out.join('\n')); return out.join('\n'); }
  out.push('Name: ' + cal.getName());
  var now = new Date();
  var start = new Date(now.getTime() - 60 * 86400000);
  var end = new Date(now.getTime() + 90 * 86400000);
  var events = cal.getEvents(start, end);
  out.push('Events in range (' + start + ' to ' + end + '): ' + events.length);
  for (var i = 0; i < Math.min(events.length, 20); i++) {
    out.push('  ' + events[i].getTitle() + ' | ' + events[i].getStartTime() + ' → ' + events[i].getEndTime());
  }
  out.push('');
  out.push('--- Bookings with stored eventId ---');
  var bookings = SheetService.getAllBookings(null);
  var verified = 0;
  var missing = 0;
  for (var i = 0; i < bookings.length; i++) {
    var b = bookings[i];
    if (!b.calendarEventId) continue;
    var existing = cal.getEventById(b.calendarEventId);
    if (existing) {
      verified++;
      try {
        out.push('  OK: ' + b.bookingId + ' | title="' + existing.getTitle() + '" | start=' + existing.getStartTime() + ' | end=' + existing.getEndTime());
      } catch (e) {
        out.push('  STUB: ' + b.bookingId + ' | getEventById returned object but getTitle failed: ' + e.message);
      }
    } else {
      missing++;
      out.push('  MISSING: ' + b.bookingId + ' storedId=' + b.calendarEventId);
    }
  }
  out.push('Stored eventIds verified in calendar: ' + verified + ', missing: ' + missing);
  Logger.log(out.join('\n'));
  return out.join('\n');
}

function testDateParsing() {
  var out = [];
  var bookings = SheetService.getAllBookings(null);
  var b = bookings[0];
  if (!b) { out.push('No bookings found.'); Logger.log(out.join('\n')); return out.join('\n'); }
  out.push('Raw booking data:');
  out.push('  bookingId=' + b.bookingId);
  out.push('  date raw=' + JSON.stringify(b.date));
  out.push('  startTime raw=' + JSON.stringify(b.startTime));
  out.push('  endTime raw=' + JSON.stringify(b.endTime));
  out.push('  typeof date=' + typeof b.date);
  out.push('  typeof startTime=' + typeof b.startTime);
  
  var dt = new Date(b.date);
  out.push('  new Date(date)=' + dt + ' | getTime=' + dt.getTime());
  
  if (typeof b.startTime !== 'string') {
    out.push('  WARNING: startTime is NOT a string! toString=' + String(b.startTime));
  }
  
  var dateStr = Utilities.formatDate(dt, CONFIG.TIMEZONE, 'yyyy-MM-dd');
  out.push('  formatted date=' + dateStr);
  
  try {
    var parsed = CalendarService.parseDateTime(dateStr, String(b.startTime));
    out.push('  parsDateTime result=' + parsed + ' | getTime=' + parsed.getTime());
  } catch (e) {
    out.push('  parseDateTime ERROR: ' + e);
  }
  
  try {
    var parsed2 = CalendarService.parseDateTime(dateStr, '09:00');
    out.push('  parseDateTime(09:00)=' + parsed2 + ' | getTime=' + parsed2.getTime());
  } catch (e) {
    out.push('  parseDateTime(09:00) ERROR: ' + e);
  }
  
  try {
    var cal = CalendarApp.getCalendarById(CalendarService.getCalendarId());
    if (cal) {
      var testStart = new Date(2026, 5, 30, 9, 0, 0);
      var testEnd = new Date(2026, 5, 30, 10, 0, 0);
      var ev = cal.createEvent('TEST-DELETE-ME', testStart, testEnd);
      out.push('  Test event created: id=' + ev.getId());
      out.push('  Test event start=' + ev.getStartTime());
      out.push('  Test event end=' + ev.getEndTime());
      ev.deleteEvent();
      out.push('  Test event deleted successfully.');
    }
  } catch (e) {
    out.push('  Test event creation ERROR: ' + e);
  }
  
  Logger.log(out.join('\n'));
  return out.join('\n');
}

function fixBrokenEvents() {
  var cal = CalendarApp.getCalendarById(CalendarService.getCalendarId());
  if (!cal) return 'Cannot access calendar.';
  var out = [];
  var bookings = SheetService.getAllBookings(null);
  var deleted = 0;
  var missing = 0;
  for (var i = 0; i < bookings.length; i++) {
    var b = bookings[i];
    if (!b.calendarEventId) continue;
    try {
      var ev = cal.getEventById(b.calendarEventId);
      if (ev) {
        var st = ev.getStartTime();
        if (st.getTime() === 0 || st.getFullYear() === 1970) {
          ev.deleteEvent();
          deleted++;
        } else {
          missing++;
        }
      } else {
        missing++;
      }
    } catch (e) {
      out.push('Error with ' + b.bookingId + ': ' + e.message);
    }
  }
  out.push('Deleted ' + deleted + ' broken (epoch) events by stored eventId. Skipped valid events: ' + missing + '.');

  var sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName(CONFIG.SHEET_BOOKINGS);
  if (sheet) {
    var data = sheet.getDataRange().getValues();
    for (var r = 1; r < data.length; r++) {
      if (String(data[r][14]).trim()) {
        sheet.getRange(r + 1, 15).setValue('');
      }
    }
    out.push('Cleared all stored calendarEventIds from sheet.');
  }

  out.push('Now running backfillCalendarEvents()...');
  Logger.log(out.join('\n'));
  return out.join('\n');
}

function fixAndBackfill() {
  var deleteResult = fixBrokenEvents();
  var backfillResult = backfillCalendarEvents();
  Logger.log(deleteResult + '\n' + backfillResult);
  return deleteResult + '\n' + backfillResult;
}
