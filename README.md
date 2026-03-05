# Shopify Dashboard

A modern, feature-rich Shopify-style dashboard built with Next.js 16, React 19, and Shopify Polaris. This project demonstrates advanced product management capabilities, analytics tracking, and sophisticated filtering systems.

## 🌐 Live Demo

**Production URL**: [https://illustrious-pastelito-ae79e1.netlify.app/](https://illustrious-pastelito-ae79e1.netlify.app/)

## 🚀 Features

- **Product Management**: Advanced product table with search, filtering, and analytics tracking
- **Analytics Dashboard**: Real-time analytics with localStorage-based event tracking and live metrics visualization
- **Advanced Filtering**: Multi-level filtering with search, checkbox popovers, and collapsible sidebar filters
- **Mock Data Integration**: Seamless integration with FakeStore API enhanced with UI-specific fields
- **Responsive Design**: Built with Shopify Polaris for consistent, professional UI
- **Type Safety**: Full TypeScript implementation with comprehensive type definitions

## 🛠️ Tech Stack

- **Framework**: Next.js 16.1.6 with App Router
- **UI Library**: Shopify Polaris 13.9.5
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Analytics**: Lightweight localStorage-based analytics with real-time event tracking
- **Data**: FakeStore API integration with mock data enrichment

## 📁 Project Structure

```
shopify-dashboard/
├── app/                          # Next.js App Router directory
│   ├── page.tsx                  # Root page - Product management interface
│   ├── layout.tsx                # Root layout with Polaris AppProvider
│   ├── globals.css               # Global styles
│   ├── analytics/
│   │   └── page.tsx              # Analytics dashboard
│   ├── products/
│   │   ├── page.tsx              # Products overview
│   │   └── table/
│   │       └── page.tsx          # Product table view
│   └── components/               # App-specific components
├── components/                   # Shared components
│   ├── ProductTable/             # Product table component
│   ├── ProductModal/             # Product modal component
│   └── ProductTableSkeleton/     # Loading skeleton
├── lib/                          # Core libraries
│   └── analytics/                # Analytics system
├── hooks/                        # Custom React hooks
├── types/                        # TypeScript type definitions
├── utils/                        # Utility functions
└── public/                       # Static assets
```

## 🌐 Routes & Navigation

### Main Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `app/page.tsx` | **Main Dashboard** - Complete product management interface with search, filtering, and analytics tracking |
| `/analytics` | `app/analytics/page.tsx` | **Internal Dashboard** - Analytics visualization with metrics, event tracking, and data management |

### Key Features by Route

#### `/` (Main Dashboard)
- **Product Table**: Comprehensive product listing with enhanced data
- **Search Functionality**: Real-time search across product names and descriptions
- **Advanced Filtering**: 
  - Purchase Availability filter (checkbox popover)
  - Product Type filter (checkbox popover)
  - More Filters sidebar with collapsible sections (Vendor selection)
- **Filter Tags**: Visual representation of active filters with close functionality
- **Analytics Integration**: Event tracking for product clicks, page views, and user interactions
- **Status Navigation**: Tabs for filtering by product status (Active, Draft, Archived)

#### `/analytics` (Internal Dashboard)
- **Live Metrics**: Real-time product clicks, modal opens, and session tracking
- **Event History**: Recent activity table showing last 10 interactions with timestamps
- **Session Analytics**: Unique session tracking and user engagement metrics
- **Test Data Generation**: Built-in test data generator for demonstration
- **Data Management**: Clear analytics data and refresh functionality
- **LocalStorage Persistence**: Analytics data persists across browser sessions

## 🔧 Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd shopify-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

4. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application

### Build for Production

```bash
npm run build
npm start
```

## 🧩 Key Components & Systems

### Product Management System
- **Enhanced Product Types**: Extended FakeStore API products with UI-specific fields (status, vendor, productType, availability)
- **Mock Data Enrichment**: Deterministic seeded randomization for consistent demo data
- **Filter Architecture**: Multi-level filtering system with search, checkboxes, and sidebar filters

### Analytics System
- **Real-time Event Tracking**: Captures user interactions, page views, and product engagement instantly
- **LocalStorage Persistence**: Events stored in browser localStorage for session persistence
- **Live Metrics Dashboard**: Dynamic calculation and display of analytics metrics
- **Session Management**: Automatic session tracking with unique identifiers
- **Performance Optimized**: Async state updates prevent render loops and ensure smooth UX

### UI/UX Features
- **Shopify Polaris Integration**: Professional, consistent design system
- **Responsive Layout**: Optimized for desktop and mobile viewing
- **Interactive Filters**: Checkbox-based filtering with visual feedback
- **Status Management**: Product status handling with visual indicators

## 📊 Analytics Events

The application tracks analytics events in real-time using localStorage:

- **Page Views**: Automatic tracking of route navigation and page loads
- **Product Interactions**: Click events on products with metadata (ID, title, category)
- **Modal Events**: Open/close tracking for product detail modals
- **User Actions**: Search queries, filter applications, and interface interactions
- **Session Data**: Unique session identification and user engagement metrics
- **Event Persistence**: All events stored locally and persist across browser sessions

## 🔍 Search & Filtering

### Search Functionality
- Real-time search across product names and descriptions
- Debounced input for performance optimization
- Clear search functionality

### Filter System
1. **Purchase Availability**: Checkbox popover with multiple availability options
2. **Product Type**: Checkbox popover for product category filtering
3. **More Filters Sidebar**: Collapsible sections for additional filtering options
4. **Filter Tags**: Visual representation of active filters with individual removal

## 🚀 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Structure

- **Type Safety**: Full TypeScript implementation with strict type checking
- **Component Architecture**: Modular, reusable components following React best practices
- **Custom Hooks**: Specialized hooks for analytics, product management, and filtering
- **Service Layer**: Dedicated services for data management and analytics

## 📝 API Integration

The application integrates with the FakeStore API for product data and enhances it with:
- Product status (Active, Draft, Archived)
- Vendor information
- Product type categorization
- Purchase availability options

## 🔧 Configuration

### Environment Variables
No environment variables are required for basic functionality. The application uses:
- FakeStore API for product data
- LocalStorage for analytics persistence
- Client-side routing with Next.js App Router

### Customization
- Product fields can be extended in `types/product.ts`
- Analytics events can be customized in `lib/analytics/index.ts`
- UI components can be modified using Shopify Polaris theming
- Mock data generation can be adjusted in `utils/mockProductEnrichment.ts`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

For support and questions:
- Check the [Next.js Documentation](https://nextjs.org/docs)
- Review [Shopify Polaris Documentation](https://polaris.shopify.com/)
- Open an issue in the repository

---

Built with ❤️ using Next.js and Shopify Polaris
