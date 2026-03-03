Lightweight E-Commerce & Shop Management System

SmartShop Lite is a modular and scalable shop management system built using Node.js and Express.js, designed to help small businesses efficiently manage products, customers, billing, and reporting — all in one place.

It provides essential retail management capabilities along with PDF report generation and SMS notifications support.

Project Overview

SmartShop Lite simplifies retail operations by providing:

1.Inventory tracking
2.Customer management
3.Sales & billing automation
4.Business analytics dashboard
5.PDF invoice generation
6.SMS order notifications
This project demonstrates practical backend architecture using MVC design pattern and modular service-based structure.

Core Features
1.Product Management
Add, update, delete products
Manage stock quantities
Inventory monitoring

2.Customer Management
Maintain customer profiles
Store contact information
Track purchase history

3.Billing & Invoicing
Generate professional invoices
Record transactions
Calculate totals automatically
Export invoices as PDF

4.Dashboard Analytics
Daily/Monthly sales overview
Revenue tracking
Key business metrics

5.Reporting System
Generate sales reports
Export reports in PDF format
View historical transaction data

6.SMS Notifications
Order confirmation alerts
Billing notifications
Important system alerts

7.Settings Management
Configure shop preferences
Manage system-level settings


## Project Structure

```
smartshop-lite/
├── config/              # Configuration files
│   └── db.js           # Database configuration
├── controllers/        # Route controllers
│   ├── billingController.js
│   ├── dashboardController.js
│   ├── productController.js
│   ├── reportController.js
│   └── smsController.js
├── models/             # Database models
│   ├── Customer.js
│   ├── Product.js
│   ├── Sale.js
│   └── Setting.js
├── routes/             # Route definitions
│   ├── billingRoutes.js
│   ├── dashboardRoutes.js
│   ├── productRoutes.js
│   ├── reportRoutes.js
│   └── settingRoutes.js
├── services/           # Business logic services
│   ├── pdfService.js   # PDF generation
│   └── smsService.js   # SMS messaging
├── views/              # EJS templates
│   ├── billing.ejs
│   ├── dashboard.ejs
│   ├── history.ejs
│   ├── layout.ejs
│   ├── products.ejs
│   └── settings.ejs
├── public/             # Static files
│   ├── css/
│   └── js/
├── server.js           # Application entry point
└── package.json        # Project metadata and dependencies
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd smartshop-lite
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure the database**
   - Edit `config/db.js` with your database connection details
   - Ensure your database is running and accessible

4. **Set environment variables** (if applicable)
   - Create a `.env` file in the root directory
   - Configure necessary environment variables

## Usage

### Start the Application

```bash
npm start
```

The application will be available at `http://localhost:3000` (or your configured port).

### Access the Dashboard

- Navigate to the dashboard to view key metrics and business overview
- Manage products, customers, and sales through the respective sections
- Generate reports and export to PDF format

## Technology Stack

- **Backend:** Node.js, Express.js
- **Frontend:** EJS Templates, CSS, JavaScript
- **Database:** [Configured in config/db.js]
- **PDF Generation:** pdfService
- **SMS Integration:** smsService

## Available Routes

- **Dashboard** - `/dashboard` - Business overview and analytics
- **Products** - `/products` - Product management
- **Billing** - `/billing` - Invoice and billing management
- **Reports** - `/reports` - Business reports
- **History** - `/history` - Sales and transaction history
- **Settings** - `/settings` - Application settings

## Services

### PDF Service
Handles PDF generation for invoices, reports, and documents.

### SMS Service
Manages sending SMS notifications for orders, alerts, and customer communications.

## Configuration

Key configuration files:

- `config/db.js` - Database connection and settings
- `views/settings.ejs` - User-accessible settings interface

## Development

### Project Dependencies
Install all required packages:
```bash
npm install
```

### Running in Development Mode
```bash
npm run dev
```

(Note: Configure a development script in package.json if needed)

## Contributing

1. Create a feature branch (`git checkout -b feature/AmazingFeature`)
2. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
3. Push to the branch (`git push origin feature/AmazingFeature`)
4. Open a Pull Request


## Support

For support, please contact tharuntamilmani200601@gamil.com

## Changelog

### Version 1.0.0
- Initial release with core features:
  - Product management
  - Customer management
  - Billing and invoicing
  - Sales tracking
  - Report generation
  - SMS notifications
  - Dashboard analytics
