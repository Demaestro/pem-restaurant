# Supabase Setup For PEM

Use this when you are ready to move PEM from local-only storage to a live database.

## 1. Create the project

1. Go to `https://supabase.com/`
2. Create a new project
3. Choose your organization
4. Give the project a name like `pem-restaurant`
5. Set a strong database password
6. Choose the region closest to your customers

## 2. Create the tables

1. Open the Supabase dashboard
2. Go to `SQL Editor`
3. Open [`supabase/schema.sql`](C:\Users\USER\OneDrive\Desktop\pem-restaurant\supabase\schema.sql)
4. Copy the SQL
5. Paste it into the Supabase SQL editor
6. Run it

This creates the tables PEM needs for:

- orders
- contact messages
- catering requests

## 3. Copy the backend keys

In Supabase:

1. Open `Project Settings`
2. Open `API`
3. Copy:
   - `Project URL`
   - `service_role` key

Put them into your backend environment:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 4. Update the PEM backend env

Use [`.env.example`](C:\Users\USER\OneDrive\Desktop\pem-restaurant\.env.example) as your template.

Your deployed backend should have:

```env
ADMIN_PASSWORD=choose-a-strong-password
FRONTEND_URL=https://your-frontend-domain.vercel.app
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-5-mini
```

## 5. Confirm PEM is using Supabase

When the backend starts successfully, the server log should say it is using `supabase storage` instead of `local storage`.

## 6. Test before launch

After deployment, test:

- placing an order
- sending a contact message
- sending a catering request
- opening Admin
- changing order statuses
- using the dietary meal assistant

## Important

- Keep the `service_role` key private.
- Never place the Supabase service key in frontend code.
- Never place the OpenAI API key in frontend code.
