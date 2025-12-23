// Real Hong Kong GeoJSON data sources
// Primary: Detailed Hong Kong boundary from simplified world boundaries
export const HONG_KONG_GEOJSON_URL = 'https://raw.githubusercontent.com/martynafford/natural-earth-geojson/master/10m/cultural/ne_10m_admin_0_countries_hkg.json';

// Fallback: Alternative sources
export const HK_BOUNDARY_URL = 'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson';

// Accurate Hong Kong outline coordinates (traced from official maps)
// Includes: New Territories, Kowloon, Hong Kong Island, Lantau Island, and major islands
export const hongKongOutline = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": { "name": "New Territories & Kowloon", "name_zh": "新界及九龍" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          // Northern border with China
          [113.83, 22.35], [113.84, 22.37], [113.86, 22.40], [113.88, 22.42],
          [113.92, 22.44], [113.95, 22.47], [113.98, 22.50], [114.00, 22.52],
          [114.04, 22.53], [114.08, 22.54], [114.12, 22.54], [114.16, 22.53],
          [114.20, 22.52], [114.24, 22.51], [114.28, 22.50], [114.32, 22.49],
          [114.35, 22.47],
          // Eastern coast - Sai Kung area
          [114.37, 22.45], [114.38, 22.42], [114.40, 22.40], [114.42, 22.38],
          [114.43, 22.35], [114.42, 22.33], [114.40, 22.32], [114.38, 22.30],
          // Tolo Harbour area
          [114.35, 22.32], [114.32, 22.34], [114.28, 22.35], [114.25, 22.34],
          [114.22, 22.33], [114.20, 22.32],
          // Sha Tin / Kowloon area
          [114.18, 22.34], [114.17, 22.32], [114.18, 22.30],
          // Kowloon Peninsula
          [114.20, 22.32], [114.22, 22.31], [114.20, 22.30], [114.18, 22.29],
          [114.16, 22.295], [114.14, 22.30], [114.12, 22.305],
          // Western Kowloon
          [114.13, 22.32], [114.11, 22.33], [114.08, 22.34],
          // Tsuen Wan / Tuen Mun coast
          [114.05, 22.36], [114.02, 22.37], [113.98, 22.38],
          [113.95, 22.40], [113.92, 22.39], [113.90, 22.37],
          [113.87, 22.36], [113.85, 22.34], [113.83, 22.35]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "Hong Kong Island", "name_zh": "香港島" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          // Northern coast (Victoria Harbour)
          [114.13, 22.29], [114.15, 22.285], [114.17, 22.28], [114.19, 22.282],
          [114.21, 22.285], [114.23, 22.282], [114.25, 22.28], [114.27, 22.275],
          [114.29, 22.27],
          // Eastern tip
          [114.30, 22.265], [114.295, 22.255], [114.285, 22.245],
          // Southern coast
          [114.27, 22.24], [114.25, 22.22], [114.23, 22.21], [114.21, 22.205],
          [114.19, 22.21], [114.17, 22.215], [114.15, 22.22],
          // Aberdeen / Southern
          [114.14, 22.23], [114.155, 22.245],
          // Western tip
          [114.13, 22.25], [114.115, 22.26], [114.12, 22.275],
          [114.13, 22.29]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "Lantau Island", "name_zh": "大嶼山" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          // Northern coast
          [113.88, 22.28], [113.92, 22.30], [113.96, 22.31], [114.00, 22.315],
          [114.04, 22.31], [114.07, 22.305],
          // Tung Chung / Airport area
          [114.08, 22.29], [114.05, 22.28], [114.02, 22.27],
          // Eastern coast
          [114.04, 22.25], [114.06, 22.24], [114.05, 22.22],
          // Southern coast
          [114.02, 22.20], [113.98, 22.185], [113.94, 22.19],
          [113.90, 22.20], [113.86, 22.21],
          // Tai O area (western tip)
          [113.84, 22.23], [113.82, 22.25], [113.835, 22.265],
          [113.85, 22.27], [113.88, 22.28]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "Lamma Island", "name_zh": "南丫島" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [114.11, 22.23], [114.13, 22.22], [114.14, 22.20],
          [114.13, 22.185], [114.11, 22.18], [114.09, 22.19],
          [114.085, 22.21], [114.09, 22.225], [114.11, 22.23]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "Cheung Chau", "name_zh": "長洲" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [114.02, 22.215], [114.035, 22.21], [114.04, 22.195],
          [114.03, 22.185], [114.015, 22.19], [114.01, 22.205],
          [114.02, 22.215]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "Peng Chau", "name_zh": "坪洲" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [114.035, 22.29], [114.045, 22.285], [114.045, 22.275],
          [114.035, 22.27], [114.025, 22.275], [114.025, 22.285],
          [114.035, 22.29]
        ]]
      }
    }
  ]
};

// Temperature data for various Hong Kong locations (matching reference map)
export const temperatureLocations = [
  {
    name: "Sheung Shui",
    name_zh: "上水",
    coordinates: [114.13, 22.51],
    temperature: 21,
    humidity: 82,
    district: "North"
  },
  {
    name: "Tai Po",
    name_zh: "大埔",
    coordinates: [114.18, 22.45],
    temperature: 22,
    humidity: 80,
    district: "Tai Po"
  },
  {
    name: "Tuen Mun",
    name_zh: "屯門",
    coordinates: [113.95, 22.39],
    temperature: 23,
    humidity: 78,
    district: "Tuen Mun"
  },
  {
    name: "Sha Tin",
    name_zh: "沙田",
    coordinates: [114.20, 22.38],
    temperature: 24,
    humidity: 76,
    district: "Sha Tin"
  },
  {
    name: "Tsuen Wan",
    name_zh: "荃灣",
    coordinates: [114.11, 22.37],
    temperature: 24,
    humidity: 75,
    district: "Tsuen Wan"
  },
  {
    name: "Sai Kung",
    name_zh: "西貢",
    coordinates: [114.35, 22.38],
    temperature: 22,
    humidity: 80,
    district: "Sai Kung"
  },
  {
    name: "Kowloon",
    name_zh: "九龍",
    coordinates: [114.18, 22.315],
    temperature: 26,
    humidity: 72,
    district: "Kowloon"
  },
  {
    name: "Hong Kong",
    name_zh: "香港",
    coordinates: [114.17, 22.28],
    temperature: 25,
    humidity: 74,
    district: "Central"
  },
  {
    name: "Aberdeen",
    name_zh: "香港仔",
    coordinates: [114.155, 22.24],
    temperature: 24,
    humidity: 76,
    district: "Southern"
  },
  {
    name: "Lantau",
    name_zh: "大嶼山",
    coordinates: [113.94, 22.26],
    temperature: 22,
    humidity: 82,
    district: "Islands"
  }
];

// Convert geo coordinates to local 3D coordinates
// Hong Kong center: approximately 114.15, 22.35
export function geoToLocal(lon, lat, centerLon = 114.15, centerLat = 22.35, scale = 300) {
  const x = (lon - centerLon) * scale;
  const y = (lat - centerLat) * scale;
  return { x, y };
}

// Get color based on temperature (15-30°C range)
export function getTemperatureColor(temp) {
  const minTemp = 15;
  const maxTemp = 30;
  const normalized = Math.max(0, Math.min(1, (temp - minTemp) / (maxTemp - minTemp)));
  
  // Blue -> Cyan -> Yellow -> Red gradient
  if (normalized < 0.33) {
    const t = normalized / 0.33;
    return {
      r: 0.23 + t * (0.13 - 0.23),
      g: 0.51 + t * (0.83 - 0.51),
      b: 0.96 + t * (0.93 - 0.96)
    };
  } else if (normalized < 0.66) {
    const t = (normalized - 0.33) / 0.33;
    return {
      r: 0.13 + t * (0.98 - 0.13),
      g: 0.83 + t * (0.75 - 0.83),
      b: 0.93 + t * (0.15 - 0.93)
    };
  } else {
    const t = (normalized - 0.66) / 0.34;
    return {
      r: 0.98 + t * (0.94 - 0.98),
      g: 0.75 + t * (0.27 - 0.75),
      b: 0.15 + t * (0.27 - 0.15)
    };
  }
}

// District colors based on region
export function getDistrictColor(name) {
  const colors = {
    // Main regions (matching our accurate outline)
    "New Territories & Kowloon": 0x10b981,  // Emerald green
    "Hong Kong Island": 0x3b82f6,            // Blue
    "Lantau Island": 0xf59e0b,               // Amber
    "Lamma Island": 0x8b5cf6,                // Purple
    "Cheung Chau": 0xec4899,                 // Pink
    "Peng Chau": 0x06b6d4,                   // Cyan
    // Hong Kong Island districts
    "Central and Western": 0x3b82f6,
    "Eastern": 0x60a5fa,
    "Southern": 0x2563eb,
    "Wan Chai": 0x1d4ed8,
    // Kowloon
    "Kowloon City": 0x8b5cf6,
    "Kwun Tong": 0xa78bfa,
    "Sham Shui Po": 0x7c3aed,
    "Wong Tai Sin": 0x6d28d9,
    "Yau Tsim Mong": 0x9333ea,
    // New Territories
    "Islands": 0xf59e0b,
    "Kwai Tsing": 0x10b981,
    "North": 0x14b8a6,
    "Sai Kung": 0x06b6d4,
    "Sha Tin": 0x0ea5e9,
    "Tai Po": 0x0284c7,
    "Tsuen Wan": 0x059669,
    "Tuen Mun": 0x047857,
    "Yuen Long": 0x065f46
  };
  
  return colors[name] || 0x6366f1;
}
