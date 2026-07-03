var ROOM_COLORS = {
  'UGS-MR': '9',
  'UGS-DR': '10',
  'UGS-VR1': '3',
  'UGS-VR2': '4'
};

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

  getRoomColor: function (roomId) {
    return ROOM_COLORS[roomId] || '8';
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

  _formatISO: function (dt) {
    return Utilities.formatDate(dt, CONFIG.TIMEZONE, "yyyy-MM-dd'T'HH:mm:ss");
  },

  createEvent: function (booking) {
    var calId = this.getCalendarId();
    var startDate = this.parseDateTime(booking.date, booking.startTime);
    var endDate = this.parseDateTime(booking.date, booking.endTime);

    var office = booking.office || 'UGS';
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

    var colorId = this.getRoomColor(booking.room);

    try {
      var eventOpts = {
        summary: title,
        description: desc,
        start: { dateTime: this._formatISO(startDate), timeZone: CONFIG.TIMEZONE },
        end: { dateTime: this._formatISO(endDate), timeZone: CONFIG.TIMEZONE },
        colorId: colorId,
        transparency: 'transparent'
      };

      if (booking.email) {
        eventOpts.attendees = [{ email: booking.email }];
      }

      var event = Calendar.Events.insert(eventOpts, calId, { sendUpdates: 'all' });
      return event.id;
    } catch (e) {
      Logger.log('Calendar.Events.insert error: ' + e.toString());
      try {
        var cal = CalendarApp.getCalendarById(calId);
        if (cal) {
          var ev = cal.createEvent(title, startDate, endDate, { description: desc });
          ev.setColor(CalendarApp.EventColor.GRAY);
          return ev.getId();
        }
      } catch (e2) {
        Logger.log('CalendarApp createEvent fallback error: ' + e2.toString());
      }
      return '';
    }
  },

  updateEventColor: function (eventId, status, roomId) {
    if (!eventId) return;
    try {
      var calId = this.getCalendarId();
      if (status === 'Approved') {
        var patch = { transparency: 'opaque' };
        if (roomId) patch.colorId = this.getRoomColor(roomId);
        Calendar.Events.patch(patch, calId, eventId);
      }
    } catch (e) {
      Logger.log('Calendar.Events.patch error: ' + e.toString());
      try {
        var cal = CalendarApp.getCalendarById(this.getCalendarId());
        if (!cal) return;
        var event = cal.getEventById(eventId);
        if (!event) return;
        event.setColor(status === 'Approved' ? CalendarApp.EventColor.GREEN : CalendarApp.EventColor.GRAY);
      } catch (e2) {
        Logger.log('CalendarApp updateEvent fallback error: ' + e2.toString());
      }
    }
  },

  prefixEventTitle: function (eventId, prefix) {
    if (!eventId) return;
    try {
      var cal = CalendarApp.getCalendarById(this.getCalendarId());
      if (!cal) return;
      var event = cal.getEventById(eventId);
      if (!event) return;
      var title = event.getTitle();
      var tag = '[' + prefix + ']';
      if (title.indexOf(tag) === -1) {
        event.setTitle(tag + ' ' + title);
      }
    } catch (e) {
      Logger.log('prefixEventTitle error: ' + e.toString());
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
