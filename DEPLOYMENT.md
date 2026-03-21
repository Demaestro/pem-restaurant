# PEM Deployment Guide

This project can run in two modes:

- Local mode: uses `data/submissions.json`
- Production mode: uses Supabase when `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set

## Recommended live setup

- Frontend: Vercel
- Backend API: Render or Railway
- Database: Supabase Postgres

## 1. Create Supabase tables

Run the SQL in:

- `supabase/schema.sql`

inside the Supabase SQL editor.

## 2. Backend environment variables

Create a backend `.env` using:

- `.env.example`

Set these values:

- `ADMIN_PASSWORD`
- `FRONTEND_URL`
- `FRONTEND_URLS` if you want to allow more than one frontend domain
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `PAYSTACK_SECRET_KEY`

Example:

```env
ADMIN_PASSWORD=use-a-strong-password-here
FRONTEND_URL=https://your-frontend-domain.vercel.app
FRONTEND_URLS=https://your-frontend-domain.vercel.app,https://your-preview-domain.vercel.app
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-5-mini
PAYSTACK_SECRET_KEY=your-paystack-secret-key
```

## 3. Frontend environment variables

Create a frontend env file from:

- `.env.client.example`

For production, point it to your live API:

```env
VITE_API_BASE_URL=https://your-api-service.onrender.com
```

For local development, you can leave it blank and use the Vite proxy, or set:

```env
VITE_API_BASE_URL=http://localhost:4000
```

## 4. Deploy the backend

Deploy the repository to Render or Railway as a Node service.

Backend settings:

- Build command: `npm install`
- Start command: `npm start`

## 5. Deploy the frontend

Deploy the same repository to Vercel as a Vite app.

Frontend settings:

- Build command: `npm run build`
- Output directory: `dist`

Add:

- `VITE_API_BASE_URL`

to the Vercel environment variables.

## 6. Connect the two apps

Make sure:

- `FRONTEND_URL` on the backend matches your deployed frontend domain
- `FRONTEND_URLS` includes any extra preview or alternate frontend domains you want to allow
- `VITE_API_BASE_URL` on the frontend matches your deployed backend domain
- `PAYSTACK_SECRET_KEY` is set on the backend before enabling Paystack checkout

## 7. Test after deployment

Test these flows:

- Customer order submission
- Contact form submission
- Catering request submission
- Dietary AI meal recommendations
- Delivery zone loading and admin editing
- Admin login
- Order status update
- CSV export
- Password change
- Paystack payment return updates the order from `awaiting_payment` to `received`

## Notes

- If Supabase env vars are missing, the backend falls back to local JSON storage.
- If `OPENAI_API_KEY` is missing, the dietary assistant falls back to built-in smart filtering.
- For a real public launch, use Supabase mode.
- Keep your service role key private and only on the backend.
- Keep your OpenAI API key private and only on the backend.
