# Muse — Supabase Setup Guide

Follow these quick steps to connect your live Supabase database and storage:

---

### Step 1 — Create Project
1. Go to **[https://supabase.com](https://supabase.com)** and sign in.
2. Click **"New project"** and name it `muse`.
3. Choose your database password and nearest region.

---

### Step 2 — Run Database & Storage SQL
1. In your Supabase dashboard, click **SQL Editor** on the left menu.
2. Click **"New query"**.
3. Open [`supabase/schema.sql`](./schema.sql), copy everything, paste it into the editor, and click **Run**.
4. Open [`supabase/storage_setup.sql`](./storage_setup.sql), copy everything, paste it into a new query, and click **Run**.

---

### Step 3 — Get API Keys & Add to `.env`
1. In your Supabase dashboard, go to **Project Settings → API**.
2. Copy:
   - **Project URL**
   - **anon / public key**
3. Open or create `.env` in the root of the project:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```
4. Restart your development server (`npm run dev`).

---

### Step 4 (Optional for fast development) — Disable Email Confirmation
1. In Supabase dashboard → **Authentication → Providers → Email**.
2. Toggle **Confirm email** to **OFF** so signups immediately log in without requiring an email link.
