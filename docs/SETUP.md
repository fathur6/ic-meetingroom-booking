# Setup Guide — IC Meeting Room Booking

## Prerequisites

- Google Account: `fathurrahman@unisza.edu.my` (script owner)
- Node.js (for clasp CLI)
- Google Sheets backend: https://docs.google.com/spreadsheets/d/1uHAoStcJRcItncRHjro8eWDj4wZBTwitSy1lUx2DhPE/edit
- Existing Apps Script project: `1XXBAnI3jyKTTVBkTtWvlAfBjnbSjC_PAg9GWIEajN_BaJ3A_hwSdWNjA`
- Existing web app deployment: `AKfycbzxMaFsVw31onceNdX1Xi2UuWGK579VwVtW35mxMyrDrpFL5Dq8AAHbEHmLw-Y0ykeUUw`

---

## 1. Install clasp

```bash
npm install -g @google/clasp
```

## 2. Login to Google

```bash
clasp login
```

Sign in as `fathurrahman@unisza.edu.my`.

## 3. Push code to Apps Script

The `.clasp.json` and `appsscript.json` in this repo are pre-configured.

```bash
clasp push
```

This uploads all files from `src/` into the Apps Script project.

## 4. Enable Calendar API advanced service

1. Open the Apps Script editor:
   ```bash
   clasp open
   ```
2. In the editor, click **Services** (the `+` icon in the left sidebar).
3. Add **Google Calendar API** (v3).
4. The `userSymbol` must be **`Calendar`** (already set in `appsscript.json`).

## 5. Run setup once

In the Apps Script editor:

1. Select function `setup` from the dropdown.
2. Click **Run**.
3. Grant permissions when prompted (Sheets, Calendar, Gmail).
4. You should see a success log in View → Logs:
   ```
   Setup complete. Calendar ID: xxxxx@group.calendar.google.com. Calendar shared with nasarudinsaleh@unisza.edu.my
   ```

This will:
- Create/verify the 4 sheet tabs: `Bookings`, `Rooms`, `Settings`, `Admins`
- Seed `Rooms` with 3 starter rooms
- Seed `Settings` with defaults (admin key: `ic-admin-2026`)
- Seed `Admins` with `fathurrahman@unisza.edu.my` and `nasarudinsaleh@unisza.edu.my`
- Find or create the Google Calendar **"IC Booking Schedule"**
- Share the calendar with `nasarudinsaleh@unisza.edu.my` (writer access)

## 6. Set Gmail "Send mail as" alias

This is **critical** — without it, emails will fail or come from the wrong address.

On `fathurrahman@unisza.edu.my`'s Gmail account:

1. Open [Gmail](https://mail.google.com).
2. Click the gear icon (top-right) → **See all settings**.
3. Go to the **Accounts and Import** tab.
4. In the **Send mail as** section, click **Add another email address**.
5. A popup will appear. Fill in:
   - **Name**: `IC Meeting Room`
   - **Email address**: `nasarudinsaleh@unisza.edu.my`
   - Leave "Treat as an alias" checked.
6. Click **Next Step**.
7. Gmail will send a verification code to `nasarudinsaleh@unisza.edu.my`.
8. Go to nasarudinsaleh's inbox, find the verification email, copy the code.
9. Enter the code in the popup, click **Verify**.
10. Done — `fathurrahman@unisza.edu.my` can now send emails **as** `nasarudinsaleh@unisza.edu.my`.

This allows `EmailService` to use `GmailApp.sendEmail({from: 'nasarudinsaleh@unisza.edu.my'})` — all booking notifications will appear to come from nasarudinsaleh.

## 7. Update web app deployment

```bash
clasp deploy -i AKfycbzxMaFsVw31onceNdX1Xi2UuWGK579VwVtW35mxMyrDrpFL5Dq8AAHbEHmLw-Y0ykeUUw
```

This updates the **existing** deployment (same URL, new version). No new deployment is created.

If you want a version description:

```bash
clasp deploy -i AKfycbzxMaFsVw31onceNdX1Xi2UuWGK579VwVtW35mxMyrDrpFL5Dq8AAHbEHmLw-Y0ykeUUw -d "v1.0 dark theme"
```

## 8. Access the app

The web app URL stays the same. You can also open the latest version directly via:

```bash
clasp open --webapp
```

Add `?page=booking` / `?page=my` / `?page=admin` as needed.

---

## Post-setup: change admin key

1. Open the Google Sheet.
2. Go to the `Settings` tab.
3. Find row with Key = `adminKey`.
4. Change the Value to your preferred admin passphrase.
5. This key is required to access the admin page.

---

## Updating code

1. Edit files in `src/`.
2. `clasp push`
3. `clasp deploy -i AKfycbzxMaFsVw31onceNdX1Xi2UuWGK579VwVtW35mxMyrDrpFL5Dq8AAHbEHmLw-Y0ykeUUw`

---

## Calendar sharing (manual check)

If the automatic sharing in `setup()` doesn't work (e.g. permissions issue with Calendar API), share manually:

1. Open Google Calendar as `fathurrahman@unisza.edu.my`.
2. Find **IC Booking Schedule**.
3. Settings → Share with specific people → Add `nasarudinsaleh@unisza.edu.my` with **Make changes to events** permission.

---

## Rooms management

Edit the `Rooms` tab in the sheet directly:

| RoomID | RoomName | Active | Description |
|---|---|---|---|
| MR-01 | Meeting Room 1 | Yes | Main meeting room |
| MR-02 | Meeting Room 2 | Yes | Secondary meeting room |

Set `Active` to `No` to hide a room from the booking form. Add new rows for additional rooms.

---

## Email aliases

If you change who sends notification emails, update:

1. Google Sheet → `Settings` → Key `approvalEmail` → new email address.
2. Gmail → set up "Send mail as" alias on the script owner's account for the new email.

---

## Troubleshooting

| Issue | Fix |
|---|---|
| "Cannot read property 'getSheetByName'" | Open the Google Sheet at least once to grant access |
| "Invalid from address" in email | Set up Gmail "Send mail as" alias (step 6) |
| Admin page shows "Invalid admin key" | Check `Settings` tab for `adminKey` value |
| Calendar events not appearing | Run `setup()` again; check Calendar API is enabled |
| clasp push fails with "No script ID" | Verify `.clasp.json` has correct `scriptId` |
| Anonymous user can't submit booking | In Apps Script editor, deploy as `Execute as: Me, Who has access: Anyone` |
