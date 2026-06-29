var BookingService = {
  getAvailability: function (roomId, dateStr) {
    var existing = SheetService.getBookingsByDateAndRoom(dateStr, roomId);
    var busy = [];
    for (var i = 0; i < existing.length; i++) {
      busy.push({
        startTime: existing[i].startTime,
        endTime: existing[i].endTime,
        status: existing[i].status
      });
    }
    return {
      room: roomId,
      date: dateStr,
      busySlots: busy,
      workdayMask: CONFIG.WORKDAY_NUMBERS,
      startHour: CONFIG.START_HOUR,
      endHour: CONFIG.END_HOUR,
      slotMinutes: CONFIG.SLOT_MINUTES,
      timezone: CONFIG.TIMEZONE
    };
  },

  submitBooking: function (form) {
    if (!form.name || !form.email || !form.phone || !form.room || !form.date || !form.startTime || !form.endTime || !form.purpose) {
      return { success: false, message: 'All fields are required.' };
    }

    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      return { success: false, message: 'Invalid email address.' };
    }

    if (CalendarService.timeToMinutes(form.startTime) >= CalendarService.timeToMinutes(form.endTime)) {
      return { success: false, message: 'End time must be after start time.' };
    }

    var today = new Date();
    var maxDate = new Date(today);
    maxDate.setDate(today.getDate() + CONFIG.LEAD_TIME_DAYS);

    var dateParts = form.date.split('-');
    var selectedDate = new Date(parseInt(dateParts[0], 10), parseInt(dateParts[1], 10) - 1, parseInt(dateParts[2], 10));

    var todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    var maxStart = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate());

    if (selectedDate < todayStart || selectedDate > maxStart) {
      return { success: false, message: 'Date must be within ' + CONFIG.LEAD_TIME_DAYS + ' days from today.' };
    }

    var day = selectedDate.getDay();
    if (CONFIG.WORKDAY_NUMBERS.indexOf(day) === -1) {
      return { success: false, message: 'Bookings are only available Sunday to Thursday.' };
    }

    var sm = CalendarService.timeToMinutes(form.startTime);
    var em = CalendarService.timeToMinutes(form.endTime);
    var sh = CONFIG.START_HOUR * 60;
    var eh = CONFIG.END_HOUR * 60;
    if (sm < sh || em > eh) {
      return { success: false, message: 'Bookings must be between ' + String(CONFIG.START_HOUR).padStart(2, '0') + ':00 and ' + String(CONFIG.END_HOUR).padStart(2, '0') + ':00.' };
    }

    var lock = LockService.getDocumentLock();
    var acquired = false;
    try {
      lock.waitLock(8000);
      acquired = true;

      var existing = SheetService.getBookingsByDateAndRoom(form.date, form.room);
      for (var i = 0; i < existing.length; i++) {
        if (CalendarService.overlaps(form.startTime, form.endTime, existing[i].startTime, existing[i].endTime)) {
          return { success: false, message: 'This time slot overlaps with an existing booking (' + existing[i].startTime + '–' + existing[i].endTime + '). Please choose another slot.' };
        }
      }

      var bookingId = SheetService.generateBookingId();
      var booking = {
        bookingId: bookingId,
        name: form.name,
        office: form.office || '',
        tel: form.phone || '',
        email: form.email,
        room: form.room,
        roomName: form.roomName || form.room,
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
        purpose: form.purpose
      };

      SheetService.addBooking(booking);

      try { EmailService.sendReceipt(booking); } catch (e) { Logger.log('Receipt email failed: ' + e); }
      try { EmailService.sendAdminNotice(booking); } catch (e) { Logger.log('Admin notice failed: ' + e); }

      return { success: true, bookingId: bookingId, message: 'Booking submitted. You will be emailed within 1 working day.' };
    } finally {
      if (acquired) lock.releaseLock();
    }
  },

  cancelMyBooking: function (bookingId, email) {
    var result = SheetService.cancelBooking(bookingId, email);
    if (result.success) {
      try { EmailService.sendCancellationNotice(result.booking); } catch (e) {}
    }
    return result;
  }
};
