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
  return 'https://script.google.com/a/macros/unisza.edu.my/s/AKfycbzxMaFsVw31onceNdX1Xi2UuWGK579VwVtW35mxMyrDrpFL5Dq8AAHbEHmLw-Y0ykeUUw/exec';
}

function getCurrentUser() {
  var email = '';
  try { email = Session.getActiveUser().getEmail(); } catch (ex) {}
  return email || '';
}

function setup(sheetId, approvalEmail) {
  if (!sheetId) sheetId = '1uHAoStcJRcItncRHjro8eWDj4wZBTwitSy1lUx2DhPE';
  if (!approvalEmail) approvalEmail = 'nasarudinsaleh@unisza.edu.my';

  PropertiesService.getScriptProperties().setProperties({
    'SHEET_ID': sheetId,
    'APPROVAL_EMAIL': approvalEmail,
    'ADMIN_EMAILS': 'fathurrahman@unisza.edu.my,' + approvalEmail,
    'SCRIPT_OWNER': Session.getActiveUser().getEmail() || 'fathurrahman@unisza.edu.my',
    'DEPLOYMENT_ID': 'AKfycbzxMaFsVw31onceNdX1Xi2UuWGK579VwVtW35mxMyrDrpFL5Dq8AAHbEHmLw-Y0ykeUUw'
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
