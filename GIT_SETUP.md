# Git Repository Setup Guide

Your project is now initialized with Git! Follow these steps to push to a remote repository.

## Step 1: Create a GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the **"+"** icon → **"New repository"**
3. Repository name: `bakery-app` (or any name you prefer)
4. Description: "The Oven Heaven - Bakery Order Management System"
5. Choose **Public** or **Private**
6. **DO NOT** initialize with README, .gitignore, or license (we already have these)
7. Click **"Create repository"**

## Step 2: Add Remote and Push

After creating the repository, GitHub will show you commands. Use these:

```bash
# Add your GitHub repository as remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/bakery-app.git

# Or if using SSH:
git remote add origin git@github.com:YOUR_USERNAME/bakery-app.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Alternative: Using GitHub CLI

If you have GitHub CLI installed:

```bash
gh repo create bakery-app --public --source=. --remote=origin --push
```

## Step 3: Verify

Check your repository on GitHub - all files should be there!

---

## Important Notes

### Environment Files

Your environment files (`src/environments/environment.ts` and `environment.prod.ts`) are currently tracked in Git. 

**If they contain sensitive data (like API keys):**

1. Add them to `.gitignore`:
   ```bash
   echo "/src/environments/environment.ts" >> .gitignore
   echo "/src/environments/environment.prod.ts" >> .gitignore
   ```

2. Remove them from Git tracking:
   ```bash
   git rm --cached src/environments/environment.ts
   git rm --cached src/environments/environment.prod.ts
   git commit -m "Remove environment files from tracking"
   ```

3. Use `environment.example.ts` as a template (already provided)

### Future Updates

To push future changes:

```bash
git add .
git commit -m "Your commit message"
git push
```

---

## Quick Commands Reference

```bash
# Check status
git status

# Add all changes
git add .

# Commit changes
git commit -m "Your message here"

# Push to remote
git push

# Pull latest changes
git pull

# View commit history
git log --oneline
```

---

## Next Steps After Pushing

1. **Set up auto-deployment:**
   - Connect your GitHub repo to Netlify/Vercel
   - Every push will auto-deploy your app!

2. **Add collaborators:**
   - Go to repository Settings → Collaborators
   - Add team members

3. **Protect main branch:**
   - Settings → Branches → Add rule for `main`
   - Require pull requests for changes

---

Your project is ready to push! 🚀

