# Callus Landing Page

A modern, responsive landing page for the Callus fitness app built with Next.js, TypeScript, and Tailwind CSS.

## 🎨 Design System

- **Background**: Deep Black (#000000)
- **Primary Accent**: Electric Blue (#00AEEF)
- **Secondary Accent**: Slate Gray (#232323)
- **Text (Primary)**: White (#FFFFFF)
- **Text (Secondary)**: Cool Gray (#AAAAAA)
- **CTA Button Hover**: Light Blue (#1CC7FF)
- **Font**: Inter (Google Fonts)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
web/
├── app/                    # Next.js 13+ app directory
│   ├── globals.css        # Global styles with Tailwind
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Main landing page
├── components/             # React components
│   ├── Hero.tsx           # Hero section
│   ├── Features.tsx       # Features grid
│   └── Footer.tsx         # Footer component
├── public/                # Static assets
├── tailwind.config.js     # Tailwind configuration
├── next.config.js         # Next.js configuration
└── package.json           # Dependencies
```

## 🛠 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🎯 Features

- **Responsive Design**: Mobile-first approach
- **Modern UI**: Glass morphism effects and smooth animations
- **SEO Optimized**: Meta tags and structured data
- **Performance**: Optimized images and code splitting
- **Accessibility**: ARIA labels and keyboard navigation

## 🚀 Deployment

The site is configured for easy deployment on Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically on every push

## 📝 Customization

### Colors
Update the color palette in `tailwind.config.js`:

```javascript
colors: {
  background: '#000000',
  primary: '#00AEEF',
  secondary: '#232323',
  // ... more colors
}
```

### Content
Edit the content in each component:
- `Hero.tsx` - Main headline and CTA
- `Features.tsx` - Feature descriptions
- `Footer.tsx` - Links and contact info

## 📞 Contact

For questions or support, contact:
- **Developer**: Ramki Pitchala
- **Email**: ramapitchala@gmail.com

---

Built with ❤️ for the Callus fitness community 