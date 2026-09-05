# C-Manager Frontend

A modern inventory management system built with React, TypeScript, and Vite.

## Features

- 📦 Inventory Management
  - Track stock levels
  - Set minimum and maximum stock thresholds
  - Manage inventory locations
  - View inventory transactions
- 🏢 Multi-company Support
  - Company-specific inventory settings
  - Separate inventory tracking per company
- 🔄 Real-time Updates
  - Fast refresh with Vite
  - React Query for efficient data management
- 🎨 Modern UI
  - Built with Tailwind CSS
  - Responsive design
  - Keyboard shortcuts support

## Tech Stack

- [React](https://reactjs.org/) - UI Library
- [TypeScript](https://www.typescriptlang.org/) - Type Safety
- [Vite](https://vitejs.dev/) - Build Tool
- [TanStack Query](https://tanstack.com/query) - Data Fetching
- [React Hook Form](https://react-hook-form.com/) - Form Management
- [Zod](https://zod.dev/) - Schema Validation
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Lucide Icons](https://lucide.dev/) - Icon Set

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone [repository-url]
cd c-manager-front
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Start the development server:

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`

## Development

### Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── services/      # API services
├── hooks/         # Custom React hooks
└── utils/         # Utility functions
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
