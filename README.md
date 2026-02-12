# 🔥 BurnerX

> **Sleek. Private. Persistent.** The premium disposable email tool for the modern web.

BurnerX is a high-performance, dark-themed temporary email application built with **Vue 3**, **Vite**, and **Tailwind CSS**. It leverages the [Mails.tm](https://mails.tm/) API to provide instant, anonymous email addresses while adding a layer of persistence and a world-class UI.

---

## ✨ Features

- ⚡ **Instant Generation:** Get a new email identity the moment you land.
- 📁 **Identity Persistence:** Unlike other services, BurnerX saves your recent identities in `LocalStorage`, allowing you to return to temporary mailboxes even after a refresh.
- 🎨 **Premium Aesthetic:** Designed with a focus on dark-mode luxury, featuring glassmorphism, subtle animations, and a clean user experience.
- 🔔 **Live Updates:** Real-time polling to ensure you see verification emails the second they hit your inbox.
- 📱 **Fully Responsive:** Works perfectly on desktop, tablet, and mobile.
- 🚀 **Zero Tracking:** No ads, no trackers, strictly client-side.

## 🛠️ Tech Stack

- **Framework:** [Vue 3](https://vuejs.org/) (Composition API)
- **Bundler:** [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Icons:** [Lucide Vue](https://lucide.dev/) (Planned)
- **API:** [Mails.tm](https://mails.tm/)

## 🚀 Getting Started

### Prerequisites

- Node.js (Latest LTS recommended)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/burner-x.git
   cd burner-x
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run in development mode:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## 📖 How it Works

BurnerX communicates directly with the Mails.tm API from your browser. Every time you generate an account, the credentials (email and password) are encrypted and stored in your browser's local storage. This allows the app to fetch the JWT token and retrieve your messages even if you close the tab.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

*Built with ❤️ for privacy enthusiasts.*
