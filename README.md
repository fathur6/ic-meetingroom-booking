# IC Meeting Room Booking

Web app for UniSZA International Centre meeting room bookings — built on Google Apps Script with Google Sheets & Calendar backend.

## Pages

| Page | URL param | Access |
|---|---|---|
| Booking | `?page=booking` | Public |
| My Bookings | `?page=my` | Public (email + booking ID) |
| Admin | `?page=admin` | Admin key required |

## Tech

- Google Apps Script (V8 runtime)
- Google Sheets (backend database)
- Google Calendar (approved bookings)
- Gmail (email notifications via APPROVAL_EMAIL alias)
- [clasp](https://github.com/google/clasp) for local dev & versioning

## Setup

See [docs/SETUP.md](docs/SETUP.md) for full deployment instructions.
