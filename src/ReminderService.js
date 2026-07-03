var ReminderService = {
  checkAndSendReminders: function () {
    var now = new Date();
    var approved = SheetService.getApprovedBookings();
    var sent = 0;

    for (var i = 0; i < approved.length; i++) {
      var b = approved[i];
      var start = CalendarService.parseDateTime(b.date, b.startTime);
      var end = CalendarService.parseDateTime(b.date, b.endTime);

      if (now.getTime() - end.getTime() > 120 * 60 * 1000) continue;

      if (!SheetService.hasReminderSent(b.bookingId, '24h_user_admin')) {
        var remind24 = new Date(start.getTime() - 24 * 60 * 60 * 1000);
        if (now >= remind24) {
          try { EmailService.sendReminder24h(b); } catch (ex) { Logger.log('24h reminder: ' + ex); }
          SheetService.markReminderSent(b.bookingId, '24h_user_admin');
          sent++;
        }
      }

      if (!SheetService.hasReminderSent(b.bookingId, '1h_user')) {
        var remind1h = new Date(start.getTime() - 60 * 60 * 1000);
        if (now >= remind1h) {
          try { EmailService.sendReminder1hUser(b); } catch (ex) { Logger.log('1h user reminder: ' + ex); }
          SheetService.markReminderSent(b.bookingId, '1h_user');
          sent++;
        }
      }

      if (!SheetService.hasReminderSent(b.bookingId, '1h_admin')) {
        var remind1hAdmin = new Date(start.getTime() - 60 * 60 * 1000);
        if (now >= remind1hAdmin) {
          try { EmailService.sendReminder1hAdmin(b); } catch (ex) { Logger.log('1h admin reminder: ' + ex); }
          SheetService.markReminderSent(b.bookingId, '1h_admin');
          sent++;
        }
      }

      if (!SheetService.hasReminderSent(b.bookingId, '15min_admin')) {
        var remind15m = new Date(end.getTime() - 15 * 60 * 1000);
        if (now >= remind15m) {
          try { EmailService.sendReminder15min(b); } catch (ex) { Logger.log('15m admin reminder: ' + ex); }
          SheetService.markReminderSent(b.bookingId, '15min_admin');
          sent++;
        }
      }

      if (!SheetService.hasReminderSent(b.bookingId, 'end_user')) {
        if (now >= end) {
          try { EmailService.sendEndThankYou(b); } catch (ex) { Logger.log('End thank you: ' + ex); }
          SheetService.markReminderSent(b.bookingId, 'end_user');
          sent++;
        }
      }
    }

    Logger.log('Reminder check: ' + sent + ' reminders sent.');
    return sent + ' reminders sent.';
  }
};
