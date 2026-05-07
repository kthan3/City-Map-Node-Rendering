// mapdata.ts — Static data for all 7 country maps
// Defines the visual theme, city data, and geographic boundaries for each map
// This file has no logic — it is purely configuration data

// ── Type Definitions ──────────────────────────────────────────

// Data for a single city node
export interface City {
  name:   string;  // city name displayed on screen
  lat:    number;  // latitude in decimal degrees
  lon:    number;  // longitude in decimal degrees
  pop:    number;  // population — used to scale the node size
  region: string;  // region name — used to determine node color
}

// Configuration for one animated light beam in the background
export interface BeamConfig {
  x:     number;  // horizontal position 0-1 across the screen
  w:     number;  // width of the beam 0-1
  hue:   number;  // color hue in degrees 0-360
  speed: number;  // animation speed
  ph:    number;  // phase offset so beams animate at different times
}

// Configuration for one nebula glow blob in the background
export interface NebulaConfig {
  x:   number;  // horizontal center position 0-1
  y:   number;  // vertical center position 0-1
  rx:  number;  // horizontal radius 0-1
  ry:  number;  // vertical radius 0-1
  hue: number;  // color hue in degrees 0-360
  a:   number;  // opacity/alpha 0-1
}

// Full configuration for one country map
export interface MapConfig {
  title:       string;                          // displayed in top left e.g. "USA NODE NETWORK"
  sub:         string;                          // subtitle e.g. "NORTH AMERICA / REAL-TIME TOPOLOGY"
  accentRGB:   [number, number, number];        // main accent color as RGB 0-255
  skyColors:   [string, string, string];        // three hex colors for the sky gradient
  beams:       BeamConfig[];                    // animated light beams
  nebula:      NebulaConfig[];                  // background glow blobs
  fillColor:   string;                          // fill color inside the country outline
  strokeCols:  [string, string, string];        // three stroke colors for the outline border
  lonMin:      number;                          // western boundary longitude
  lonMax:      number;                          // eastern boundary longitude
  latMin:      number;                          // southern boundary latitude
  latMax:      number;                          // northern boundary latitude
  cities:      City[];                          // list of cities to display as nodes
  regionColors: Record<string, [number, number, number]>;  // color per region 0-1 RGB
  outline:     [number, number][];              // polygon points [lon, lat] tracing the country border
}

// Union type of all valid map keys
export type MapKey = 'usa' | 'italy' | 'india' | 'brazil' | 'japan' | 'germany' | 'nigeria';

// ── Map Configurations ────────────────────────────────────────
// All 7 country maps with their full visual and geographic configuration
export const MAP_CONFIGS: Record<MapKey, MapConfig> = {

  // ── USA ───────────────────────────────────────────────────────
  usa: {
    title: 'USA NODE NETWORK',
    sub: 'NORTH AMERICA / REAL-TIME TOPOLOGY',
    accentRGB: [178, 34, 52],             // red from the US flag
    skyColors: ['#080210', '#0c0315', '#06010f'],  // dark blue/purple sky
    beams: [
      { x: 0.10, w: 0.20, hue: 230, speed: 0.00030, ph: 0.0 },
      { x: 0.32, w: 0.17, hue: 350, speed: 0.00042, ph: 1.3 },
      { x: 0.56, w: 0.24, hue: 220, speed: 0.00035, ph: 2.5 },
      { x: 0.77, w: 0.19, hue: 345, speed: 0.00025, ph: 0.8 },
      { x: 0.90, w: 0.14, hue: 240, speed: 0.00038, ph: 3.7 },
    ],
    nebula: [
      { x: .15, y: .28, rx: .34, ry: .22, hue: 228, a: .09 },
      { x: .55, y: .52, rx: .40, ry: .30, hue: 350, a: .07 },
      { x: .83, y: .22, rx: .28, ry: .20, hue: 225, a: .06 },
      { x: .32, y: .70, rx: .32, ry: .20, hue: 348, a: .05 },
    ],
    fillColor: 'rgba(30,10,40,0.22)',
    strokeCols: ['rgba(60,59,110,0.10)', 'rgba(178,34,52,0.35)', 'rgba(60,59,110,0.15)'],
    lonMin: -130, lonMax: -65, latMin: 22, latMax: 50,  // bounding box covering continental US
    cities: [
      { name: 'NEW YORK',     lat: 40.71, lon: -74.01,  pop: 8336817, region: 'NORTHEAST' },
      { name: 'LOS ANGELES',  lat: 34.05, lon: -118.24, pop: 3979576, region: 'WEST'      },
      { name: 'CHICAGO',      lat: 41.88, lon: -87.63,  pop: 2693976, region: 'MIDWEST'   },
      { name: 'HOUSTON',      lat: 29.76, lon: -95.37,  pop: 2304580, region: 'SOUTH'     },
      { name: 'PHOENIX',      lat: 33.45, lon: -112.07, pop: 1608139, region: 'SOUTHWEST' },
      { name: 'PHILADELPHIA', lat: 39.95, lon: -75.17,  pop: 1603797, region: 'NORTHEAST' },
      { name: 'SAN ANTONIO',  lat: 29.42, lon: -98.49,  pop: 1434625, region: 'SOUTH'     },
      { name: 'SAN DIEGO',    lat: 32.72, lon: -117.16, pop: 1386932, region: 'WEST'      },
      { name: 'DALLAS',       lat: 32.78, lon: -96.80,  pop: 1304379, region: 'SOUTH'     },
      { name: 'JACKSONVILLE', lat: 30.33, lon: -81.66,  pop: 949611,  region: 'SOUTHEAST' },
      { name: 'AUSTIN',       lat: 30.27, lon: -97.74,  pop: 978908,  region: 'SOUTH'     },
      { name: 'SEATTLE',      lat: 47.61, lon: -122.33, pop: 737255,  region: 'NORTHWEST' },
      { name: 'DENVER',       lat: 39.74, lon: -104.98, pop: 715522,  region: 'MOUNTAIN'  },
      { name: 'NASHVILLE',    lat: 36.17, lon: -86.78,  pop: 689447,  region: 'SOUTHEAST' },
      { name: 'BOSTON',       lat: 42.36, lon: -71.06,  pop: 675647,  region: 'NORTHEAST' },
      { name: 'MIAMI',        lat: 25.77, lon: -80.19,  pop: 467963,  region: 'SOUTHEAST' },
      { name: 'ATLANTA',      lat: 33.75, lon: -84.39,  pop: 498715,  region: 'SOUTHEAST' },
      { name: 'DETROIT',      lat: 42.33, lon: -83.05,  pop: 639111,  region: 'MIDWEST'   },
      { name: 'MINNEAPOLIS',  lat: 44.98, lon: -93.27,  pop: 429954,  region: 'MIDWEST'   },
      { name: 'CHARLOTTE',    lat: 35.23, lon: -80.84,  pop: 874579,  region: 'SOUTHEAST' },
      { name: 'KANSAS CITY',  lat: 39.10, lon: -94.58,  pop: 495327,  region: 'MIDWEST'   },
      { name: 'ST. LOUIS',    lat: 38.63, lon: -90.20,  pop: 300576,  region: 'MIDWEST'   },
      { name: 'PITTSBURGH',   lat: 40.44, lon: -79.98,  pop: 302971,  region: 'NORTHEAST' },
      { name: 'LAS VEGAS',    lat: 36.17, lon: -115.14, pop: 641903,  region: 'SOUTHWEST' },
    ],
    // Node colors by region — RGB values 0-1
    regionColors: {
      NORTHEAST: [0.70, 0.13, 0.20], WEST:      [0.24, 0.23, 0.43],
      MIDWEST:   [0.85, 0.80, 0.95], SOUTH:     [0.70, 0.13, 0.20],
      SOUTHEAST: [0.24, 0.23, 0.43], SOUTHWEST: [0.85, 0.80, 0.95],
      NORTHWEST: [0.70, 0.13, 0.20], MOUNTAIN:  [0.24, 0.23, 0.43],
    },
    // Polygon points [longitude, latitude] tracing the US coastline and border
    outline: [
      [-124.7, 48.4], [-123.0, 49.0], [-95.2, 49.0], [-88.1, 48.3], [-84.9, 46.0],
      [-83.1, 45.9], [-82.5, 45.3], [-82.9, 43.0], [-79.0, 43.5], [-76.0, 44.7],
      [-75.5, 45.0], [-71.5, 45.0], [-70.8, 43.1], [-70.0, 41.5], [-72.0, 41.0],
      [-74.0, 40.5], [-75.6, 38.0], [-76.0, 37.0], [-75.7, 35.2], [-76.5, 34.5],
      [-77.0, 33.8], [-79.0, 32.7], [-80.8, 32.0], [-81.2, 29.9], [-81.0, 28.3],
      [-80.1, 25.8], [-81.8, 24.5], [-82.6, 27.7], [-84.9, 29.7], [-87.7, 30.0],
      [-89.6, 29.0], [-90.0, 29.1], [-93.8, 29.7], [-97.3, 26.0], [-97.2, 28.0],
      [-100.0, 28.2], [-104.0, 29.5], [-106.6, 31.7], [-111.0, 31.3], [-117.1, 32.5],
      [-118.4, 34.0], [-120.4, 34.5], [-122.4, 37.8], [-124.0, 40.6], [-124.3, 41.7],
      [-124.5, 43.0], [-124.6, 46.2], [-124.7, 48.4],
    ],
  },

  // ── ITALY ─────────────────────────────────────────────────────
  italy: {
    title: 'ITALY NODE NETWORK',
    sub: 'SOUTHERN EUROPE / REAL-TIME TOPOLOGY',
    accentRGB: [0, 146, 70],              // green from the Italian flag
    skyColors: ['#010e06', '#021409', '#030f0b'],  // dark green sky
    beams: [
      { x: 0.15, w: 0.18, hue: 140, speed: 0.00028, ph: 0.0 },
      { x: 0.38, w: 0.22, hue: 355, speed: 0.00040, ph: 1.8 },
      { x: 0.62, w: 0.20, hue: 135, speed: 0.00033, ph: 3.1 },
      { x: 0.83, w: 0.16, hue: 350, speed: 0.00045, ph: 0.5 },
    ],
    nebula: [
      { x: .20, y: .30, rx: .28, ry: .22, hue: 140, a: .10 },
      { x: .55, y: .55, rx: .38, ry: .28, hue: 355, a: .08 },
      { x: .78, y: .20, rx: .30, ry: .18, hue: 138, a: .07 },
      { x: .40, y: .72, rx: .25, ry: .16, hue: 350, a: .06 },
    ],
    fillColor: 'rgba(0,30,10,0.22)',
    strokeCols: ['rgba(0,146,70,0.10)', 'rgba(0,146,70,0.35)', 'rgba(206,43,55,0.15)'],
    lonMin: 6.5, lonMax: 18.8, latMin: 36.5, latMax: 47.5,  // bounding box covering Italy
    cities: [
      { name: 'ROME',    lat: 41.90, lon: 12.50, pop: 2870493, region: 'CENTRO'   },
      { name: 'MILAN',   lat: 45.47, lon: 9.19,  pop: 1366180, region: 'NORD'     },
      { name: 'NAPLES',  lat: 40.85, lon: 14.27, pop: 967069,  region: 'SUD'      },
      { name: 'TURIN',   lat: 45.07, lon: 7.69,  pop: 857910,  region: 'NORD'     },
      { name: 'PALERMO', lat: 38.12, lon: 13.36, pop: 663401,  region: 'SICILIA'  },
      { name: 'GENOA',   lat: 44.41, lon: 8.93,  pop: 572867,  region: 'NORD'     },
      { name: 'BOLOGNA', lat: 44.49, lon: 11.34, pop: 400378,  region: 'NORD'     },
      { name: 'FLORENCE',lat: 43.77, lon: 11.25, pop: 380948,  region: 'CENTRO'   },
      { name: 'BARI',    lat: 41.12, lon: 16.87, pop: 315551,  region: 'SUD'      },
      { name: 'CATANIA', lat: 37.50, lon: 15.09, pop: 311584,  region: 'SICILIA'  },
      { name: 'VENICE',  lat: 45.44, lon: 12.33, pop: 255434,  region: 'NORD'     },
      { name: 'VERONA',  lat: 45.44, lon: 10.99, pop: 259608,  region: 'NORD'     },
      { name: 'TRIESTE', lat: 45.65, lon: 13.78, pop: 204338,  region: 'NORD'     },
      { name: 'TARANTO', lat: 40.47, lon: 17.23, pop: 193468,  region: 'SUD'      },
      { name: 'CAGLIARI',lat: 39.22, lon: 9.12,  pop: 154083,  region: 'SARDEGNA' },
      { name: 'PERUGIA', lat: 43.11, lon: 12.39, pop: 162456,  region: 'CENTRO'   },
    ],
    regionColors: {
      NORD: [0.0, 0.57, 0.27], CENTRO:   [0.81, 0.17, 0.22],
      SUD:  [0.0, 0.57, 0.27], SICILIA:  [0.81, 0.17, 0.22],
      SARDEGNA: [0.93, 0.93, 0.93],
    },
    outline: [
      [6.63, 44.05], [7.02, 43.95], [7.50, 43.78], [8.93, 44.41], [10.17, 44.20],
      [10.42, 43.95], [11.10, 43.40], [11.70, 42.85], [12.50, 41.90], [13.30, 41.43],
      [13.85, 40.80], [14.27, 40.85], [15.00, 40.05], [15.60, 39.68], [15.90, 38.60],
      [16.02, 37.90], [15.65, 37.90], [15.09, 37.50], [14.50, 37.10], [13.36, 38.12],
      [12.56, 38.00], [11.00, 38.18], [9.83, 39.22], [8.90, 39.10], [8.57, 39.70],
      [8.38, 40.47], [8.20, 41.00], [8.67, 41.10], [9.25, 41.00], [9.10, 40.40],
      [9.50, 39.90], [9.83, 39.22], [6.63, 44.05],
    ],
  },

  // ── INDIA ─────────────────────────────────────────────────────
  india: {
    title: 'INDIA NODE NETWORK',
    sub: 'SOUTH ASIA / REAL-TIME TOPOLOGY',
    accentRGB: [255, 153, 51],            // saffron orange from the Indian flag
    skyColors: ['#0e0500', '#150a01', '#100601'],  // dark orange/brown sky
    beams: [
      { x: 0.12, w: 0.22, hue: 30,  speed: 0.00032, ph: 0.0 },
      { x: 0.38, w: 0.18, hue: 135, speed: 0.00044, ph: 2.2 },
      { x: 0.60, w: 0.25, hue: 28,  speed: 0.00029, ph: 1.1 },
      { x: 0.82, w: 0.17, hue: 138, speed: 0.00038, ph: 3.8 },
    ],
    nebula: [
      { x: .18, y: .25, rx: .32, ry: .24, hue: 30,  a: .10 },
      { x: .58, y: .50, rx: .42, ry: .32, hue: 135, a: .08 },
      { x: .80, y: .20, rx: .26, ry: .18, hue: 28,  a: .07 },
      { x: .35, y: .75, rx: .30, ry: .20, hue: 138, a: .06 },
    ],
    fillColor: 'rgba(40,15,0,0.22)',
    strokeCols: ['rgba(255,153,51,0.09)', 'rgba(255,153,51,0.35)', 'rgba(19,136,8,0.20)'],
    lonMin: 67.5, lonMax: 97.5, latMin: 7.0, latMax: 37.5,  // bounding box covering India
    cities: [
      { name: 'MUMBAI',        lat: 19.08, lon: 72.88, pop: 12442373, region: 'WEST'      },
      { name: 'DELHI',         lat: 28.61, lon: 77.21, pop: 11007835, region: 'NORTH'     },
      { name: 'BENGALURU',     lat: 12.97, lon: 77.59, pop: 8443675,  region: 'SOUTH'     },
      { name: 'HYDERABAD',     lat: 17.38, lon: 78.49, pop: 6809970,  region: 'SOUTH'     },
      { name: 'CHENNAI',       lat: 13.08, lon: 80.27, pop: 7088000,  region: 'SOUTH'     },
      { name: 'KOLKATA',       lat: 22.57, lon: 88.36, pop: 4486679,  region: 'EAST'      },
      { name: 'AHMEDABAD',     lat: 23.03, lon: 72.58, pop: 5570585,  region: 'WEST'      },
      { name: 'PUNE',          lat: 18.52, lon: 73.86, pop: 3124458,  region: 'WEST'      },
      { name: 'SURAT',         lat: 21.17, lon: 72.83, pop: 4467797,  region: 'WEST'      },
      { name: 'JAIPUR',        lat: 26.91, lon: 75.79, pop: 3073350,  region: 'NORTH'     },
      { name: 'LUCKNOW',       lat: 26.85, lon: 80.95, pop: 2815601,  region: 'NORTH'     },
      { name: 'NAGPUR',        lat: 21.15, lon: 79.08, pop: 2405421,  region: 'CENTRAL'   },
      { name: 'PATNA',         lat: 25.60, lon: 85.14, pop: 1683200,  region: 'EAST'      },
      { name: 'BHOPAL',        lat: 23.26, lon: 77.40, pop: 1798218,  region: 'CENTRAL'   },
      { name: 'VISAKHAPATNAM', lat: 17.69, lon: 83.22, pop: 1728128,  region: 'SOUTH'     },
      { name: 'CHANDIGARH',    lat: 30.73, lon: 76.78, pop: 960787,   region: 'NORTH'     },
      { name: 'GUWAHATI',      lat: 26.18, lon: 91.75, pop: 957352,   region: 'NORTHEAST' },
      { name: 'AMRITSAR',      lat: 31.63, lon: 74.87, pop: 1132761,  region: 'NORTH'     },
      { name: 'VARANASI',      lat: 25.32, lon: 83.01, pop: 1198491,  region: 'NORTH'     },
      { name: 'KOCHI',         lat: 9.94,  lon: 76.26, pop: 601574,   region: 'SOUTH'     },
    ],
    regionColors: {
      NORTH:    [1.0, 0.60, 0.20], SOUTH:     [0.075, 0.534, 0.031],
      EAST:     [1.0, 0.75, 0.20], WEST:      [1.0,   0.60,  0.20 ],
      CENTRAL:  [0.075, 0.534, 0.031],        NORTHEAST: [1.0, 0.75, 0.20],
    },
    outline: [
      [68.18, 23.62], [68.80, 22.00], [69.20, 20.90], [70.10, 20.15], [71.00, 19.50],
      [72.00, 18.00], [72.88, 16.70], [73.50, 15.00], [74.20, 13.00], [74.60, 11.50],
      [76.30, 8.50],  [77.90, 8.07],  [79.00, 8.90],  [80.20, 9.50],  [81.20, 10.30],
      [80.27, 13.08], [80.30, 14.50], [80.65, 16.50], [82.00, 17.50], [83.22, 17.70],
      [84.50, 18.80], [85.80, 19.80], [86.80, 20.50], [87.30, 21.50], [88.00, 22.00],
      [88.36, 22.57], [89.00, 23.00], [89.00, 24.00], [88.80, 25.00], [89.50, 26.20],
      [90.50, 27.50], [92.00, 27.50], [93.00, 27.00], [94.00, 27.40], [95.00, 27.00],
      [96.00, 27.50], [97.40, 28.00], [97.50, 29.00], [97.00, 29.50], [95.00, 29.50],
      [93.50, 29.00], [91.70, 27.80], [89.50, 27.30], [88.80, 27.90], [87.20, 27.80],
      [85.20, 27.70], [83.30, 28.20], [81.00, 30.00], [79.00, 31.00], [77.50, 31.50],
      [76.00, 33.00], [74.20, 34.50], [72.50, 36.00], [70.20, 37.00], [69.50, 36.00],
      [70.90, 34.00], [69.90, 31.60], [69.00, 30.00], [68.30, 27.50], [68.18, 23.62],
    ],
  },

  // ── BRAZIL ────────────────────────────────────────────────────
  brazil: {
    title: 'BRAZIL NODE NETWORK',
    sub: 'SOUTH AMERICA / REAL-TIME TOPOLOGY',
    accentRGB: [0, 180, 70],              // green from the Brazilian flag
    skyColors: ['#010e04', '#021206', '#011008'],
    beams: [
      { x: 0.10, w: 0.22, hue: 138, speed: 0.00030, ph: 0.0 },
      { x: 0.35, w: 0.20, hue: 52,  speed: 0.00042, ph: 1.5 },
      { x: 0.60, w: 0.24, hue: 225, speed: 0.00036, ph: 2.8 },
      { x: 0.82, w: 0.18, hue: 140, speed: 0.00028, ph: 4.2 },
    ],
    nebula: [
      { x: .15, y: .30, rx: .35, ry: .24, hue: 138, a: .10 },
      { x: .55, y: .50, rx: .42, ry: .30, hue: 52,  a: .09 },
      { x: .80, y: .22, rx: .28, ry: .20, hue: 225, a: .07 },
      { x: .35, y: .72, rx: .30, ry: .20, hue: 138, a: .06 },
    ],
    fillColor: 'rgba(0,25,8,0.22)',
    strokeCols: ['rgba(0,156,59,0.10)', 'rgba(0,156,59,0.35)', 'rgba(255,223,0,0.20)'],
    lonMin: -74, lonMax: -34, latMin: -34, latMax: 5,  // bounding box covering Brazil
    cities: [
      { name: 'SÃO PAULO',      lat: -23.55, lon: -46.63, pop: 12325000, region: 'SUDESTE'      },
      { name: 'RIO DE JANEIRO', lat: -22.91, lon: -43.17, pop: 6748000,  region: 'SUDESTE'      },
      { name: 'BRASÍLIA',       lat: -15.78, lon: -47.93, pop: 3094325,  region: 'CENTRO-OESTE' },
      { name: 'SALVADOR',       lat: -12.97, lon: -38.50, pop: 2900319,  region: 'NORDESTE'     },
      { name: 'FORTALEZA',      lat: -3.72,  lon: -38.54, pop: 2703391,  region: 'NORDESTE'     },
      { name: 'BELO HORIZONTE', lat: -19.92, lon: -43.94, pop: 2530701,  region: 'SUDESTE'      },
      { name: 'MANAUS',         lat: -3.10,  lon: -60.02, pop: 2219580,  region: 'NORTE'        },
      { name: 'CURITIBA',       lat: -25.43, lon: -49.27, pop: 1963726,  region: 'SUL'          },
      { name: 'RECIFE',         lat: -8.05,  lon: -34.88, pop: 1653461,  region: 'NORDESTE'     },
      { name: 'PORTO ALEGRE',   lat: -30.03, lon: -51.23, pop: 1484941,  region: 'SUL'          },
      { name: 'BELÉM',          lat: -1.46,  lon: -48.50, pop: 1499641,  region: 'NORTE'        },
      { name: 'GOIÂNIA',        lat: -16.67, lon: -49.27, pop: 1536097,  region: 'CENTRO-OESTE' },
      { name: 'MACEIÓ',         lat: -9.67,  lon: -35.74, pop: 1025360,  region: 'NORDESTE'     },
      { name: 'NATAL',          lat: -5.80,  lon: -35.21, pop: 890480,   region: 'NORDESTE'     },
      { name: 'CAMPO GRANDE',   lat: -20.44, lon: -54.65, pop: 916001,   region: 'CENTRO-OESTE' },
      { name: 'FLORIANÓPOLIS',  lat: -27.59, lon: -48.55, pop: 508826,   region: 'SUL'          },
      { name: 'PORTO VELHO',    lat: -8.76,  lon: -63.90, pop: 548843,   region: 'NORTE'        },
      { name: 'ARACAJU',        lat: -10.91, lon: -37.07, pop: 672561,   region: 'NORDESTE'     },
    ],
    regionColors: {
      SUDESTE: [0.0, 0.61, 0.23], NORDESTE:      [1.0, 0.87, 0.0],
      SUL:     [0.0, 0.15, 0.46], NORTE:         [0.0, 0.61, 0.23],
      'CENTRO-OESTE': [1.0, 0.87, 0.0],
    },
    outline: [
      [-34.80, -6.0],  [-35.20, -8.0],  [-35.50, -9.5],  [-36.0, -10.5], [-37.0, -11.0],
      [-38.50, -12.97],[-39.0, -14.5],  [-39.5, -16.5],  [-39.8, -18.5], [-40.5, -19.5],
      [-41.0, -21.0],  [-43.17, -22.91],[-44.5, -23.5],  [-46.63,-23.55],[-48.5, -25.0],
      [-49.27, -25.43],[-50.5, -27.0],  [-51.23, -30.03],[-52.0, -32.0], [-53.0, -33.5],
      [-53.5, -33.8],  [-54.5, -33.7],  [-55.0, -33.5],  [-57.0, -31.0], [-57.65,-30.22],
      [-58.0, -28.0],  [-58.17, -20.18],[-57.5, -18.0],  [-57.0, -16.0], [-58.0, -14.0],
      [-60.0, -13.0],  [-60.5, -13.5],  [-62.0, -12.5],  [-63.5, -12.0], [-63.90, -8.76],
      [-65.0, -7.0],   [-70.0, -4.0],   [-73.5, -2.5],   [-72.9, -2.0],  [-70.0, -1.0],
      [-69.5, -0.5],   [-69.9, 1.0],    [-68.0, 2.0],    [-60.2, 5.2],   [-52.0, 4.2],
      [-51.0, 4.0],    [-50.0, 2.0],    [-48.50, -1.46], [-46.0, -1.0],  [-44.5, -2.5],
      [-42.5, -3.0],   [-38.54, -3.72], [-36.5, -4.5],   [-35.0, -5.0],  [-34.80, -6.0],
    ],
  },

  // ── JAPAN ─────────────────────────────────────────────────────
  japan: {
    title: 'JAPAN NODE NETWORK',
    sub: 'EAST ASIA / REAL-TIME TOPOLOGY',
    accentRGB: [188, 0, 45],              // crimson red from the Japanese flag
    skyColors: ['#0e0003', '#140005', '#0f0003'],  // dark red sky
    beams: [
      { x: 0.20, w: 0.20, hue: 350, speed: 0.00032, ph: 0.0 },
      { x: 0.45, w: 0.18, hue: 355, speed: 0.00040, ph: 1.9 },
      { x: 0.68, w: 0.22, hue: 345, speed: 0.00028, ph: 3.2 },
      { x: 0.88, w: 0.15, hue: 352, speed: 0.00044, ph: 0.7 },
    ],
    nebula: [
      { x: .25, y: .30, rx: .32, ry: .22, hue: 350, a: .12 },
      { x: .60, y: .55, rx: .38, ry: .28, hue: 355, a: .09 },
      { x: .82, y: .20, rx: .28, ry: .18, hue: 345, a: .07 },
      { x: .40, y: .75, rx: .28, ry: .18, hue: 352, a: .06 },
    ],
    fillColor: 'rgba(40,0,8,0.22)',
    strokeCols: ['rgba(188,0,45,0.10)', 'rgba(188,0,45,0.40)', 'rgba(255,180,190,0.12)'],
    lonMin: 128, lonMax: 146, latMin: 30, latMax: 45.5,  // bounding box covering Japan
    cities: [
      { name: 'TOKYO',      lat: 35.69, lon: 139.69, pop: 13960000, region: 'KANTO'    },
      { name: 'YOKOHAMA',   lat: 35.44, lon: 139.64, pop: 3757000,  region: 'KANTO'    },
      { name: 'OSAKA',      lat: 34.69, lon: 135.50, pop: 2753000,  region: 'KANSAI'   },
      { name: 'NAGOYA',     lat: 35.18, lon: 136.91, pop: 2327000,  region: 'CHUBU'    },
      { name: 'SAPPORO',    lat: 43.06, lon: 141.35, pop: 1973000,  region: 'HOKKAIDO' },
      { name: 'FUKUOKA',    lat: 33.59, lon: 130.40, pop: 1612000,  region: 'KYUSHU'   },
      { name: 'KOBE',       lat: 34.69, lon: 135.19, pop: 1530000,  region: 'KANSAI'   },
      { name: 'KYOTO',      lat: 35.01, lon: 135.77, pop: 1464000,  region: 'KANSAI'   },
      { name: 'KAWASAKI',   lat: 35.52, lon: 139.72, pop: 1539000,  region: 'KANTO'    },
      { name: 'SAITAMA',    lat: 35.86, lon: 139.65, pop: 1324000,  region: 'KANTO'    },
      { name: 'HIROSHIMA',  lat: 34.39, lon: 132.45, pop: 1200000,  region: 'CHUGOKU'  },
      { name: 'SENDAI',     lat: 38.27, lon: 140.87, pop: 1086000,  region: 'TOHOKU'   },
      { name: 'KITAKYUSHU', lat: 33.88, lon: 130.88, pop: 943000,   region: 'KYUSHU'   },
      { name: 'CHIBA',      lat: 35.61, lon: 140.12, pop: 978000,   region: 'KANTO'    },
      { name: 'NIIGATA',    lat: 37.92, lon: 139.04, pop: 789000,   region: 'CHUBU'    },
      { name: 'HAMAMATSU',  lat: 34.70, lon: 137.73, pop: 797000,   region: 'CHUBU'    },
      { name: 'KUMAMOTO',   lat: 32.81, lon: 130.71, pop: 741000,   region: 'KYUSHU'   },
      { name: 'OKAYAMA',    lat: 34.66, lon: 133.93, pop: 724000,   region: 'CHUGOKU'  },
      { name: 'SHIZUOKA',   lat: 34.97, lon: 138.38, pop: 694000,   region: 'CHUBU'    },
      { name: 'SAKAI',      lat: 34.57, lon: 135.47, pop: 839000,   region: 'KANSAI'   },
    ],
    regionColors: {
      KANTO:    [0.74, 0.0, 0.18], KANSAI:   [0.74, 0.0,  0.18],
      CHUBU:    [0.95, 0.85, 0.87], HOKKAIDO: [0.95, 0.85, 0.87],
      KYUSHU:   [0.74, 0.0, 0.18], TOHOKU:   [0.95, 0.85, 0.87],
      CHUGOKU:  [0.74, 0.0, 0.18],
    },
    outline: [
      [130.40, 33.59], [129.70, 32.50], [130.20, 31.80], [131.00, 31.50], [131.80, 32.00],
      [132.60, 32.80], [132.45, 34.39], [132.00, 34.80], [131.50, 34.80], [131.00, 34.30],
      [130.40, 33.59], [132.45, 34.39], [133.00, 34.50], [133.93, 34.66], [135.00, 34.50],
      [135.19, 34.69], [135.50, 34.69], [135.77, 35.01], [136.00, 35.40], [136.91, 35.18],
      [137.73, 34.70], [138.38, 34.97], [138.80, 35.20], [139.00, 35.50], [139.69, 35.69],
      [139.72, 35.52], [139.64, 35.44], [140.12, 35.61], [140.87, 38.27], [141.50, 39.50],
      [141.80, 40.50], [141.40, 41.50], [141.35, 43.06], [143.00, 44.00], [145.00, 43.50],
      [145.60, 42.00], [145.00, 41.50], [143.50, 40.80], [141.80, 40.50], [141.35, 43.06],
      [140.50, 43.50], [139.00, 42.50], [138.00, 38.00], [137.00, 36.50], [136.00, 35.40],
      [134.50, 35.50], [133.00, 35.40], [132.45, 34.39],
    ],
  },

  // ── GERMANY ───────────────────────────────────────────────────
  germany: {
    title: 'GERMANY NODE NETWORK',
    sub: 'CENTRAL EUROPE / REAL-TIME TOPOLOGY',
    accentRGB: [255, 206, 0],             // gold from the German flag
    skyColors: ['#060400', '#0a0700', '#080500'],  // dark gold/brown sky
    beams: [
      { x: 0.15, w: 0.20, hue: 48, speed: 0.00030, ph: 0.0 },
      { x: 0.40, w: 0.18, hue: 5,  speed: 0.00042, ph: 1.6 },
      { x: 0.62, w: 0.22, hue: 45, speed: 0.00034, ph: 2.9 },
      { x: 0.85, w: 0.16, hue: 8,  speed: 0.00038, ph: 4.0 },
    ],
    nebula: [
      { x: .18, y: .28, rx: .30, ry: .22, hue: 48, a: .10 },
      { x: .55, y: .52, rx: .38, ry: .28, hue: 5,  a: .08 },
      { x: .78, y: .22, rx: .28, ry: .18, hue: 45, a: .07 },
      { x: .38, y: .70, rx: .28, ry: .18, hue: 8,  a: .06 },
    ],
    fillColor: 'rgba(20,12,0,0.22)',
    strokeCols: ['rgba(200,140,0,0.10)', 'rgba(221,0,0,0.35)', 'rgba(255,206,0,0.25)'],
    lonMin: 5.8, lonMax: 15.2, latMin: 47.2, latMax: 55.1,  // bounding box covering Germany
    cities: [
      { name: 'BERLIN',     lat: 52.52, lon: 13.41, pop: 3769000, region: 'NORDOST'  },
      { name: 'HAMBURG',    lat: 53.55, lon: 10.00, pop: 1853000, region: 'NORDWEST' },
      { name: 'MUNICH',     lat: 48.14, lon: 11.58, pop: 1472000, region: 'SÜD'      },
      { name: 'COLOGNE',    lat: 50.94, lon: 6.96,  pop: 1084000, region: 'WEST'     },
      { name: 'FRANKFURT',  lat: 50.11, lon: 8.68,  pop: 763000,  region: 'MITTE'    },
      { name: 'STUTTGART',  lat: 48.78, lon: 9.18,  pop: 635000,  region: 'SÜD'      },
      { name: 'DÜSSELDORF', lat: 51.22, lon: 6.77,  pop: 619000,  region: 'WEST'     },
      { name: 'DORTMUND',   lat: 51.51, lon: 7.47,  pop: 588000,  region: 'WEST'     },
      { name: 'ESSEN',      lat: 51.46, lon: 7.01,  pop: 582000,  region: 'WEST'     },
      { name: 'LEIPZIG',    lat: 51.34, lon: 12.37, pop: 601000,  region: 'OST'      },
      { name: 'BREMEN',     lat: 53.08, lon: 8.80,  pop: 568000,  region: 'NORDWEST' },
      { name: 'DRESDEN',    lat: 51.05, lon: 13.74, pop: 554000,  region: 'OST'      },
      { name: 'HANNOVER',   lat: 52.37, lon: 9.74,  pop: 538000,  region: 'NORDWEST' },
      { name: 'NUREMBERG',  lat: 49.45, lon: 11.08, pop: 515000,  region: 'SÜD'      },
      { name: 'DUISBURG',   lat: 51.43, lon: 6.76,  pop: 498000,  region: 'WEST'     },
      { name: 'BOCHUM',     lat: 51.48, lon: 7.22,  pop: 364000,  region: 'WEST'     },
      { name: 'BONN',       lat: 50.74, lon: 7.10,  pop: 329000,  region: 'WEST'     },
      { name: 'MANNHEIM',   lat: 49.49, lon: 8.47,  pop: 309000,  region: 'SÜD'      },
    ],
    regionColors: {
      NORDOST:  [0.87, 0.0,  0.0], NORDWEST: [1.0, 0.81, 0.0],
      'SÜD':    [0.87, 0.0,  0.0], WEST:     [1.0, 0.81, 0.0],
      MITTE:    [0.87, 0.0,  0.0], OST:      [1.0, 0.81, 0.0],
    },
    outline: [
      [6.10, 51.85], [6.20, 52.50], [7.00, 53.00], [7.50, 53.60], [8.00, 54.00],
      [8.80, 54.90], [10.00, 55.05],[10.50, 54.70], [11.00, 54.40],[12.00, 53.90],
      [13.41, 52.52],[14.20, 52.00],[14.80, 51.00], [15.00, 50.80],[14.70, 50.50],
      [13.74, 51.05],[13.00, 50.50],[12.50, 50.20], [12.00, 50.30],[11.00, 50.40],
      [10.50, 50.00],[9.80, 50.30], [9.00, 50.80],  [8.68, 50.11], [7.80, 49.50],
      [7.50, 48.70], [8.00, 47.80], [8.60, 47.50],  [9.18, 47.60], [10.00, 47.30],
      [11.00, 47.30],[12.20, 47.60],[13.00, 47.50],  [13.80, 48.00],[14.00, 48.60],
      [14.00, 49.00],[13.00, 49.50],[12.50, 50.20],  [12.00, 50.30],[11.00, 50.40],
      [9.80, 50.30], [9.00, 50.80], [7.80, 49.50],   [6.80, 49.20],[6.10, 49.50],
      [6.20, 50.00], [6.10, 50.80], [6.00, 51.50],   [6.10, 51.85],
    ],
  },

  // ── NIGERIA ───────────────────────────────────────────────────
  nigeria: {
    title: 'NIGERIA NODE NETWORK',
    sub: 'WEST AFRICA / REAL-TIME TOPOLOGY',
    accentRGB: [0, 200, 60],              // green from the Nigerian flag
    skyColors: ['#010e03', '#011206', '#011005'],  // dark green sky
    beams: [
      { x: 0.15, w: 0.22, hue: 135, speed: 0.00030, ph: 0.0 },
      { x: 0.40, w: 0.18, hue: 145, speed: 0.00040, ph: 1.7 },
      { x: 0.65, w: 0.24, hue: 130, speed: 0.00033, ph: 3.0 },
      { x: 0.87, w: 0.16, hue: 140, speed: 0.00044, ph: 0.6 },
    ],
    nebula: [
      { x: .18, y: .28, rx: .32, ry: .22, hue: 135, a: .11 },
      { x: .55, y: .52, rx: .40, ry: .30, hue: 140, a: .09 },
      { x: .80, y: .22, rx: .26, ry: .18, hue: 130, a: .07 },
      { x: .35, y: .72, rx: .28, ry: .18, hue: 138, a: .06 },
    ],
    fillColor: 'rgba(0,25,6,0.22)',
    strokeCols: ['rgba(0,136,0,0.10)', 'rgba(0,136,0,0.40)', 'rgba(180,255,180,0.12)'],
    lonMin: 2.5, lonMax: 15.2, latMin: 3.8, latMax: 14.0,  // bounding box covering Nigeria
    cities: [
      { name: 'LAGOS',         lat: 6.45,  lon: 3.40,  pop: 15300000, region: 'SOUTH'       },
      { name: 'KANO',          lat: 12.00, lon: 8.52,  pop: 3626068,  region: 'NORTH'       },
      { name: 'IBADAN',        lat: 7.38,  lon: 3.90,  pop: 3649000,  region: 'SOUTH'       },
      { name: 'ABUJA',         lat: 9.07,  lon: 7.40,  pop: 2440000,  region: 'FCT'         },
      { name: 'PORT HARCOURT', lat: 4.82,  lon: 7.04,  pop: 1865000,  region: 'SOUTH'       },
      { name: 'BENIN CITY',    lat: 6.34,  lon: 5.63,  pop: 1496000,  region: 'SOUTH'       },
      { name: 'MAIDUGURI',     lat: 11.85, lon: 13.16, pop: 1197000,  region: 'NORTH'       },
      { name: 'ZARIA',         lat: 11.07, lon: 7.72,  pop: 1018827,  region: 'NORTH'       },
      { name: 'OWERRI',        lat: 5.49,  lon: 7.04,  pop: 1006800,  region: 'SOUTH'       },
      { name: 'KADUNA',        lat: 10.52, lon: 7.44,  pop: 760084,   region: 'NORTH'       },
      { name: 'ENUGU',         lat: 6.45,  lon: 7.49,  pop: 723000,   region: 'SOUTH'       },
      { name: 'ILORIN',        lat: 8.50,  lon: 4.55,  pop: 814192,   region: 'MIDDLE-BELT' },
      { name: 'JOS',           lat: 9.92,  lon: 8.89,  pop: 900000,   region: 'MIDDLE-BELT' },
      { name: 'SOKOTO',        lat: 13.06, lon: 5.24,  pop: 427760,   region: 'NORTH'       },
      { name: 'WARRI',         lat: 5.52,  lon: 5.75,  pop: 536000,   region: 'SOUTH'       },
      { name: 'CALABAR',       lat: 4.95,  lon: 8.33,  pop: 459000,   region: 'SOUTH'       },
      { name: 'ONITSHA',       lat: 6.15,  lon: 6.78,  pop: 561000,   region: 'SOUTH'       },
      { name: 'ABEOKUTA',      lat: 7.16,  lon: 3.35,  pop: 591801,   region: 'SOUTH'       },
      { name: 'BAUCHI',        lat: 10.32, lon: 9.84,  pop: 490000,   region: 'NORTH'       },
      { name: 'KATSINA',       lat: 12.99, lon: 7.60,  pop: 352800,   region: 'NORTH'       },
    ],
    regionColors: {
      SOUTH:       [0.0, 0.533, 0.235], NORTH:       [0.96, 0.96, 0.96],
      FCT:         [0.0, 0.533, 0.235], 'MIDDLE-BELT':[0.96, 0.96, 0.96],
    },
    outline: [
      [2.69, 6.40],  [3.40, 6.45],  [4.00, 6.30],  [4.50, 6.00],  [4.80, 5.00],
      [5.00, 4.50],  [5.40, 4.00],  [6.00, 4.00],  [6.50, 4.20],  [7.04, 4.82],
      [7.80, 4.50],  [8.33, 4.95],  [9.00, 4.50],  [9.50, 4.30],  [10.00, 4.00],
      [10.50, 4.80], [11.00, 5.50], [11.50, 6.50], [12.00, 7.50], [12.50, 8.00],
      [13.00, 9.00], [13.16, 11.85],[13.50, 12.50],[14.00, 13.00],[14.50, 13.50],
      [14.70, 13.80],[13.50, 13.70],[12.50, 13.50],[11.50, 13.40],[10.50, 13.50],
      [9.00, 13.80], [8.00, 13.40], [7.00, 13.50], [6.00, 13.60], [5.00, 13.50],
      [4.00, 13.00], [3.50, 12.50], [3.00, 12.00], [2.70, 11.50], [2.50, 10.50],
      [2.50, 9.00],  [2.50, 7.50],  [2.69, 6.40],
    ],
  },
};