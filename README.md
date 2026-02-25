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

`VideoSDK Compare` integration requires:

- `AGORA_APP_ID`
- `AGORA_APP_CERTIFICATE`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_API_KEY`
- `TWILIO_API_SECRET`
- `ZOOM_SDK_KEY`
- `ZOOM_SDK_SECRET`

These variables are used by in-project token routes:

- `/videosdkcompare/api/agora-token`
- `/videosdkcompare/api/twilio-token`
- `/videosdkcompare/api/zoom-token`

For local development:

1. Create `.env.local`
2. Add the variables listed above
3. Restart `npm run dev`

### VideoSDK Compare Source Integration

`VideoSDK Compare` is integrated at source level under:

- `features/videosdkcompare`
- test entry page: `/test/videosdkcompare`

The page runs the integrated React+Redux SDK compare app directly inside `web-fast-try` (not a static iframe bundle).

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

