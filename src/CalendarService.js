var CalendarService = {
  _calendarIdCache: null,

  ensureCalendar: function () {
    var hardId = CONFIG.CALENDAR_ID;
    if (hardId) {
      try {
        var cal = CalendarApp.getCalendarById(hardId);
        if (cal) {
          this._calendarIdCache = hardId;
          return hardId;
        }
      } catch (e) {}
    }

    var name = CONFIG.CALENDAR_NAME;
    var cals = CalendarApp.getCalendarsByName(name);
    if (cals.length > 0) {
      this._calendarIdCache = cals[0].getId();
      return this._calendarIdCache;
    }

    var newCal = CalendarApp.createCalendar(name);
    this._calendarIdCache = newCal.getId();
    return this._calendarIdCache;
  },

  getCalendarId: function () {
    if (this._calendarIdCache) return this._calendarIdCache;
    return this.ensureCalendar();
  },

  shareCalendar: function () {
    var calId = this.getCalendarId();
    var shareEmail = CONFIG.APPROVAL_EMAIL;
    try {
      Calendar.Acl.insert(
        { role: 'writer', scope: { type: 'user', value: shareEmail } },
        calId
      );
      return 'Calendar shared with ' + shareEmail;
    } catch (e) {
      Logger.log('Calendar share warning: ' + e.toString());
      return 'Calendar share skipped (may already be shared): ' + e.toString();
    }
  },

  parseDateTime: function (dateStr, timeStr) {
    var parts = dateStr.split('-');
    var timeParts = timeStr.split(':');
    return new Date(
      parseInt(parts[0], 10),
      parseInt(parts[1], 10) - 1,
      parseInt(parts[2], 10),
      parseInt(timeParts[0], 10),
      parseInt(timeParts[1], 10),
      0
    );
  },

  createEvent: function (booking) {
    var cal = CalendarApp.getCalendarById(this.getCalendarId());
    if (!cal) {
      Logger.log('Cannot access calendar: ' + this.getCalendarId());
      return '';
    }
    var startDate = this.parseDateTime(booking.date, booking.startTime);
    var endDate = this.parseDateTime(booking.date, booking.endTime);

    var office = booking.office || 'IC';
    var title = '[' + office + '] - ' + (booking.purpose || 'Meeting');
    if (title.length > 200) title = title.substring(0, 197) + '...';

    var roomInfo = booking.roomName || booking.room || '';
    var desc = [
      'Booking ID: ' + booking.bookingId,
      'Name: ' + (booking.name || ''),
      'Office: ' + office,
      'Tel: ' + (booking.tel || ''),
      'Email: ' + (booking.email || ''),
      'Purpose: ' + (booking.purpose || ''),
    ];
    if (roomInfo) desc.push('Room: ' + roomInfo);
    desc = desc.join('\n');

    var event = cal.createEvent(title, startDate, endDate, { description: desc });
    event.setColor(CalendarApp.EventColor.PALE_GRAY);
    return event.getId();
  },

  updateEventColor: function (eventId, status) {
    if (!eventId) return;
    try {
      var cal = CalendarApp.getCalendarById(this.getCalendarId());
      if (!cal) return;
      var event = cal.getEventById(eventId);
      if (!event) return;
      switch (status) {
        case 'Approved':  event.setColor(CalendarApp.EventColor.GREEN); break;
        case 'Rejected':  event.setColor(CalendarApp.EventColor.PALE_RED); break;
        case 'Cancelled': event.setColor(CalendarApp.EventColor.GRAY); break;
        default:          event.setColor(CalendarApp.EventColor.PALE_GRAY); break;
      }
    } catch (e) {
      Logger.log('updateEventColor error: ' + e.toString());
    }
  },

  deleteEvent: function (eventId) {
    if (!eventId) return;
    try {
      var cal = CalendarApp.getCalendarById(this.getCalendarId());
      if (!cal) return;
      var event = cal.getEventById(eventId);
      if (event) event.deleteEvent();
    } catch (e) {
      Logger.log('Delete event warning: ' + e.toString());
    }
  },

  timeToMinutes: function (timeStr) {
    var parts = String(timeStr).split(':');
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  },

  overlaps: function (s1, e1, s2, e2) {
    var a = this.timeToMinutes(s1);
    var b = this.timeToMinutes(e1);
    var c = this.timeToMinutes(s2);
    var d = this.timeToMinutes(e2);
    return a < d && b > c;
  }
};
