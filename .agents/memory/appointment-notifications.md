---
name: Appointment Notifications
description: Email notification flow for consultation bookings and approvals
---

## New booking → notify admin/staff
`POST /api/appointments` (client role) → after saving, calls `getStaffEmails()` which collects all Admin/Staff emails from `fallbackUsers` + `FIRM_EMAIL` env var. Sends HTML email to each via `sendEmail()`.

## Approval → notify client
`PATCH /api/appointments/:id/status` with `{ status: 'APPROVED', notifyClient: true }` → looks up client email via `getUserEmail(updatedAppt.user_id)` (checks Supabase first, then fallbackUsers by id/clientId), sends HTML confirmation email.

## Cancellation
`DELETE /api/appointments/:id` — client can cancel. Removes from Supabase or fallbackAppointments array.

**Why:** The `notifyClient` flag is an opt-in so admin approvals from old code paths don't accidentally trigger emails.

## LegalDashboard approval UX
Uses `approvalToast` state + `showToast(msg, type)` helper. Renders a fixed-position toast in the JSX. Replaces old `alert()` calls.

## ClientDashboard UX
- `cancellingId` + `cancelAppointment(id)` function for delete
- `viewingApt` state → appointment details modal (shows date, time, status, tracking number, status-specific messages)
- `aptActionMsg` → green toast shown on cancel success, upload success, etc.
