# UGS Meeting Room Booking

<a href="https://i.postimg.cc/KzVrT3PZ/Gemini-Generated-Image-521twq521twq521t.png" target="_blank">
  <img src="https://i.postimg.cc/KzVrT3PZ/Gemini-Generated-Image-521twq521twq521t.png" alt="Booking Process Flowchart" width="100%" style="max-width:900px;border-radius:8px;margin-bottom:20px">
</a>

Web app for UniSZA Graduate School (Pusat Pengajian Siswazah) meeting room bookings — built on Google Apps Script with Google Sheets & Calendar backend.

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
