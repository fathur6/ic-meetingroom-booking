# Graph Report - .  (2026-07-07)

## Corpus Check
- Corpus is ~11,607 words - fits in a single context window. You may not need a graph.

## Summary
- 66 nodes · 60 edges · 15 communities
- Extraction: 78% EXTRACTED · 22% INFERRED · 0% AMBIGUOUS · INFERRED: 13 edges (avg confidence: 0.83)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_User Pages & Auth|User Pages & Auth]]
- [[_COMMUNITY_App Script Config|App Script Config]]
- [[_COMMUNITY_Core Architecture|Core Architecture]]
- [[_COMMUNITY_Runtime Config|Runtime Config]]
- [[_COMMUNITY_Calendar & Rooms|Calendar & Rooms]]
- [[_COMMUNITY_Booking Workflow|Booking Workflow]]
- [[_COMMUNITY_UI Theme System|UI Theme System]]

## God Nodes (most connected - your core abstractions)
1. `UGS Meeting Room Booking System` - 6 edges
2. `Home Page / Navigation Hub` - 6 edges
3. `Booking Form Page` - 5 edges
4. `Approve/Reject Booking Workflow` - 5 edges
5. `My Bookings Page` - 5 edges
6. `Setup & Deployment Procedure` - 4 edges
7. `Google Identity Services Integration` - 4 edges
8. `webapp` - 3 edges
9. `webapp` - 3 edges
10. `Admin Panel Page` - 3 edges

## Surprising Connections (you probably didn't know these)
- `Embedded Google Calendar View` --references--> `Google Calendar Integration`  [INFERRED]
  src/Index.html → README.md
- `Gmail Send-As Alias Requirement` --rationale_for--> `Gmail Email Notifications`  [INFERRED]
  docs/SETUP.md → README.md
- `Rooms Configuration (UGS-MR, UGS-DR, UGS-VR1, UGS-VR2)` --conceptually_related_to--> `Room Info Display Cards`  [INFERRED]
  README.md → src/Index.html
- `30-Minute Slot Grid Visualization` --semantically_similar_to--> `Approve/Reject Booking Workflow`  [INFERRED] [semantically similar]
  src/pages/Booking.html → src/pages/Admin.html
- `Google Identity Services Integration` --conceptually_related_to--> `UniSZA SSO Login Page Capture`  [INFERRED]
  src/pages/_header.html → .playwright-mcp/page-2026-07-01T03-51-24-024Z.yml

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Booking Lifecycle Pipeline** — src_pages_Booking_html_booking_form, src_pages_Admin_html_approve_reject, src_pages_MyBookings_html_my_bookings, src_pages_Feedback_html_feedback_form [INFERRED 0.85]
- **Shared Page Infrastructure** — src_pages__header_html_google_identity, src_pages__header_html_user_banner, src_pages__styles_html_design_tokens, src_pages__styles_html_shared_ui [INFERRED 0.95]
- **Google Backend Stack** — README_md_google_apps_script, README_md_google_sheets_backend, README_md_google_calendar, README_md_gmail_notifications, README_md_clasp_cli [EXTRACTED 1.00]

## Communities (15 total, 0 thin omitted)

### Community 0 - "User Pages & Auth"
Cohesion: 0.20
Nodes (10): UniSZA SSO Login Page Capture, Google Authorization Flow, Feedback Form Page, 6-Point Likert Rating System, Cancel Booking Workflow, Email-Based Manual Booking Lookup, My Bookings Page, Google Identity Services Integration (+2 more)

### Community 1 - "App Script Config"
Cohesion: 0.20
Nodes (9): dependencies, enabledAdvancedServices, exceptionLogging, oauthScopes, runtimeVersion, timeZone, webapp, access (+1 more)

### Community 2 - "Core Architecture"
Cohesion: 0.25
Nodes (9): clasp CLI Deployment Tool, Gmail Email Notifications, Google Apps Script Runtime, Google Sheets Backend Database, UGS Meeting Room Booking System, Admin Key Security Pattern, Calendar Sharing with pps@unisza.edu.my, Gmail Send-As Alias Requirement (+1 more)

### Community 3 - "Runtime Config"
Cohesion: 0.22
Nodes (8): dependencies, enabledAdvancedServices, exceptionLogging, runtimeVersion, timeZone, webapp, access, executeAs

### Community 4 - "Calendar & Rooms"
Cohesion: 0.25
Nodes (8): Google Calendar Integration, Rooms Configuration (UGS-MR, UGS-DR, UGS-VR1, UGS-VR2), Embedded Google Calendar View, Home Page / Navigation Hub, Navigation Card UI Pattern, Room Info Display Cards, Admin CRUD Management, Admin Panel Page

### Community 5 - "Booking Workflow"
Cohesion: 0.40
Nodes (6): Approve/Reject Booking Workflow, Reject Booking with Reason Modal, Real-Time Availability Check, Booking Form Page, First Visit Intro Modal, 30-Minute Slot Grid Visualization

### Community 7 - "UI Theme System"
Cohesion: 0.67
Nodes (3): Cyber/Neon Dark Design Aesthetic, CSS Custom Property Design Tokens, Shared UI Component Classes

## Knowledge Gaps
- **25 isolated node(s):** `timeZone`, `enabledAdvancedServices`, `access`, `executeAs`, `exceptionLogging` (+20 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Home Page / Navigation Hub` connect `Calendar & Rooms` to `User Pages & Auth`, `Booking Workflow`?**
  _High betweenness centrality (0.139) - this node is a cross-community bridge._
- **Why does `UGS Meeting Room Booking System` connect `Core Architecture` to `Calendar & Rooms`?**
  _High betweenness centrality (0.100) - this node is a cross-community bridge._
- **Why does `Booking Form Page` connect `Booking Workflow` to `User Pages & Auth`, `Calendar & Rooms`?**
  _High betweenness centrality (0.076) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `Home Page / Navigation Hub` (e.g. with `Admin Panel Page` and `Booking Form Page`) actually correct?**
  _`Home Page / Navigation Hub` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `Booking Form Page` (e.g. with `Home Page / Navigation Hub` and `Approve/Reject Booking Workflow`) actually correct?**
  _`Booking Form Page` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `Approve/Reject Booking Workflow` (e.g. with `My Bookings Page` and `Booking Form Page`) actually correct?**
  _`Approve/Reject Booking Workflow` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `My Bookings Page` (e.g. with `Home Page / Navigation Hub` and `Approve/Reject Booking Workflow`) actually correct?**
  _`My Bookings Page` has 3 INFERRED edges - model-reasoned connections that need verification._