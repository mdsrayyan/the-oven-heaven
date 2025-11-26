# Quick Start Guide

## Installation Steps

1. **Navigate to the project directory:**
   ```bash
   cd ~/bakery-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```
   
   **Note:** If you encounter Node.js version issues, you may need to update Node.js to v20.19 or higher. Alternatively, you can use nvm (Node Version Manager) to switch versions.

3. **Start the development server:**
   ```bash
   npm start
   ```

4. **Open your browser:**
   Navigate to `http://localhost:4200`

## First Time Setup

The app is ready to use immediately! All data is stored locally in your browser using localStorage.

## Key Features to Try

1. **Create Your First Order:**
   - Click "New Order" in the navigation
   - Fill in customer details (name and phone are required)
   - Enter cake type, quantity, and price
   - Upload a cake image (optional)
   - Set delivery details if needed
   - Mark as egg or eggless
   - Click "Create Order"

2. **View Orders:**
   - Navigate to "Orders" to see all orders
   - Use search to find specific orders
   - Filter by status (Pending, In Progress, Ready, Delivered)
   - Update order status directly from the list

3. **Track Expenses:**
   - Go to Dashboard
   - Click "+ Add Expense"
   - Enter expense details
   - Expenses are automatically included in monthly calculations

4. **View Analytics:**
   - Dashboard shows monthly revenue, new customers, expenses, and profit
   - Select different months/years to view historical data

## Mobile Access

The app is fully responsive and optimized for mobile devices. Simply open the app on your mobile browser for easy order management on the go!

## Troubleshooting

### Node.js Version Issues
If you see Node.js version warnings:
- Update Node.js: Visit https://nodejs.org/
- Or use nvm: `nvm install 20 && nvm use 20`

### Port Already in Use
If port 4200 is already in use:
```bash
ng serve --port 4201
```

### Clear Browser Data
If you want to start fresh, clear your browser's localStorage for localhost:4200

## Data Backup

Since data is stored in localStorage, consider:
- Exporting data periodically (future feature)
- Taking screenshots of important orders
- For production, integrate with a backend API

