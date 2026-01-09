# Client Reporting App - Deployment & Credentials Documentation

## 1. Project Overview
Successful deployment of the Client Reporting Application using a free-tier full-stack architecture.

- **Frontend**: Vercel (React/Vite)
- **Backend**: Render (Node.js/Express)
- **Database**: MongoDB Atlas (MongoDB)
- **Codebase**: GitHub

## 2. Credentials & Accounts
> [!CAUTION]
> **Keep these credentials safe.** Do not share this file publicly.

### A. General Account (MongoDB, Render, Vercel)
- **Email**: `oncampuserp@gmail.com`
- **Password**: `OnCampus@123`

### B. GitHub Repository
- **URL**: [https://github.com/laxmankp11/Client-Reporting.git](https://github.com/laxmankp11/Client-Reporting.git)
- **Username**: `laxmankp11`
- **Password**: `Github@2026`

### C. Database (MongoDB Atlas)
- **Cluster**: Cluster0
- **Database User**: `oncampuserp_db_user`
- **Database Password**: `woudz6e9PUEYQCO3`
- **Connection String (URI)**:
  ```bash
  mongodb+srv://oncampuserp_db_user:woudz6e9PUEYQCO3@cluster0.ozbmeff.mongodb.net/client-platform?retryWrites=true&w=majority&appName=Cluster0
  ```

### D. Environment Secrets
- **JWT_SECRET**: `super_secure_secret_key_2025_!!`

## 3. Deployment Process

### Step 1: Database Setup (MongoDB Atlas)
1.  Created account with `oncampuserp@gmail.com`.
2.  Deployed a free M0 Cluster.
3.  Created database user `oncampuserp_db_user`.
4.  Whitelisted IP addresses to allow cloud connections.
5.  Obtained Connection String.

### Step 2: Version Control (GitHub)
1.  Initialized local Git repository.
2.  Configured CORS in `server/index.js` to allow production traffic.
3.  Pushed code to `https://github.com/laxmankp11/Client-Reporting.git`.

### Step 3: Backend Deployment (Render)
1.  Connected GitHub account.
2.  Created new **Web Service**.
3.  **Settings**:
    -   **Root Directory**: `server`
    -   **Build Command**: `npm install`
    -   **Start Command**: `node index.js`
4.  **Environment Variables**:
    -   `MONGO_URI`: (See Section 2C)
    -   `JWT_SECRET`: (See Section 2D)
    -   `NODE_ENV`: `production`
5.  **Live URL**: `https://client-reporting.onrender.com`

### Step 4: Frontend Deployment (Vercel)
1.  Connected GitHub account.
2.  Imported `Client-Reporting` repository.
3.  **Settings**:
    -   **Framework Preset**: `Vite`
    -   **Root Directory**: `client`
4.  **Environment Variables**:
    -   `VITE_API_URL`: `https://client-reporting.onrender.com`
5.  Deployed successfully.

## 4. Live Links
- **Application URL**: [https://client-reporting-app-roan.vercel.app](https://client-reporting-app-roan.vercel.app)
- **Backend API**: Hosted on Vercel Serverless (same domain at `/api`).

## 5. Domain Configuration (Custom Subdomain)
To make your app accessible at `app.globalaifirst.com`:

### Step 1: Add Domain to Vercel
1.  Go to your **Vercel Dashboard**.
2.  Select your `Client-Reporting` project.
3.  Go to **Settings** > **Domains**.
4.  Enter `app.globalaifirst.com` and click **Add**.

### Step 2: Configure DNS (Where you bought the domain)
Vercel will provide you with a **CNAME** record value (usually `cname.vercel-dns.com`).
1.  Log in to your Domain Registrar (Godaddy, Namecheap, etc.).
2.  Go to **DNS Management** for `globalaifirst.com`.
3.  Add a new record:
    -   **Type**: `CNAME`
    -   **Name** (Host): `app`
    -   **Value** (Target): `cname.vercel-dns.com` (or whatever Vercel provides)
    -   **TTL**: Default / 1 Hour
4.  Save the record.

### Step 3: Wait for Propagation
DNS changes can take anywhere from a few minutes to 24 hours to propagate globally.
-   Once propagated, `https://app.globalaifirst.com` will open your application.
-   Vercel will automatically generate an SSL certificate (HTTPS) for it.
