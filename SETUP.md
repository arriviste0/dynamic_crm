# Dynamic CRM Setup Guide

## Prerequisites

1. **Node.js** (v18 or higher)
2. **MongoDB** (local or MongoDB Atlas)

## Environment Setup

1. **Create Environment File**
   ```bash
   # Copy the example environment file
   cp .env.local.example .env.local
   ```

2. **Configure MongoDB Connection**
   Edit `.env.local` and set your MongoDB connection string:
   ```env
   # For local MongoDB
   MONGODB_URI=mongodb://localhost:27017/dynamic_crm
   
   # For MongoDB Atlas
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dynamic_crm?retryWrites=true&w=majority
   ```

## Installation & Running

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Open Application**
   Navigate to `http://localhost:9002` in your browser

## Features

### ✅ Implemented
- **Accounts Management** - Company and client account management
- **Contacts Management** - Personal contact and lead management  
- **Deals Management** - Sales pipeline with stages and tracking
- **Projects Management** - Project tracking with progress and budget
- **Full CRUD Operations** - Create, Read, Update, Delete for all entities
- **Search & Filtering** - Real-time search across all data
- **Undo/Redo System** - Complete history tracking for data safety
- **Responsive Design** - Mobile-friendly interface
- **Accessibility** - Screen reader compatible dialogs

### 🚀 Ready for Development
- **Activities Management** - Task and activity tracking
- **Inventory Management** - Product and service catalog
- **Quotes & Invoices** - Financial document management
- **Support Tickets** - Customer support system
- **Billing Management** - Payment and transaction tracking
- **User Profiles** - User management and preferences
- **System Settings** - Application configuration

## Database Collections

The application will automatically create the following MongoDB collections:
- `accounts` - Company accounts
- `contacts` - Personal contacts
- `deals` - Sales deals and pipeline
- `projects` - Project management
- `activities` - Tasks and activities
- `products` - Inventory items
- `services` - Service offerings
- `quotes` - Sales quotes
- `invoices` - Customer invoices
- `tickets` - Support tickets
- `billing` - Payment records
- `support` - Knowledge base
- `profiles` - User profiles
- `settings` - System configuration

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running locally or Atlas cluster is accessible
- Check the connection string format in `.env.local`
- Verify network connectivity and firewall settings

### Build Issues
- Clear Next.js cache: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check Node.js version compatibility

### Development Issues
- Check browser console for errors
- Verify all environment variables are set
- Ensure all required dependencies are installed
