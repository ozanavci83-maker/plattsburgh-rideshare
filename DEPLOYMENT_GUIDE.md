# Railway Deployment Guide

Deploy the entire Plattsburgh RideShare platform to Railway in 30 minutes!

## Step 1: Create Railway Account (5 minutes)

1. Open your phone browser and go to **https://railway.app**
2. Click **Sign Up**
3. Sign up with GitHub (easiest) or email
4. Verify your email

## Step 2: Deploy PostgreSQL Database (5 minutes)

1. In Railway dashboard, click **New Project**
2. Select **Provision PostgreSQL**
3. Click **Deploy**
4. Wait for it to deploy (2-3 minutes)
5. Click on the PostgreSQL service
6. Go to **Connect** tab
7. Copy the **DATABASE_URL** (you'll need this)

## Step 3: Deploy Backend Server (5 minutes)

1. In Railway dashboard, click **New Project**
2. Select **Deploy from GitHub**
3. Connect your GitHub account
4. Select the `plattsburgh-rideshare` repository
5. Click **Deploy**
6. Once deployed, go to **Variables** tab
7. Add these environment variables:

```
DATABASE_URL=<paste from Step 2>
JWT_SECRET=your-super-secret-key-12345
NODE_ENV=production
CORS_ORIGIN=https://your-railway-domain.up.railway.app,http://localhost:3000,http://localhost:8081
PORT=3000
```

8. Click **Deploy** again
9. Go to **Settings** and note your **Railway Domain** (e.g., `https://plattsburgh-api.up.railway.app`)

## Step 4: Deploy Admin Dashboard (5 minutes)

1. In Railway dashboard, click **New Project**
2. Select **Deploy from GitHub**
3. Select the same repository
4. In **Variables**, add:

```
NODE_ENV=production
ADMIN_PORT=3001
```

5. In **Settings**, set **Start Command** to:
```
cd apps/admin && npm start
```

6. Click **Deploy**
7. Note your **Admin Dashboard URL** (e.g., `https://plattsburgh-admin.up.railway.app`)

## Step 5: Update Mobile Apps (5 minutes)

Now you need to update the mobile apps to point to your Railway backend.

### For Rider App:
1. Open `/home/ubuntu/plattsburgh-rideshare/apps/rider/screens/LoginScreen.tsx`
2. Find the line: `const API_URL = 'http://localhost:3000/api';`
3. Replace with: `const API_URL = 'https://your-railway-api-domain.up.railway.app/api';`
4. Do the same for all other screen files in the rider app

### For Driver App:
1. Open `/home/ubuntu/plattsburgh-rideshare/apps/driver/screens/LoginScreen.tsx`
2. Find the line: `const API_URL = 'http://localhost:3000/api';`
3. Replace with: `const API_URL = 'https://your-railway-api-domain.up.railway.app/api';`
4. Do the same for all other screen files in the driver app

## Step 6: Build APKs for Your Phone (10 minutes)

Once you've updated the API URLs, build the APKs:

### Rider App APK:
```bash
cd /home/ubuntu/plattsburgh-rideshare/apps/rider
npm run build:android
```

### Driver App APK:
```bash
cd /home/ubuntu/plattsburgh-rideshare/apps/driver
npm run build:android
```

The APK files will be generated in the `android/app/build/outputs/apk/` directory.

## Step 7: Install on Your Phone

1. Download the APK files to your phone
2. Go to **Settings > Security** and enable **Install from Unknown Sources**
3. Open each APK file and tap **Install**
4. Done! The apps will now connect to your Railway backend

## Step 8: Test Everything

### Create Test Accounts:

**Admin Account:**
- Email: `admin@plattsburgh-rideshare.com`
- Password: `Admin123!`

**Test Rider:**
- Email: `rider@test.com`
- Password: `Rider123!`

**Test Driver:**
- Email: `driver@test.com`
- Password: `Driver123!`

### Test Flow:

1. Open **Admin Dashboard** at your Railway admin URL
2. Login with admin account
3. Approve the test driver
4. Open **Rider App** on your phone
5. Login as rider
6. Request a ride
7. Open **Driver App** on another device (or simulator)
8. Login as driver
9. Accept the ride
10. Complete the ride
11. Rate each other

## Troubleshooting

### Database Connection Error
- Make sure `DATABASE_URL` is correct in Railway variables
- Check that PostgreSQL service is running

### API Connection Error
- Verify `CORS_ORIGIN` includes your frontend URLs
- Check that backend service is running
- Make sure API URL in mobile apps matches Railway domain

### Mobile App Won't Connect
- Clear app cache: Settings > Apps > [App Name] > Clear Cache
- Reinstall the app
- Check internet connection

## Production Checklist

Before going live:

- [ ] Change `JWT_SECRET` to a strong random string
- [ ] Set `NODE_ENV=production` on all services
- [ ] Enable HTTPS (Railway does this automatically)
- [ ] Set up proper database backups
- [ ] Monitor logs for errors
- [ ] Test all user flows end-to-end
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure email notifications
- [ ] Add rate limiting to API
- [ ] Set up analytics

## Support

For Railway support, visit: https://docs.railway.app

For platform issues, check the README.md file.
