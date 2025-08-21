# Memory Maker 🎬✨

Transform your cherished photos into living memories using AI-powered video generation. Upload a photo, describe what happened next, and watch your memory come alive!

![Memory Maker](https://pub-1bf330673fe24fad8ce300e6adbe20d7.r2.dev/Screenshot%202025-08-21%20at%2016.13.27.png)

## 🌟 Features

- **📸 Photo Upload** - Drag & drop or click to upload your cherished photos
- **📝 Story Prompts** - Describe what happened next in your memory with helpful examples
- **🎥 AI Video Generation** - Powered by fal.ai's LTXV model for high-quality 24fps videos
- **⚙️ Customization** - Choose aspect ratio (16:9, 9:16, 1:1) and video duration (2-8 seconds)
- **🎨 Memory Gallery** - Save and browse all your generated memory videos
- **💾 Auto-Save** - Your memories are automatically saved locally
- **🌓 Dark Mode** - Beautiful light and dark themes
- **📱 Responsive** - Works perfectly on desktop, tablet, and mobile

## 🚀 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS with custom components
- **AI Model**: fal.ai LTXV 13B model
- **Storage**: Local browser storage for memory persistence
- **Icons**: Heroicons SVG icons

## 🛠️ Setup & Installation

### Prerequisites

- Node.js 18+ installed on your machine
- A fal.ai API account and token

### 1. Clone the Repository

```bash
git clone <repository-url>
cd memory-maker
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Environment Setup

1. Copy the environment template:
```bash
cp .env.example .env.local
```

2. Get your fal.ai API token:
   - Sign up at [fal.ai](https://fal.ai)
   - Go to your dashboard
   - Generate an API key

3. Add your API token to `.env.local`:
```env
FAL_KEY=your_fal_api_key_here
NEXT_PUBLIC_APP_NAME=Memory Maker
```

### 4. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser to see Memory Maker!

## 🎯 How to Use

### Creating Your First Memory Video

1. **Upload a Photo**
   - Drag & drop an image or click "Choose Photo"
   - Supports JPG, PNG, and other common image formats

2. **Tell Your Story**
   - Describe what happened next in that moment
   - Use vivid, descriptive language for best results
   - Click on example prompts for inspiration

3. **Customize Settings**
   - Choose aspect ratio (landscape, portrait, or square)
   - Adjust video duration (2-8 seconds)

4. **Generate Your Memory**
   - Click "✨ Create Memory Video"
   - Wait 30-60 seconds for AI processing
   - Watch your memory come alive!

5. **Save & Share**
   - Download your video
   - View it in the memory gallery
   - Create more memories!

### Gallery Features

- **Browse Memories**: View all your generated videos
- **Hover Preview**: Videos play on hover
- **Full View**: Click to see any memory in detail
- **Auto-Save**: All memories are saved automatically

## 💡 Tips for Best Results

### Photo Tips
- Use clear, well-lit photos
- Photos with people, objects, or scenes work best
- Higher resolution images produce better results

### Prompt Writing Tips
- Be descriptive and specific
- Describe movement, emotions, and actions
- Example: "My daughter took her first wobbly steps across the living room, arms outstretched, with the biggest smile on her face"

## 🏗️ Project Structure

```
ai-video/
├── app/
│   ├── api/generate-video/     # fal API integration
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Main application
├── public/                     # Static assets
├── .env.local                  # Environment variables
├── .env.example                # Environment template
└── package.json                # Dependencies
```

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `FAL_KEY` | Your fal.ai API key | ✅ |
| `NEXT_PUBLIC_APP_NAME` | App name (default: "Memory Maker") | ❌ |


## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Credits

- **AI Model**: [LTXV 13B](https://github.com/Lightricks/LTX-Video)
- **Platform**: [fal.ai](https://fal.ai)
- **Framework**: [Next.js](https://nextjs.org)
- **Styling**: [Tailwind CSS](https://tailwindcss.com)

---

Made with ❤️ by [unicodeveloper](https://github.com/unicodeveloper) • Powered by [LTXV](https://github.com/Lightricks/LTX-Video)
