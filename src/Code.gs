var APP_TITLE = 'IC Meeting Room Booking';

function doGet(e) {
  var page = e && e.parameter && e.parameter.page ? e.parameter.page : 'index';
  var fileMap = {
    'index': 'Index',
    'booking': 'pages/Booking',
    'my': 'pages/MyBookings',
    'admin': 'pages/Admin'
  };
  var titleMap = {
    'index': APP_TITLE,
    'booking': APP_TITLE,
    'my': 'My Bookings — ' + APP_TITLE,
    'admin': 'Admin — ' + APP_TITLE
  };

  var file = fileMap[page] || fileMap['index'];
  var title = titleMap[page] || APP_TITLE;

  return HtmlService.createTemplateFromFile(file)
    .evaluate()
    .setTitle(title)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function getDeploymentUrl() {
  var id = CONFIG.DEPLOYMENT_ID || PropertiesService.getScriptProperties().getProperty('DEPLOYMENT_ID') || '';
  if (!id) return '';
  return 'https://script.google.com/a/macros/unisza.edu.my/s/' + id + '/exec';
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

function getAuthUrl() {
  try {
    return ScriptApp.getAuthorizationInfo(ScriptApp.AuthMode.FULL).getAuthorizationUrl();
  } catch (ex) {
    return '';
  }
}

function setup(sheetId, approvalEmail) {
  if (!sheetId) sheetId = 'YOUR_SHEET_ID';
  if (!approvalEmail) approvalEmail = 'YOUR_EMAIL';

  var adminEmails = '';
  try { adminEmails = Session.getActiveUser().getEmail() + ',' + approvalEmail; } catch (ex) {}
  PropertiesService.getScriptProperties().setProperties({
    'SHEET_ID': sheetId,
    'APPROVAL_EMAIL': approvalEmail,
    'ADMIN_EMAILS': adminEmails,
    'CALENDAR_ID': 'YOUR_CALENDAR_ID',
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
    return {
      success: true,
      message: 'Setup complete. Calendar: ' + calId + '. ' + shareResult,
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

function getMyBookings() {
  return BookingService.getMyBookings();
}

function cancelMyBooking(bookingId, email) {
  return BookingService.cancelMyBooking(bookingId, email);
}

function getDashboard(adminKey) {
  return AdminService.getDashboard(adminKey);
}

function approveBooking(bookingId, adminKey, notes) {
  return AdminService.approveBooking(bookingId, adminKey, notes);
}

function rejectBooking(bookingId, adminKey, reason) {
  return AdminService.rejectBooking(bookingId, adminKey, reason);
}

function getBookingById(bookingId) {
  return SheetService.getBookingById(bookingId);
}
