# TasteHub Restaurant

A modern, responsive restaurant ordering system built with React, TanStack Start, and Supabase.

## Overview

TasteHub Restaurant is a full-stack web application that allows customers to browse meals, add items to their cart, and place orders online. It includes a simple authentication system and an admin dashboard for restaurant owners to manage menu items and view orders.

## Features

### Customer Features
- **Browse Menu**: View all available meals with images, descriptions, and prices
- **Shopping Cart**: Add/remove items and manage quantities
- **User Authentication**: Simple email/password registration and login
- **Order Placement**: Complete checkout process
- **Responsive Design**: Works seamlessly on mobile and desktop

### Admin Features
- **Menu Management**: Add, edit, and delete menu items
- **Order Management**: View all customer orders
- **Dashboard**: Overview of restaurant operations

## Tech Stack

- **Frontend**: React 19 with TypeScript
- **Routing**: TanStack Router
- **UI Components**: Radix UI + Tailwind CSS
- **Backend**: TanStack Start (SSR/SSG)
- **Database**: Supabase
- **Forms**: React Hook Form + Zod validation
- **Styling**: Tailwind CSS v4

## Getting Started

### Prerequisites

- Node.js 18+ (install via [nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- npm or bun package manager
- Supabase account (for database)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd tastehub-restaurant
```

2. Install dependencies:
```bash
npm install
# or
bun install
```

3. Set up environment variables:
Create a `.env` file in the root directory with your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
src/
├── components/          # Reusable UI components
│   └── ui/             # shadcn/ui components
├── hooks/              # Custom React hooks (auth, mobile, etc.)
├── integrations/       # Third-party integrations (Supabase)
├── lib/                # Utility functions and business logic
├── routes/             # Page components (file-based routing)
├── styles.css          # Global styles
├── router.tsx          # Router configuration
├── server.ts           # Server-side entry point
└── start.ts            # TanStack Start configuration
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Deployment

### Build for Production

```bash
npm run build
```

The build output will be in the `dist` directory.

### Deploy to Cloudflare Pages

The project is configured to deploy to Cloudflare Pages by default. Ensure you have the Cloudflare CLI installed and configured.

```bash
npm run build
wrangler pages deploy dist
```

## Database Setup

The application uses Supabase for authentication and data storage. You'll need to set up the following tables:

- `users` - User profiles (managed by Supabase Auth)
- `menu_items` - Restaurant menu items
- `orders` - Customer orders
- `order_items` - Items within each order

Refer to the Supabase integration files in `src/integrations/supabase` for schema details.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary software. All rights reserved.

## Support

For support, please open an issue in the repository or contact the development team.

---

Built with ❤️ by the TasteHub Team
