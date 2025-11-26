# Deployment Guide - The Oven Heaven

This guide will help you deploy your bakery management app to various free hosting services.

## Quick Deploy Options

### Option 1: Netlify (Recommended - Easiest)

**Steps:**
1. Go to [netlify.com](https://www.netlify.com) and sign up (free)
2. Click "Add new site" → "Import an existing project"
3. Connect your Git repository (GitHub/GitLab/Bitbucket)
   - OR drag and drop the `dist/bakery-app` folder after running `npm run build:prod`
4. Configure build settings:
   - **Build command:** `npm run build:prod`
   - **Publish directory:** `dist/bakery-app`
5. Click "Deploy site"
6. Your app will be live at: `https://your-app-name.netlify.app`

**Using Netlify CLI:**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
npm run deploy:netlify
```

**Manual Deploy:**
```bash
npm run build:prod
# Then drag and drop the dist/bakery-app folder to Netlify dashboard
```

---

### Option 2: Vercel (Fast & Easy)

**Steps:**
1. Go to [vercel.com](https://vercel.com) and sign up (free)
2. Click "Add New Project"
3. Import your Git repository
   - OR use Vercel CLI (see below)
4. Vercel will auto-detect Angular and configure settings
5. Click "Deploy"
6. Your app will be live at: `https://your-app-name.vercel.app`

**Using Vercel CLI:**
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
npm run deploy:vercel
```

---

### Option 3: GitHub Pages (Free)

**Steps:**
1. Push your code to a GitHub repository
2. Go to repository Settings → Pages
3. Source: Select "GitHub Actions"
4. The workflow file (`.github/workflows/deploy.yml`) is already configured
5. Push to `main` branch - it will auto-deploy
6. Your app will be live at: `https://your-username.github.io/repository-name`

**Manual Setup:**
```bash
# Build the app
npm run build:prod

# Install gh-pages
npm install --save-dev gh-pages

# Add to package.json scripts:
# "deploy:gh": "gh-pages -d dist/bakery-app"

# Deploy
npm run deploy:gh
```

---

### Option 4: Firebase Hosting (Google)

**Steps:**
1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase in your project:
   ```bash
   firebase init hosting
   ```
   - Select "Use an existing project" or create new
   - Public directory: `dist/bakery-app`
   - Configure as single-page app: **Yes**
   - Set up automatic builds: **No** (or Yes if you want)

4. Build and deploy:
   ```bash
   npm run build:prod
   firebase deploy
   ```

5. Your app will be live at: `https://your-project-id.web.app`

---

### Option 5: Surge.sh (Super Simple)

**Steps:**
1. Install Surge:
   ```bash
   npm install -g surge
   ```

2. Build your app:
   ```bash
   npm run build:prod
   ```

3. Deploy:
   ```bash
   cd dist/bakery-app
   surge
   ```
   - Enter your email
   - Choose a domain name (e.g., `oven-heaven.surge.sh`)
   - Done!

4. Your app will be live immediately at: `https://your-chosen-name.surge.sh`

---

## Environment Variables

If you need to configure environment variables (like Google Sheets API URLs):

### Netlify:
1. Go to Site settings → Environment variables
2. Add variables:
   - `GOOGLE_SHEETS_ENABLED=true`
   - `GOOGLE_SHEETS_SCRIPT_URL=your-url`

### Vercel:
1. Go to Project Settings → Environment Variables
2. Add your variables

### Firebase:
1. Use Firebase Functions or configure in `firebase.json`

---

## Important Notes

### Base Href Configuration

For GitHub Pages or custom domains, you may need to update `angular.json`:

```json
"baseHref": "/your-repo-name/"
```

Or build with:
```bash
ng build --configuration production --base-href /your-repo-name/
```

### Google Sheets Sync

Your Google Sheets sync will work in the deployed app as long as:
- The Apps Script Web App URL is publicly accessible
- CORS is properly configured in your Apps Script
- The URL is set in your environment files

### HTTPS Requirements

All hosting services provide HTTPS by default, which is required for:
- Service Workers
- Geolocation API
- Some browser features

---

## Recommended: Netlify

**Why Netlify?**
- ✅ Free tier is generous
- ✅ Easy drag-and-drop deployment
- ✅ Automatic HTTPS
- ✅ Custom domains
- ✅ Continuous deployment from Git
- ✅ Form handling (if needed later)
- ✅ No credit card required

**Quick Start:**
1. Build: `npm run build:prod`
2. Go to netlify.com
3. Drag `dist/bakery-app` folder to deploy
4. Done! 🎉

---

## Updating Your Deployed App

### Netlify/Vercel (with Git):
- Just push to your repository
- Auto-deploys automatically

### Manual Update:
```bash
npm run build:prod
# Then redeploy using your chosen platform's method
```

---

## Troubleshooting

### "404 Not Found" on routes
- Make sure you have redirect/rewrite rules configured (already in `netlify.toml` and `vercel.json`)
- Angular routes need to redirect to `index.html`

### Assets not loading
- Check that `baseHref` is correct
- Verify asset paths in `angular.json`

### Google Sheets not working
- Check CORS settings in Apps Script
- Verify the Web App URL is correct
- Make sure Apps Script is deployed as "Anyone" can access

---

## Next Steps

1. Choose a hosting service (Netlify recommended)
2. Deploy your app
3. Test all features
4. Set up a custom domain (optional)
5. Share your app URL! 🚀

