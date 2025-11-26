# Bakery Order Management App

A comprehensive Angular application for managing bakery orders from entry to delivery. Built with mobile-first design principles for easy access and editing on mobile devices.

## Features

### Order Management
- **Order Entry**: Create new orders with complete customer and order details
- **Customer Information**: Store customer name, phone, and email
- **Order Details**: Track cake type, quantity, price, and special instructions
- **Image Upload**: Store cake images for reference
- **Delivery Management**: Track delivery requirements with address and date
- **Egg/Eggless Tracking**: Mark orders as egg or eggless
- **Order Status**: Track orders through stages: Pending → In Progress → Ready → Delivered

### Analytics Dashboard
- **Monthly Revenue**: View revenue for any selected month
- **New Customers**: Track number of new customers per month
- **Expense Tracking**: Record and view monthly expenses by category
- **Net Profit**: Calculate profit (Revenue - Expenses)
- **Monthly Segregation**: Filter and view data by month and year

### User Interface
- **Mobile-First Design**: Optimized for mobile devices with responsive layout
- **Modern UI**: Beautiful gradient backgrounds and card-based design
- **Easy Navigation**: Intuitive navigation between dashboard, orders, and order creation
- **Search & Filter**: Search orders by customer name, cake type, or phone number
- **Status Management**: Easily update order status from the order list

## Technology Stack

- **Angular 17**: Modern Angular framework
- **TypeScript**: Type-safe development
- **SCSS**: Styling with SCSS preprocessor
- **RxJS**: Reactive programming for data management
- **localStorage**: Client-side data persistence

## Getting Started

### Prerequisites

- Node.js (v20.19 or higher recommended)
- npm or yarn package manager
- Angular CLI

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open your browser and navigate to `http://localhost:4200`

### Building for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## Project Structure

```
bakery-app/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── dashboard/          # Analytics dashboard
│   │   │   ├── order-form/         # Order creation/editing form
│   │   │   ├── order-list/         # Order listing and management
│   │   │   └── expense-form/       # Expense entry form
│   │   ├── models/
│   │   │   └── order.model.ts      # Data models/interfaces
│   │   ├── services/
│   │   │   └── data.service.ts     # Data management service
│   │   ├── app.component.*         # Root component
│   │   ├── app.module.ts           # Root module
│   │   └── app-routing.module.ts   # Routing configuration
│   ├── assets/                     # Static assets
│   ├── index.html                  # Main HTML file
│   ├── main.ts                     # Application entry point
│   └── styles.scss                 # Global styles
├── angular.json                    # Angular configuration
├── package.json                    # Dependencies
└── tsconfig.json                   # TypeScript configuration
```

## Usage

### Creating an Order

1. Navigate to "Orders" → "New Order"
2. Fill in customer information (name and phone are required)
3. Enter order details (cake type, quantity, price)
4. Optionally upload a cake image
5. Select if delivery is required and enter delivery details
6. Mark as egg or eggless
7. Add any special instructions
8. Click "Create Order"

### Managing Orders

- View all orders in the "Orders" page
- Search orders by customer name, cake type, or phone
- Filter by order status
- Sort by date or price
- Update order status directly from the list
- Edit or delete orders as needed

### Tracking Expenses

1. Go to Dashboard
2. Select the month and year
3. Click "+ Add Expense"
4. Enter expense details (description, amount, category, date)
5. Expenses are automatically included in monthly calculations

### Viewing Analytics

- Navigate to Dashboard
- Select month and year from dropdowns
- View:
  - Monthly Revenue
  - New Customers count
  - Monthly Expenses
  - Net Profit

## Data Storage

The app uses **localStorage** for local data persistence and **Google Sheets** for cloud backup. All orders, customers, and expenses are:

- **Stored locally** in browser localStorage (works offline)
- **Automatically synced** to your Google Sheet (when configured)

### Google Sheets Integration

The app can automatically sync all data to your personal Google Sheet. See `GOOGLE_SHEETS_SYNC_SETUP.md` for setup instructions.

**Note**: Data is stored locally and synced to Google Sheets. If browser data is cleared, you can restore from Google Sheets.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements

- Backend API integration
- User authentication
- Email notifications
- PDF invoice generation
- Advanced reporting and charts
- Multi-user support
- Cloud image storage

## License

This project is created for personal/business use.

