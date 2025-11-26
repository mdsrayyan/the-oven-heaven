# Quick Deploy - 3 Steps to Go Live! 🚀

## Fastest Method: Netlify Drag & Drop

### Step 1: Build Your App
```bash
npm run build:prod
```

### Step 2: Go to Netlify
1. Visit: https://app.netlify.com/drop
2. Sign up/login (free, no credit card)

### Step 3: Deploy
1. Drag the `dist/bakery-app` folder onto the Netlify page
2. Wait 30 seconds
3. Your app is live! 🎉

**That's it!** You'll get a URL like: `https://random-name-12345.netlify.app`

---

## Alternative: Netlify with Git (Auto-Deploy)

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/your-repo.git
git push -u origin main
```

### Step 2: Connect to Netlify
1. Go to https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Connect your GitHub repository
4. Build settings (auto-detected):
   - Build command: `npm run build:prod`
   - Publish directory: `dist/bakery-app`
5. Click "Deploy site"

### Step 3: Done!
- Every time you push to GitHub, Netlify auto-deploys
- Your app is live at: `https://your-app-name.netlify.app`

---

## Update Your Deployed App

### If using Git:
```bash
git add .
git commit -m "Update app"
git push
# Netlify auto-deploys!
```

### If using drag & drop:
```bash
npm run build:prod
# Drag dist/bakery-app folder to Netlify again
```

---

## Need Help?

See `DEPLOYMENT_GUIDE.md` for:
- Other hosting options (Vercel, Firebase, Surge)
- Custom domains
- Environment variables
- Troubleshooting

