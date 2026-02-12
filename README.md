# 🔥 BurnerX

> **Sleek. Private. Persistent.** The premium disposable email tool for the modern web.

BurnerX is a high-performance, beautifully designed temporary email application built with **Vue 3**, **Vite**, and **Tailwind CSS v4**. It leverages the [Mail.tm API](https://api.mail.tm/) to provide instant, anonymous email addresses while adding a layer of persistence and a world-class UI.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-blueviolet?style=for-the-badge)](https://codewarrior4.github.io/BurnerX/)
[![API Docs](https://img.shields.io/badge/API%20Docs-mail.tm-orange?style=for-the-badge)](https://api.mail.tm/)

---

## ✨ Features

### 🔐 Core
- ⚡ **Instant Identity Generation** — Get a new disposable email the moment you land
- 📁 **Identity Persistence** — Identities are saved in `localStorage`, surviving refreshes and tabs
- 🏷️ **Identity Labeling (Nicknames)** — Assign custom nicknames to your burner identities for easy identification
- 🌐 **Multi-Domain Picker** — Choose from all available `mail.tm` domains when creating a new identity
- 🚀 **Zero Tracking** — No ads, no trackers, strictly client-side

### 📬 Inbox
- 🔍 **Search & Quick Filter** — Real-time search across sender, subject, and preview text
- 🔔 **Browser Notifications** — Native OS notifications when new emails arrive, even in background tabs
- 🔄 **Live Polling** — Auto-refreshes every 5 seconds to catch emails instantly
- 📎 **Attachment Downloads** — Download any file attached to received emails
- 🧾 **Message Source Viewer** — Inspect raw email source code for debugging

### 📤 Export & Backup
- 📄 **Export Email as JSON** — Download any email's metadata as structured JSON
- 🌐 **Export Email as HTML** — Save a beautifully styled, standalone HTML version of any email
- 💾 **Export Identity Backup** — Back up all your identities (with credentials) to a JSON file
- 📥 **Import Identity Backup** — Restore identities from a backup file with automatic re-authentication

### 🎨 Design & UX
- 🌗 **Light / Dark Mode** — Seamless theme toggle with system preference detection
- 📱 **Fully Responsive** — Works perfectly on desktop, tablet, and mobile with a slide-out sidebar
- 🎯 **Central Identity Dashboard** — QR code, copy button, and domain picker front and center
- 📸 **QR Code Generator** — Scannable QR code for your active email, with PNG download
- ✨ **Premium Aesthetic** — Glassmorphism, micro-animations, and a curated color palette

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | [Vue 3](https://vuejs.org/) (Composition API + `<script setup>`) |
| **Bundler** | [Vite](https://vitejs.dev/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) |
| **Icons** | [Lucide Vue Next](https://lucide.dev/) |
| **QR Codes** | [qrcode.vue](https://www.npmjs.com/package/qrcode.vue) |
| **HTTP** | [Axios](https://axios-http.com/) |
| **API** | [Mail.tm](https://api.mail.tm/) ([API Documentation](https://api.mail.tm/)) |
| **Deployment** | [GitHub Pages](https://pages.github.com/) via GitHub Actions |

---

## 📁 Project Structure

```
src/
├── App.vue                     # Root shell (layout + routing)
├── main.js                     # Vue app entry point
├── assets/
│   └── main.css                # Global styles, theme variables, Tailwind config
├── composables/
│   └── useBurner.js            # Central state, API calls, notifications, export/import
└── components/
    ├── Sidebar.vue             # Identity list, create/delete, label editing, theme toggle
    ├── Header.vue              # Current address, copy, notification toggle
    ├── MessageList.vue         # Inbox with search bar and message previews
    ├── MessageDetail.vue       # Full email view with export dropdown
    ├── IdentityCard.vue        # Central QR + domain picker dashboard
    ├── QRCodeModal.vue         # Enlarged QR code with download
    └── LoadingOverlay.vue      # Full-screen loading spinner
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20+ (LTS recommended)
- **npm** or **yarn**

### Installation

```bash
# Clone the repository
git clone https://github.com/codewarrior4/BurnerX.git
cd BurnerX

# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

---

## 📖 How It Works

BurnerX communicates directly with the [Mail.tm API](https://api.mail.tm/) from your browser. Every time you generate an account, the credentials (email and password) are stored in your browser's `localStorage`. This allows the app to fetch a JWT token and retrieve your messages even if you close the tab.

### Key Flows

1. **Identity Creation** → Calls `POST /accounts` then `POST /token` to register and authenticate
2. **Message Polling** → Calls `GET /messages` every 5 seconds with the JWT bearer token
3. **Notifications** → Compares message count on each poll; fires a native `Notification` on increase
4. **Export/Import** → Serializes identity data to JSON; import re-authenticates via `POST /token`

> 📚 **Full API Reference:** [https://api.mail.tm/](https://api.mail.tm/)

---

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

*Built with ❤️ for privacy enthusiasts.*
