# Agency Panel

A modern project management platform for tracking work logs and action items.

## 🚀 Quick Start

### Local Development

1. **Install Dependencies**
   ```bash
   # Backend
   cd server
   npm install
   
   # Frontend
   cd client
   npm install
   ```

2. **Set Up Environment Variables**
   ```bash
   # Copy and fill in .env files
   cp server/.env.example server/.env
   cp client/.env.example client/.env
   ```

3. **Start Development Servers**
   ```bash
   # Terminal 1 - Backend
   cd server
   npm run dev
   
   # Terminal 2 - Frontend
   cd client
   npm run dev
   ```

4. **Seed Database** (Optional)
   ```bash
   cd server
   node seed.js
   ```

## 📦 Deployment

See [DEPLOYMENT.md](/Users/apple/.gemini/antigravity/brain/0b6d294d-a942-451c-be64-2643559556a1/deployment_guide.md) for full deployment guide.

### Quick Deploy to Vercel + Render + MongoDB Atlas

1. **Database**: MongoDB Atlas (Free 512MB)
2. **Backend**: Render (Free tier)
3. **Frontend**: Vercel (Free tier)

Total cost: **$0/month**

## 🔑 Default Credentials

After seeding:
- **Admin**: info@onfees.com / 123456
- **Client**: client@example.com / 12345678
- **Developer**: dev@example.com / 123456

## 🛠 Tech Stack

- **Frontend**: React + Vite + Bootstrap
- **Backend**: Node.js + Express + MongoDB
- **Auth**: JWT
- **Hosting**: Vercel (Frontend) + Render (Backend) + MongoDB Atlas

## 📄 License

MIT
