# UGS Meeting Room Booking

Web app for UniSZA Graduate School (Pusat Pengajian Siswazah) meeting room bookings — built on Google Apps Script with Google Sheets & Calendar backend.

![Booking Process Flowchart](docs/booking-flowchart.png)

> Full documentation: [docs/BOOKING_PROCESS_FLOW.md](docs/BOOKING_PROCESS_FLOW.md)

## Pages

| Page | URL param | Access |
|---|---|---|
| Booking | `?page=booking` | Public |
| My Bookings | `?page=my` | Public (email + booking ID) |
| Admin | `?page=admin` | Admin key required |

## Rooms

| Room ID | Room Name | Description |
|---|---|---|
| UGS-MR | UGS Meeting Room | Bilik Mesyuarat PPS |
| UGS-DR | UGS Discussion Room | Bilik Perbincangan PPS |
| UGS-VR1 | Viva Room 1 | Bilik Viva 1 |
| UGS-VR2 | Viva Room 2 | Bilik Viva 2 |

## Tech

- Google Apps Script (V8 runtime)
- Google Sheets (backend database)
- Google Calendar (approved bookings)
- Gmail (email notifications via pps@unisza.edu.my)
- [clasp](https://github.com/google/clasp) for local dev & versioning

## Setup

See [docs/SETUP.md](docs/SETUP.md) for full deployment instructions.
