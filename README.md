# Nash Workforce Platform

Production-style home services platform built on Next.js App Router + MongoDB.

## Implemented

- Customer flow: auth, services, booking, order tracking, reschedule with fee, wallet, support/report
- Worker flow: onboarding, mandatory verification fee, admin verification, jobs, boost, payouts, reports
- Admin flow: dashboard, users, workers verification, orders assign, reports action, boost plans, reschedule policy, payments/refunds, payouts, CMS
- Special features:
  - User <-> Worker report system with anti-abuse rules
  - Paid worker booster ranking with area/category slot limits
  - Configurable reschedule charges policy
- Chat: user <-> worker conversation and messages
- JWT access + refresh token auth
- API validation using Zod
- Rate limiting on login/report/reschedule endpoints
- Audit logs for admin actions
- Demo payment mode (provider = `demo`)
- Booking idempotency + retry-safe flow
- Payment webhook idempotency + recovery endpoint + refund audit trail
- Health endpoints: `/api/health`, `/api/health/deep`

## Required Routes

- Customer: `/auth/login`, `/auth/signup`, `/services`, `/service/[slug]`, `/booking/new`, `/orders`, `/orders/[id]`, `/profile`, `/addresses`, `/wallet`, `/support`
- Worker: `/worker/onboarding`, `/worker/dashboard`, `/worker/jobs`, `/worker/jobs/[id]`, `/worker/boost`, `/worker/wallet`, `/worker/payouts`, `/worker/reports`
- Admin: `/admin/login`, `/admin/dashboard`, `/admin/users`, `/admin/workers`, `/admin/orders`, `/admin/reports`, `/admin/boost-plans`, `/admin/reschedule-policy`, `/admin/payments`, `/admin/payouts`, `/admin/cms`

## Setup

1. Install packages

```bash
npm install
```

2. Configure env

```bash
cp .env.example .env.local
```

3. Seed DB (creates admin + user + 20 workers + services + plans + bookings)

```bash
npm run seed
```

4. Run app

```bash
npm run dev
```

## Seed Credentials

- Admin: `admin@nashworkforce.com` / `Admin@123`
- User: `user@nashworkforce.com` / `User@123`
- Workers: `worker1@nashworkforce.com` to `worker20@nashworkforce.com` / `Worker@123`

## Notes

- Payment is in demo mode for now (`PAYMENT_PROVIDER=demo`)
- Evidence/docs are URL-based for now; cloudinary signed upload can be plugged in next
- Critical E2E smoke: `npm run smoke:e2e-critical`
