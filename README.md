🚀 Quickstart
1. Clone & Setup
bash
git clone <repo-url>
cd outfitbloom-backend
cp .env.example .env          # Fill out .env with your credentials
2. Install Dependencies
bash
npm install
3. Launch Locally
bash
npm run dev                   # auto-restart on save (nodemon)
# OR
PORT=5001 node server.js      # run directly (avoid 5000 on macOS)
4. Test Endpoints
Local: http://localhost:5001/

Android Emulator: http://10.0.2.2:5001/

LAN Device: http://<your-local-ip>:5001/

Health: /healthz

API Docs: /docs

🔒 Secure API & Secrets
Keep your .env private (never commit actual secrets).

Example .env.example included—copy and update values as required.

Change default JWT secret and database credentials for production.

🛠 Features
JWT protected authentication

CRUD wardrobe with Cloudinary image uploads

Search & filter wardrobe by type, color, season, more

AI-powered outfit recommendations

Razorpay & Stripe payment integration

Multi-currency (via ExchangeRate-API)

Affiliate product analytics (Amazon, Myntra, Flipkart, etc.)

Swagger docs at /docs

Production-ready: Helmet, Rate Limiting, PM2, Docker, MongoDB Atlas

📦 Prerequisites
Node.js 16+ and npm

MongoDB Atlas (or local)

Cloudinary (free plan fine)

Razorpay/Stripe account (for payments)

📋 Deployment/Production
Use pm2 start server.js -i max for clustering

Enable HTTPS proxy or direct (see provider docs)

Add indexes in MongoDB for scale

Use Docker for consistent deploys

Enable Sentry in .env for error reporting

npm audit and npm outdated regularly

🤖 Useful Commands & Upgrades
Safely update: npm update

Full upgrade: npx npm-check-updates -u && npm install

Fix peer/conflicts: see README or ask in issues

📝 Contributing
Fork, PR, or raise issues

Follow code, commit, and PR style in this file

👀 For New Developers
See /middleware/validate.js for validation logic.

Add new features following the model/controller/route/doc patterns.

Use JSDoc & Swagger for all new APIs.

For questions, DM maintainers or open issues.

(Replace <repo-url> with your repository address. Update info for actual Stripe/Cloudinary accounts and front-end links as needed.)

