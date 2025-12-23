# Hong Kong Temperature Map 🌡️

A 3D interactive visualization of Hong Kong showing real-time temperature data for various locations, built with Three.js.

## Features

- **3D Map**: Stylized representation of Hong Kong's major districts
- **Temperature Markers**: Interactive pins showing temperature at key locations
- **Hover Tooltips**: Detailed information including location name (English & Chinese), temperature, and humidity
- **Smooth Animations**: Pulsing markers and gentle ambient animations
- **Orbit Controls**: Rotate, pan, and zoom to explore the map

## Locations Displayed

- Central (中環)
- Tsim Sha Tsui (尖沙咀)
- Mong Kok (旺角)
- Sha Tin (沙田)
- Tuen Mun (屯門)
- Tai O (大澳)
- Victoria Peak (太平山)
- Sai Kung (西貢)

## Getting Started

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

## Technology Stack

- [Three.js](https://threejs.org/) - 3D graphics library
- [Vite](https://vitejs.dev/) - Build tool and dev server
- Custom GeoJSON-style data for Hong Kong districts

## Controls

- **Left Click + Drag**: Rotate the view
- **Right Click + Drag**: Pan the view
- **Scroll**: Zoom in/out
- **Hover over markers**: View temperature details

