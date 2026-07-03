var CONFIG = (function () {
  var sp = PropertiesService.getScriptProperties();
  return {
    SHEET_ID: sp.getProperty('SHEET_ID') || '1PSdfrQN1xnCtPx_dGKoj7v_ttIFO1u1zN3P4-nEQQ_8',
    DEPLOYMENT_ID: sp.getProperty('DEPLOYMENT_ID') || '',
    CALENDAR_NAME: 'UGS Booking Schedule',
    CALENDAR_ID: sp.getProperty('CALENDAR_ID') || 'c_9efcafb3465e76b522ec27e40c57def79acd2fb31e8ab78fa08813b960d942f9@group.calendar.google.com',
    SCRIPT_OWNER: sp.getProperty('SCRIPT_OWNER') || '',
    APPROVAL_EMAIL: sp.getProperty('APPROVAL_EMAIL') || 'pps@unisza.edu.my',
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
    SHEET_ADMINS: 'Admins',
    GOOGLE_CLIENT_ID: sp.getProperty('GOOGLE_CLIENT_ID') || ''
  };
})();
