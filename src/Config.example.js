var CONFIG = (function () {
  var sp = PropertiesService.getScriptProperties();
  return {
    SHEET_ID: sp.getProperty('SHEET_ID') || 'YOUR_SHEET_ID',
    DEPLOYMENT_ID: sp.getProperty('DEPLOYMENT_ID') || '',
    CALENDAR_NAME: 'IC Booking Schedule',
    CALENDAR_ID: sp.getProperty('CALENDAR_ID') || 'YOUR_CALENDAR_ID',
    SCRIPT_OWNER: sp.getProperty('SCRIPT_OWNER') || '',
    APPROVAL_EMAIL: sp.getProperty('APPROVAL_EMAIL') || '',
    ADMIN_EMAILS: sp.getProperty('ADMIN_EMAILS') || '',
    TIMEZONE: 'Asia/Kuala_Lumpur',
    WORKDAY_NUMBERS: [0, 1, 2, 3, 4],
    START_HOUR: 8,
    END_HOUR: 17,
    LEAD_TIME_DAYS: 60,
    SLOT_MINUTES: 30,
    SHEET_BOOKINGS: 'Bookings',
    SHEET_ROOMS: 'Rooms',
    SHEET_SETTINGS: 'Settings',
    SHEET_ADMINS: 'Admins'
  };
})();
