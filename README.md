<div align="center">
  <h1>🌍 LokVirasat</h1>
  <p><strong>Mapping, documenting, and preserving local cultural heritage for future generations.</strong></p>
</div>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19.2-blue?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4.3-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-007ACC?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Zustand-State_Management-orange?style=for-the-badge" alt="Zustand" />
  <img src="https://img.shields.io/badge/Leaflet-Map-199900?style=for-the-badge&logo=leaflet" alt="Leaflet" />
</p>

---

## 📖 Table of Contents

- [About The Project](#-about-the-project)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 About The Project

**LokVirasat** (Folk Heritage) is a modern web application designed to empower communities to map and document their local cultural heritage. From historical landmarks to oral traditions, the platform provides an interactive space for discovering and archiving cultural artifacts. 

The application utilizes an interactive map to geographically anchor heritage sites, ensuring that traditions, languages, and histories are preserved contextually. 

---

## ✨ Key Features

- 🗺️ **Interactive Heritage Map**: Navigate through cultural landmarks using a responsive map integrated with Leaflet and Maplibre.
- 📝 **Rich Contributor Workflows**: Easily add new heritage entries. Users can upload location coordinates, images, and contextual descriptions.
- 🎵 **Audio Archiving**: Preserve oral histories, folk songs, and spoken languages with integrated audio playback and recording features.
- 🔒 **Secure Authentication**: Robust user authentication and profile management utilizing Zustand for state management.
- 📡 **Offline Capabilities**: Partial offline functionality ensures that field researchers can access and record data even in remote areas.
- ✅ **Curator Verification System**: Built-in workflows for curators to verify the authenticity and accuracy of user-submitted heritage data.

---

## 🛠 Tech Stack

Our stack is built on top of modern, high-performance web technologies:

### Core
- **Framework**: [Next.js (App Router)](https://nextjs.org/)
- **UI Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)

### Styling & UI
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)

### State & Forms
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Form Handling**: [React Hook Form](https://react-hook-form.com/)
- **Validation**: [Zod](https://zod.dev/)

### Map & Geo
- **Mapping**: [Leaflet](https://leafletjs.com/), [react-leaflet](https://react-leaflet.js.org/), & [Maplibre GL](https://maplibre.org/)

---

## 🚀 Getting Started

Follow these instructions to set up the project locally on your machine.

### Prerequisites

Make sure you have Node.js installed (v20+ is recommended).
- [Node.js](https://nodejs.org/)
- npm, yarn, or pnpm

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Harshit-Hackerxguy/LokVirasat.git
   cd LokVirasat
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   # or 
   pnpm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   # or 
   pnpm dev
   ```

4. **Explore the App:**
   Open your browser and navigate to [http://localhost:3000](http://localhost:3000).

---

## 📂 Project Structure

```text
src/
├── app/                  # Next.js App Router (pages, layouts, globals.css)
├── components/           # Reusable modular UI components
│   ├── audio/            # Audio recording & playback features
│   ├── auth/             # Login, registration, and auth wrappers
│   ├── forms/            # Form components using React Hook Form
│   ├── heritage/         # Heritage site cards and details
│   ├── layout/           # Navbar, Footer, and structural components
│   ├── map/              # Leaflet Map integrations
│   └── verification/     # Curator verification components
├── hooks/                # Custom React hooks
├── store/                # Zustand global state (useAuthStore, etc.)
├── types/                # TypeScript interfaces and type definitions
├── utils/                # Helper functions, formatters, and API handlers
└── data/                 # Static JSON or mock data for the application
```

---

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

<br />

<div align="center">
  <sub>Built with ❤️ for preserving Folk Heritage.</sub>
</div>
