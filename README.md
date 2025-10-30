# WebFastTry - Internal Testing Platform

A web-based testing platform for engineers to provide test pages to external users for reproducing and verifying issues on customer devices.

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Deployment**: Vercel

## 📋 Features

- Modern, responsive UI with icon-based navigation
- Multiple test pages for different functionalities:
  - 🎥 Video Playback Test
  - 🎤 Audio Test (Microphone & Speakers)
  - 📡 Network Check (Speed & Connectivity)
  - 💻 Device Information Display
  - 🖥️ Screen Share Test
  - 📷 Camera Test

## 🛠️ Development

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Build

```bash
# Create production build
npm run build

# Start production server
npm start
```

## 📦 Project Structure

```
WebFastTry/
├── app/                    # Next.js App Router pages
│   ├── test/              # Test pages
│   │   ├── layout.tsx     # Test pages layout
│   │   ├── video-playback/
│   │   ├── audio-test/
│   │   ├── network-check/
│   │   ├── device-info/
│   │   ├── screen-share/
│   │   └── camera-test/
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── config/
│   └── testPages.ts       # Test pages configuration
├── public/                # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## 🎯 Adding New Test Pages

To add a new test page:

1. Add the test page configuration to `config/testPages.ts`:

```typescript
{
  id: "new-test",
  title: "New Test",
  description: "Description of the test",
  icon: "IconName",  // Lucide icon name
  path: "/test/new-test",
  category: "Category"
}
```

2. Create the page component in `app/test/new-test/page.tsx`

3. If using a new icon, add it to the iconMap in `app/page.tsx`

## 🌐 Deployment to Vercel

### Option 1: Via Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your Git repository
4. Vercel will auto-detect Next.js and configure automatically
5. Click "Deploy"

### Option 2: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Environment Variables

Currently, no environment variables are required. If you need to add any:

1. Create `.env.local` for local development
2. Add variables in Vercel Dashboard under Project Settings → Environment Variables

## 📱 Responsive Design

The app is fully responsive and works on:
- Desktop browsers
- Tablets
- Mobile devices

## 🔒 Security Considerations

- This is intended for internal use
- Add authentication if deploying publicly
- Consider adding rate limiting for production use
- Review and implement appropriate CORS policies

## 📄 License

See LICENSE file for details.

## 🤝 Contributing

1. Add new test pages as needed
2. Follow the existing code structure
3. Ensure responsive design
4. Test on multiple devices and browsers

## 📞 Support

For issues or questions, contact the internal engineering team.

