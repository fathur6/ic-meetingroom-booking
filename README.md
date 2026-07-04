# UGS Meeting Room Booking

<a href="https://i.postimg.cc/KzVrT3PZ/Gemini-Generated-Image-521twq521twq521t.png" target="_blank">
  <img src="https://i.postimg.cc/KzVrT3PZ/Gemini-Generated-Image-521twq521twq521t.png" alt="Booking Process Flowchart" width="100%" style="max-width:900px;border-radius:8px;margin-bottom:20px">
</a>

# UGS Meeting Room Booking — Complete Process Flow

## Architecture Overview

- **Platform**: Google Apps Script (GAS) web app
- **Data storage**: Google Sheets (Bookings, Rooms, Settings, Admins, Reminders, Feedback)
- **Calendar**: Google Calendar (UGS Booking Schedule)
- **Email**: GmailApp (sender: `UGS Meeting Room <pps@unisza.edu.my>`)
- **Auth**: Google session detection (`Session.getActiveUser().getEmail()`)

## 1. User Authentication

### 1.1 Google Session Detection

When any page loads, the server evaluates `getCurrentUser()` in `Code.gs`:

```
Session.getActiveUser().getEmail()
```

For UniSZA Workspace accounts (`@unisza.edu.my`), this returns the user's email. For consumer Gmail accounts, it returns empty string (expected — GAS cannot detect non-Workspace users server-side).

### 1.2 Domain Restriction

`Index.html` checks the email immediately on page load:

```js
if (!userEmail || !userEmail.endsWith('@unisza.edu.my')) {
  showDomainModal()
}
```

If the user is not signed in with `@unisza.edu.my`, a full-screen modal appears with **"Sign in with @unisza.edu.my"** button that redirects to Google AccountChooser (`https://accounts.google.com/Logout?continue=...`). This forces the user to select/switch to their UniSZA account.

### 1.3 User Banner

Once authenticated, the header shows:
- Green dot indicator
- User email (e.g., `pps_tdakademik@unisza.edu.my`)
- **Change user** button (redirects to AccountChooser)

---

## 2. Main Dashboard (Index.html)

After sign-in, the user sees:

| Component | Description |
|-----------|-------------|
| **Book a Room** | Opens booking confirmation modal, then navigates to booking form |
| **My Bookings** | View/cancel existing bookings |
| **Admin Panel** | Manage bookings (only for admin users who know the URL) |
| **Weekly Schedule** | Interactive weekly calendar showing all 4 rooms × time slots (Sun–Sat, 07:00–18:00) |
| **Rooms Available** | List of 4 rooms with descriptions |

### 2.1 Weekly Schedule Calendar

- Fetches approved bookings from server via `getWeekBookings(weekStart)`
- Grid: 4 room columns × time slots (07:00–18:00, 30-min intervals)
- Navigation: Prev/Next week buttons, day-of-week tabs
- Bookings shown with user's name and office code in bold cyan

---

## 3. Booking a Room

### 3.1 Booking Confirmation Modal

When user clicks **Book a Room**:
1. Confirmation modal appears showing the signed-in Google account email
2. **I understand** → proceeds to booking form
3. **Change user** → redirects to AccountChooser

### 3.2 Booking Form (Booking.html)

Fields:

| Field | Type | Notes |
|-------|------|-------|
| Name | Text | Required |
| Mobile No. | Text | Required |
| Faculty / Institute / Office | Dropdown | 51 options from UniSZA staff directory (e.g., `P01 \| Pusat Pengajian Siswazah`) |
| Room | Dropdown | 4 hardcoded options |
| Date | Date picker | Must be within lead time (60 days), working days only (Sun–Thu) |
| Start Time | Dropdown | 30-min slots within 08:00–17:00 |
| End Time | Dropdown | Must be after start time |

### 3.3 Availability Check

When room and date are selected, `getAvailability(roomId, dateStr)` fetches existing bookings for that room+date. The form dynamically disables time slots that overlap with existing bookings.

### 3.4 Submission Confirmation Modal

Before server submission, a confirmation modal shows:
- Room
- Date
- Time
- Name
- Office
- Purpose

**Confirm** → calls `submitBooking(form)` on the server.
**Cancel** → closes modal, returns to editable form.

---

## 4. Server-Side Booking Submission

In `BookingService.submitBooking()`:

### 4.1 Validation

| Check | Condition | Error Message |
|-------|-----------|---------------|
| Google account | `Session.getActiveUser().getEmail()` must exist | "Could not identify your Google account" |
| Required fields | name, phone, room, date, startTime, endTime, purpose | "All fields are required" |
| Time logic | endTime > startTime | "End time must be after start time" |
| Date range | Within `LEAD_TIME_DAYS` (60) from today | "Date must be within 60 days" |
| Workday | `getDay()` in `WORKDAY_NUMBERS` [0,1,2,3,4] | "Bookings only available Sun–Thu" |
| Business hours | 08:00–17:00 | "Bookings must be between 08:00 and 17:00" |
| Overlap | No existing booking overlaps the time slot | "This time slot overlaps with an existing booking" |

### 4.2 Concurrency Lock

A `LockService.getDocumentLock()` is acquired (8s wait) to prevent double-booking from simultaneous submissions.

### 4.3 Calendar Event Creation

```javascript
CalendarService.createEvent(booking)
```

Creates a calendar event on the **UGS Booking Schedule** calendar with:
- **Title**: `[Office] - Purpose`
- **Description**: Booking ID, Name, Office, Tel, Email, Purpose, Room
- **Color**: Room-specific (UGS-MR=lavender, UGS-DR=turquoise, UGS-VR1=grape, UGS-VR2=berry)
- **Attendee**: user's email
- **Transparency**: `transparent` (pending — shows as available in calendar)
- **SendUpdates**: all attendees

Falls back to `CalendarApp.createEvent()` if the Advanced Calendar API fails.

### 4.4 Database Insertion

```javascript
SheetService.addBooking(booking)
```

Row written to **Bookings** sheet:

| Column | Value |
|--------|-------|
| A: BookingID | `UGS-YYYYMMDD-NNNN` (auto-generated) |
| B: Timestamp | Current datetime |
| C: Name | From form |
| D: Office | From form |
| E: Tel | From form |
| F: Email | From `Session.getActiveUser().getEmail()` |
| G: Room | From form |
| H: Date | From form |
| I: StartTime | From form |
| J: EndTime | From form |
| K: Purpose | From form |
| L: Status | `Pending` |
| M: DecisionBy | (empty until admin action) |
| N: DecisionAt | (empty until admin action) |
| O: CalendarEventId | From Calendar API |
| P: Notes | (empty) |

### 4.5 Emails Sent on Submission

**1. Receipt to User** (`EmailService.sendReceipt`):
- To: `booking.email`
- Subject: `Booking Received: {bookingId} — UGS Meeting Room`
- Body: Booking ID, Room (formatted), Date (formatted as `Sunday, 5 July 2026`), Time, Purpose
- Message: "You will be notified within 1 working day once your booking is reviewed."

**2. Admin Notice** (`EmailService.sendAdminNotice`):
- To: First admin email
- BCC: All other admins
- Subject: `New Booking: {bookingId} — Needs Approval`
- Body: Booking ID, Name, Office, Email, Room, Date, Time, Purpose
- Includes **Go to Admin Panel** button

---

## 5. Admin Approval/Rejection

### 5.1 Admin Panel (Admin.html)

Tabs: **Pending** | **Approved** | **Rejected** | **Deleted** | **Admins**

Each admin is stored in the **Admins** sheet with Email, Role, and Name.

### 5.2 Approve Booking

In `AdminService.approveBooking()`:

1. **Validate**: Booking exists, status is `Pending`
2. **Calendar update**: `updateEventColor()` — changes transparency to `opaque` and sets room-specific color
3. **Sheet update**: `updateBookingStatus()` — status → `Approved`, decisionBy → `Admin`, decisionAt → now
4. **Email**: `sendApproval()` to user

**Approval Email** (`EmailService.sendApproval`):
- To: user email
- Subject: `Booking Approved: {bookingId} — UGS Meeting Room`
- Body: Booking ID, Room, Date, Time, Notes
- Message: "Your booking has been approved and added to the UGS Booking Schedule calendar."

### 5.3 Reject Booking

In `AdminService.rejectBooking()`:

1. **Validate**: Booking exists, status is `Pending`
2. **Calendar**: `deleteEvent()` — removes the pending calendar event
3. **Sheet update**: status → `Rejected`, notes → reason
4. **Email**: `sendRejection()` to user

**Rejection Email** (`EmailService.sendRejection`):
- To: user email
- Subject: `Booking Update: {bookingId} — UGS Meeting Room`
- Body: Booking ID, Room, Date, Time, Reason
- Message: "Unfortunately your booking could not be accommodated."

### 5.4 Edit Booking (Admin)

In `AdminService.updateBooking()`:

1. **Validate**: Status is `Approved` or `Pending`
2. **Sheet**: `updateBookingFields()` — updates Room, Date, StartTime, EndTime, Purpose
3. **Calendar**: If `Approved`, deletes old event and creates new event with updated details

### 5.5 Delete Booking (Admin)

In `AdminService.deleteBooking()`:

1. **Validate**: Status is `Approved` or `Pending`
2. **Calendar**: `deleteEvent()` — removes calendar event
3. **Sheet**: status → `Deleted`, notes → "Deleted by admin"

---

## 6. Email Reminder System

A time-driven trigger runs `processReminders()` every 5 minutes. It scans all approved bookings and sends reminders at scheduled intervals.

### 6.1 Reminder Timing

| Reminder | Trigger Time | Recipient | Purpose |
|----------|-------------|-----------|---------|
| 24h | 24 hours before start | User + Admin | "Your booking is tomorrow" |
| 1h User | 1 hour before start | User | "Your booking starts in 1 hour" |
| 1h Admin | 1 hour before start | Admin | "Room preparation needed" |
| 15min | 15 minutes before end | Admin | "Room closing reminder" |
| End | At end time | User | "Thank you + feedback link" |

### 6.2 Deduplication

Each reminder type is tracked in the **Reminders** sheet (BookingID, ReminderType, SentAt). `hasReminderSent()` checks before sending to prevent duplicate reminders.

### 6.3 Reminder Content

**24h Reminder** (`sendReminder24h`):
- To: user + admin
- Subject: `Reminder: {bookingId} tomorrow — UGS Meeting Room`
- Body: Booking ID, Room, Date, Time
- Includes **My Bookings** button

**1h User Reminder** (`sendReminder1hUser`):
- To: user
- Subject: `Reminder: {bookingId} starts in 1 hour — UGS Meeting Room`
- Body: Booking ID, Room, Time
- Includes **My Bookings** button

**1h Admin — Room Prep** (`sendReminder1hAdmin`):
- To: admin(s)
- Subject: `Room Prep: {bookingId} starts in 1 hour — {Room}`
- Body: Booking ID, Room, Time, Purpose
- Checklist: Turn on AC/lights, equipment check, room cleanliness

**15min Admin — Room Closing** (`sendReminder15min`):
- To: admin(s)
- Subject: `Room Closing: {bookingId} ends in 15 min — {Room}`
- Body: Booking ID, Room, Name
- Checklist: Turn off AC/lights, switch off equipment, leave room tidy

**End — Thank You** (`sendEndThankYou`):
- To: user
- Subject: `Thank you for using the meeting room — UGS Meeting Room`
- Body: Booking ID, Room, Date, Time
- Includes **Give Feedback** button (links to `?page=feedback&bid={bookingId}`)

---

## 7. Feedback Process

### 7.1 Feedback Page (Feedback.html)

After a booking ends, the user receives a **Thank You** email with a **Give Feedback** button linking to:

```
https://{deploymentUrl}?page=feedback&bid={bookingId}
```

### 7.2 Feedback Form

Ratings (1–5 stars):
- Readiness of meeting room
- Cleanliness of meeting room
- Staff performance

Plus optional comments.

### 7.3 Duplicate Prevention

`SheetService.getFeedbackByBookingId(bookingId)` checks if feedback already exists. If so, the page shows "Feedback already submitted."

### 7.4 Storage

Feedback is stored in the **Feedback** sheet:

| Column | Value |
|--------|-------|
| A: BookingID | From URL parameter |
| B: Timestamp | Current datetime |
| C: Name | From booking record |
| D: Office | From booking record |
| E: Room | From booking record |
| F: EventDate | From booking record |
| G: StartTime | From booking record |
| H: EndTime | From booking record |
| I: Readiness | Rating 1-5 |
| J: Cleanliness | Rating 1-5 |
| K: Staff | Rating 1-5 |
| L: Comments | Free text |

---

## 8. Cancellation Flow

### 8.1 My Bookings Page (MyBookings.html)

- Auto-detects user email from Google session (same as dashboard)
- Regular users: see only their own bookings
- Admin users: see ALL bookings

### 8.2 Cancel by User

In `BookingService.cancelMyBooking()`:

1. **Validate**: Email matches signed-in user, status is `Pending` or `Approved`
2. **Calendar**: `deleteEvent()` — removes calendar event
3. **Sheet**: status → `Cancelled`, decisionBy → user email, notes → "Cancelled by user"

### 8.3 Emails on Cancellation

**Cancellation to User** (`sendCancellationToUser`):
- To: user
- Subject: `Booking Cancelled: {bookingId} — UGS Meeting Room`
- Body: Booking ID, Room, Date, Time, Purpose

**Cancellation to Admin** (`sendCancellationNotice`):
- To: admin(s)
- Subject: `Booking Cancelled by User: {bookingId}`
- Body: Name, Email, Room, Date, Time
- Includes **Go to Admin Panel** button

---

## 9. Booking States & Transitions

```
User submits → Pending
                ↓
        ┌── Approve → Approved
        │
    Admin┼── Reject  → Rejected
        │
        └── Delete   → Deleted

User cancels → Cancelled
(any status except Rejected/Deleted/Cancelled)

Admin edits → Stay in current status
(Approved → calendar recreated)
```

---

## 10. Calendar Integration

### 10.1 Calendar: UGS Booking Schedule

All events are created on this Google Calendar. The calendar is shared with `CONFIG.APPROVAL_EMAIL` as a writer.

### 10.2 Event Colors by Room

| Room | Color |
|------|-------|
| UGS Meeting Room (UGS-MR) | Lavender (#9) |
| UGS Discussion Room (UGS-DR) | Turquoise (#10) |
| Viva Room 1 (UGS-VR1) | Grape (#3) |
| Viva Room 2 (UGS-VR2) | Berry (#4) |

### 10.3 Event Transparency

| Status | Transparency |
|--------|-------------|
| Pending | `transparent` (shows as free/busy? = available) |
| Approved | `opaque` (shows as busy) |

---

## 11. Weekly Schedule Calendar (Dashboard)

- **Data source**: `getWeekBookings(weekStart)` → `SheetService.getApprovedBookingsForWeek()` → filters by `status=Approved` and date range
- **Render**: Client-side CSS Grid with explicit `grid-column`/`grid-row` positioning
- **Rooms**: 4 columns (UGS Meeting Room, UGS Discussion Room, Viva Room 1, Viva Room 2)
- **Hours**: 07:00–18:00 (22 × 30-min slots)
- **Navigation**: Prev/Next week buttons, day-of-week tabs (auto-selects first future-or-today day)
- **Booking display**: User name + office code, repeated in each covered time slot

---

## 12. Configuration

All configurable parameters are in `Config.example.js` (and overridable via Script Properties):

| Key | Default | Purpose |
|-----|---------|---------|
| `SHEET_ID` | (set via setup) | Google Sheet ID |
| `CALENDAR_ID` | (set via setup) | Google Calendar ID |
| `CALENDAR_NAME` | UGS Booking Schedule | Calendar display name |
| `APPROVAL_EMAIL` | (set via setup) | Email sender + calendar sharer |
| `TIMEZONE` | Asia/Kuala_Lumpur | Timezone for all date/time operations |
| `WORKDAY_NUMBERS` | [0,1,2,3,4] | Sunday–Thursday |
| `START_HOUR` | 8 | Operating hours start |
| `END_HOUR` | 17 | Operating hours end |
| `LEAD_TIME_DAYS` | 60 | Maximum advance booking |
| `SLOT_MINUTES` | 30 | Booking slot increment |
| `DEPLOYMENT_ID` | (set via clasp) | GAS deployment ID |

---

## 13. Error Handling

- Concurrency: `LockService.getDocumentLock()` prevents double-booking
- Calendar fallback: Advanced Calendar API → `CalendarApp.createEvent()`
- Email fallback: If `from` address fails, re-sends without custom from
- All email sends wrapped in try/catch with `Logger.log` on failure
- All external API calls wrapped in try/catch with graceful degradation

---

## 14. Trigger Configuration

- **Function**: `processReminders()`
- **Type**: Time-driven, every 5 minutes
- **Setup**: `setupReminderTrigger()` creates the trigger automatically during system setup
