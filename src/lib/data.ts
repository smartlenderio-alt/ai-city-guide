// Demo dataset for the sample destination. All values are demo data, not live.
// Replace these arrays with real API responses later — the shape is the contract.

export type Category =
  | "food"
  | "attraction"
  | "shopping"
  | "culture"
  | "parking"
  | "pharmacy"
  | "emergency"
  | "cafe";

export type Availability = "available" | "limited" | "unavailable" | "unknown";

export type MenuItem = { name: string; price: number; veg: boolean };

export type Place = {
  id: string;
  name: string;
  area: string;
  category: Category;
  /** Map position in a 0-100 normalised space (demo map projection). */
  x: number;
  y: number;
  distanceKm: number;
  rating: number;
  reviews: number;
  entryFee: number;
  /** Typical spend per person for food/shopping. */
  avgSpend: number;
  opens: number; // hour, 24h
  closes: number;
  durationMin: number;
  indoor: boolean;
  hiddenGem: boolean;
  tags: string[];
  blurb: string;
  history?: string;
  accessibility: { wheelchair: boolean; stepFree: boolean; restrooms: boolean; verified: boolean };
  availability: Availability;
  verifiedHoursAgo: number;
  menu?: MenuItem[];
  parkingCostPerHour?: number;
  phone?: string;
};

export const CITY = { name: "Hyderabad", country: "India", currency: "₹" };

export const PLACES: Place[] = [
  {
    id: "charminar",
    name: "Charminar Monument",
    area: "Old City",
    category: "attraction",
    x: 46,
    y: 62,
    distanceKm: 4.2,
    rating: 4.6,
    reviews: 18422,
    entryFee: 25,
    avgSpend: 0,
    opens: 9,
    closes: 17,
    durationMin: 60,
    indoor: false,
    hiddenGem: false,
    tags: ["history", "landmark", "photography"],
    blurb: "Four-minaret monument at the heart of the old quarter, ringed by bazaars.",
    history:
      "Built in 1591 to mark the founding of the city, the four arches face the four original roads leading out of the walled town.",
    accessibility: { wheelchair: false, stepFree: false, restrooms: true, verified: true },
    availability: "available",
    verifiedHoursAgo: 3,
  },
  {
    id: "salarjung",
    name: "Salar Jung Museum",
    area: "Darushifa",
    category: "culture",
    x: 41,
    y: 55,
    distanceKm: 3.4,
    rating: 4.5,
    reviews: 9120,
    entryFee: 50,
    avgSpend: 0,
    opens: 10,
    closes: 17,
    durationMin: 90,
    indoor: true,
    hiddenGem: false,
    tags: ["museum", "history", "art", "rainy-day"],
    blurb: "One of the largest one-man art collections in the world, across 38 galleries.",
    history:
      "The personal collection of a former prime minister of the princely state, opened to the public in 1951.",
    accessibility: { wheelchair: true, stepFree: true, restrooms: true, verified: true },
    availability: "available",
    verifiedHoursAgo: 6,
  },
  {
    id: "golconda",
    name: "Golconda Fort",
    area: "Ibrahim Bagh",
    category: "attraction",
    x: 18,
    y: 40,
    distanceKm: 11.6,
    rating: 4.5,
    reviews: 21500,
    entryFee: 30,
    avgSpend: 0,
    opens: 9,
    closes: 17,
    durationMin: 150,
    indoor: false,
    hiddenGem: false,
    tags: ["history", "hiking", "views", "sunset"],
    blurb: "Hilltop citadel with acoustic gateways and a long climb to the durbar hall.",
    history: "A diamond-trading capital from the 16th century, famed for its whispering acoustics.",
    accessibility: { wheelchair: false, stepFree: false, restrooms: true, verified: true },
    availability: "available",
    verifiedHoursAgo: 20,
  },
  {
    id: "tank-bund",
    name: "Tank Bund Promenade",
    area: "Lower Tank Bund",
    category: "attraction",
    x: 55,
    y: 30,
    distanceKm: 2.1,
    rating: 4.3,
    reviews: 7640,
    entryFee: 0,
    avgSpend: 0,
    opens: 6,
    closes: 22,
    durationMin: 45,
    indoor: false,
    hiddenGem: false,
    tags: ["sunset", "walk", "free", "family"],
    blurb: "Lakefront walkway with benches, statues and an easy flat path.",
    accessibility: { wheelchair: true, stepFree: true, restrooms: true, verified: false },
    availability: "available",
    verifiedHoursAgo: 1,
  },
  {
    id: "chowmahalla",
    name: "Chowmahalla Palace",
    area: "Khilwat",
    category: "culture",
    x: 44,
    y: 59,
    distanceKm: 3.9,
    rating: 4.4,
    reviews: 8010,
    entryFee: 80,
    avgSpend: 0,
    opens: 10,
    closes: 17,
    durationMin: 75,
    indoor: true,
    hiddenGem: false,
    tags: ["palace", "history", "rainy-day", "family"],
    blurb: "Courtyard palace complex with a mirrored durbar hall and vintage car shed.",
    history: "Seat of the ruling family from the 18th century, restored in the early 2000s.",
    accessibility: { wheelchair: true, stepFree: true, restrooms: true, verified: true },
    availability: "limited",
    verifiedHoursAgo: 9,
  },
  {
    id: "shilparamam",
    name: "Shilparamam Crafts Village",
    area: "Madhapur",
    category: "shopping",
    x: 24,
    y: 20,
    distanceKm: 9.4,
    rating: 4.4,
    reviews: 12300,
    entryFee: 60,
    avgSpend: 450,
    opens: 10,
    closes: 20,
    durationMin: 90,
    indoor: false,
    hiddenGem: false,
    tags: ["handicrafts", "souvenirs", "family", "market"],
    blurb: "Artisan village with weavers, lacquerware and regional handicraft stalls.",
    accessibility: { wheelchair: true, stepFree: true, restrooms: true, verified: true },
    availability: "available",
    verifiedHoursAgo: 4,
  },
  {
    id: "laad-bazaar",
    name: "Laad Bazaar",
    area: "Old City",
    category: "shopping",
    x: 45,
    y: 64,
    distanceKm: 4.3,
    rating: 4.2,
    reviews: 6600,
    entryFee: 0,
    avgSpend: 600,
    opens: 11,
    closes: 21,
    durationMin: 60,
    indoor: false,
    hiddenGem: false,
    tags: ["bangles", "market", "souvenirs", "street"],
    blurb: "Lane of lacquer bangle shops and pearl traders beside the monument.",
    accessibility: { wheelchair: false, stepFree: false, restrooms: false, verified: false },
    availability: "available",
    verifiedHoursAgo: 12,
  },
  {
    id: "paradise",
    name: "Paradise Biryani House",
    area: "Secunderabad",
    category: "food",
    x: 62,
    y: 26,
    distanceKm: 3.1,
    rating: 4.4,
    reviews: 41200,
    entryFee: 0,
    avgSpend: 320,
    opens: 11,
    closes: 23,
    durationMin: 60,
    indoor: true,
    hiddenGem: false,
    tags: ["biryani", "dinner", "family", "rainy-day"],
    blurb: "Long-running biryani institution with fast table turnover.",
    accessibility: { wheelchair: true, stepFree: true, restrooms: true, verified: true },
    availability: "limited",
    verifiedHoursAgo: 2,
    menu: [
      { name: "Chicken Dum Biryani", price: 180, veg: false },
      { name: "Mutton Biryani", price: 260, veg: false },
      { name: "Veg Biryani", price: 150, veg: true },
      { name: "Double ka Meetha", price: 90, veg: true },
    ],
  },
  {
    id: "shah-ghouse",
    name: "Shah Ghouse Cafe",
    area: "Tolichowki",
    category: "food",
    x: 30,
    y: 48,
    distanceKm: 6.2,
    rating: 4.3,
    reviews: 28800,
    entryFee: 0,
    avgSpend: 240,
    opens: 7,
    closes: 24,
    durationMin: 45,
    indoor: true,
    hiddenGem: false,
    tags: ["biryani", "breakfast", "late-night", "budget"],
    blurb: "Round-the-clock kitchen known for haleem season and cheap breakfast plates.",
    accessibility: { wheelchair: true, stepFree: false, restrooms: true, verified: false },
    availability: "available",
    verifiedHoursAgo: 5,
    menu: [
      { name: "Chicken Biryani", price: 170, veg: false },
      { name: "Haleem Bowl", price: 190, veg: false },
      { name: "Idli Plate", price: 60, veg: true },
      { name: "Irani Chai", price: 20, veg: true },
    ],
  },
  {
    id: "chai-house",
    name: "Nizam Irani Chai House",
    area: "Nampally",
    category: "cafe",
    x: 48,
    y: 45,
    distanceKm: 2.6,
    rating: 4.5,
    reviews: 3120,
    entryFee: 0,
    avgSpend: 90,
    opens: 6,
    closes: 22,
    durationMin: 30,
    indoor: true,
    hiddenGem: true,
    tags: ["chai", "budget", "rest", "rainy-day"],
    blurb: "Marble-table chai room where regulars split Osmania biscuits over the paper.",
    accessibility: { wheelchair: true, stepFree: true, restrooms: false, verified: false },
    availability: "available",
    verifiedHoursAgo: 2,
    menu: [
      { name: "Irani Chai", price: 18, veg: true },
      { name: "Osmania Biscuits (4)", price: 30, veg: true },
      { name: "Bun Maska", price: 45, veg: true },
    ],
  },
  {
    id: "rooftop-kitchen",
    name: "Terrace 7 Rooftop Kitchen",
    area: "Banjara Hills",
    category: "food",
    x: 34,
    y: 34,
    distanceKm: 5.4,
    rating: 4.6,
    reviews: 1480,
    entryFee: 0,
    avgSpend: 780,
    opens: 12,
    closes: 23,
    durationMin: 75,
    indoor: false,
    hiddenGem: true,
    tags: ["rooftop", "sunset", "date", "views"],
    blurb: "Eight-table terrace above a bookshop, best an hour before sunset.",
    accessibility: { wheelchair: false, stepFree: false, restrooms: true, verified: false },
    availability: "limited",
    verifiedHoursAgo: 8,
    menu: [
      { name: "Wood-fired Margherita", price: 380, veg: true },
      { name: "Andhra Chilli Chicken", price: 420, veg: false },
      { name: "Filter Coffee", price: 120, veg: true },
    ],
  },
  {
    id: "sudha-cars",
    name: "Sudha Cars Museum",
    area: "Bahadurpura",
    category: "culture",
    x: 38,
    y: 72,
    distanceKm: 7.8,
    rating: 4.2,
    reviews: 2210,
    entryFee: 40,
    avgSpend: 0,
    opens: 9,
    closes: 18,
    durationMin: 60,
    indoor: true,
    hiddenGem: true,
    tags: ["quirky", "family", "rainy-day", "kids"],
    blurb: "Hand-built novelty vehicles: a camera car, a cricket-ball car, a shoe on wheels.",
    accessibility: { wheelchair: true, stepFree: true, restrooms: true, verified: false },
    availability: "available",
    verifiedHoursAgo: 30,
  },
  {
    id: "step-well",
    name: "Bansilalpet Step Well",
    area: "Bansilalpet",
    category: "culture",
    x: 58,
    y: 36,
    distanceKm: 2.9,
    rating: 4.4,
    reviews: 640,
    entryFee: 0,
    avgSpend: 0,
    opens: 8,
    closes: 19,
    durationMin: 40,
    indoor: false,
    hiddenGem: true,
    tags: ["restored", "history", "free", "photography"],
    blurb: "A restored 18th-century step well, quiet on weekday mornings.",
    history:
      "Silted over for decades, the well was excavated and restored by a community trust and reopened as a public plaza.",
    accessibility: { wheelchair: false, stepFree: false, restrooms: true, verified: false },
    availability: "available",
    verifiedHoursAgo: 26,
  },
  {
    id: "birla-temple",
    name: "Hilltop Marble Temple",
    area: "Naubat Pahad",
    category: "culture",
    x: 50,
    y: 38,
    distanceKm: 3.0,
    rating: 4.7,
    reviews: 15900,
    entryFee: 0,
    avgSpend: 0,
    opens: 7,
    closes: 21,
    durationMin: 50,
    indoor: false,
    hiddenGem: false,
    tags: ["temple", "views", "culture", "sunset"],
    blurb: "White marble shrine on a rock outcrop with a full city panorama.",
    history:
      "Carved from white marble over ten years and opened in 1976, the shrine blends several regional temple styles.",
    accessibility: { wheelchair: true, stepFree: false, restrooms: true, verified: true },
    availability: "available",
    verifiedHoursAgo: 4,
  },
  {
    id: "lake-park",
    name: "Necklace Road Lake Park",
    area: "Necklace Road",
    category: "attraction",
    x: 56,
    y: 33,
    distanceKm: 2.4,
    rating: 4.1,
    reviews: 5400,
    entryFee: 10,
    avgSpend: 0,
    opens: 6,
    closes: 21,
    durationMin: 45,
    indoor: false,
    hiddenGem: false,
    tags: ["family", "seniors", "flat-walk", "rest"],
    blurb: "Flat lakeside park with plenty of shaded seating and clean restrooms.",
    accessibility: { wheelchair: true, stepFree: true, restrooms: true, verified: true },
    availability: "available",
    verifiedHoursAgo: 7,
  },
  {
    id: "parking-old-city",
    name: "Old City Multi-level Parking",
    area: "Old City",
    category: "parking",
    x: 47,
    y: 60,
    distanceKm: 4.0,
    rating: 3.9,
    reviews: 410,
    entryFee: 0,
    avgSpend: 0,
    opens: 6,
    closes: 23,
    durationMin: 0,
    indoor: true,
    hiddenGem: false,
    tags: ["parking", "covered"],
    blurb: "Covered parking, 4-minute walk to the monument gate.",
    accessibility: { wheelchair: true, stepFree: true, restrooms: true, verified: false },
    availability: "limited",
    verifiedHoursAgo: 1,
    parkingCostPerHour: 30,
  },
  {
    id: "parking-museum",
    name: "Museum Street Parking",
    area: "Darushifa",
    category: "parking",
    x: 40,
    y: 54,
    distanceKm: 3.5,
    rating: 3.6,
    reviews: 190,
    entryFee: 0,
    avgSpend: 0,
    opens: 8,
    closes: 20,
    durationMin: 0,
    indoor: false,
    hiddenGem: false,
    tags: ["parking", "open-air"],
    blurb: "Open-air lot beside the museum wall, fills up after 11:00.",
    accessibility: { wheelchair: true, stepFree: true, restrooms: false, verified: false },
    availability: "available",
    verifiedHoursAgo: 2,
    parkingCostPerHour: 20,
  },
  {
    id: "pharmacy-central",
    name: "Central 24x7 Pharmacy",
    area: "Nampally",
    category: "pharmacy",
    x: 49,
    y: 44,
    distanceKm: 1.4,
    rating: 4.3,
    reviews: 820,
    entryFee: 0,
    avgSpend: 0,
    opens: 0,
    closes: 24,
    durationMin: 0,
    indoor: true,
    hiddenGem: false,
    tags: ["pharmacy", "24x7"],
    blurb: "Open all night, stocks most common prescriptions.",
    accessibility: { wheelchair: true, stepFree: true, restrooms: false, verified: false },
    availability: "available",
    verifiedHoursAgo: 3,
    phone: "+91 40 2345 0001",
  },
  {
    id: "pharmacy-hills",
    name: "Hillside Medicals",
    area: "Banjara Hills",
    category: "pharmacy",
    x: 33,
    y: 33,
    distanceKm: 5.1,
    rating: 4.0,
    reviews: 260,
    entryFee: 0,
    avgSpend: 0,
    opens: 8,
    closes: 22,
    durationMin: 0,
    indoor: true,
    hiddenGem: false,
    tags: ["pharmacy"],
    blurb: "Neighbourhood chemist with home delivery in the area.",
    accessibility: { wheelchair: true, stepFree: true, restrooms: false, verified: false },
    availability: "available",
    verifiedHoursAgo: 11,
    phone: "+91 40 2345 0042",
  },
];

export type EmergencyPlace = {
  id: string;
  name: string;
  kind: "hospital" | "police" | "fire";
  distanceKm: number;
  minutes: number;
  phone: string;
  area: string;
  open24: boolean;
};

export const EMERGENCY: EmergencyPlace[] = [
  {
    id: "hosp-1",
    name: "City General Hospital",
    kind: "hospital",
    distanceKm: 1.8,
    minutes: 7,
    phone: "108",
    area: "Nampally",
    open24: true,
  },
  {
    id: "hosp-2",
    name: "Lakeview Multispeciality",
    kind: "hospital",
    distanceKm: 3.2,
    minutes: 11,
    phone: "+91 40 2200 1188",
    area: "Necklace Road",
    open24: true,
  },
  {
    id: "pol-1",
    name: "Central Police Station",
    kind: "police",
    distanceKm: 1.1,
    minutes: 5,
    phone: "100",
    area: "Abids",
    open24: true,
  },
  {
    id: "fire-1",
    name: "District Fire Station",
    kind: "fire",
    distanceKm: 2.6,
    minutes: 9,
    phone: "101",
    area: "Gandhi Nagar",
    open24: true,
  },
];

export type WeatherSlot = { hour: number; tempC: number; condition: "clear" | "cloud" | "rain" | "hot" };

export const WEATHER: { now: WeatherSlot; hourly: WeatherSlot[]; summary: string } = {
  now: { hour: 16, tempC: 29, condition: "cloud" },
  hourly: [
    { hour: 9, tempC: 26, condition: "clear" },
    { hour: 11, tempC: 31, condition: "hot" },
    { hour: 13, tempC: 33, condition: "hot" },
    { hour: 15, tempC: 30, condition: "cloud" },
    { hour: 16, tempC: 29, condition: "cloud" },
    { hour: 17, tempC: 27, condition: "rain" },
    { hour: 18, tempC: 26, condition: "rain" },
    { hour: 19, tempC: 25, condition: "cloud" },
    { hour: 20, tempC: 25, condition: "clear" },
  ],
  summary: "Cloudy now, showers likely around 17:00. Demo forecast data.",
};

export type Ticket = {
  placeId: string;
  adult: number;
  child: number;
  official: boolean;
  note: string;
};

export const TICKETS: Ticket[] = [
  { placeId: "charminar", adult: 25, child: 0, official: true, note: "Counter closes 16:30." },
  { placeId: "golconda", adult: 30, child: 10, official: true, note: "Light show ticketed separately." },
  { placeId: "salarjung", adult: 50, child: 20, official: true, note: "Closed Fridays." },
  { placeId: "chowmahalla", adult: 80, child: 30, official: false, note: "Estimated from last visit reports." },
  { placeId: "shilparamam", adult: 60, child: 30, official: true, note: "Entry only, stalls priced separately." },
  { placeId: "sudha-cars", adult: 40, child: 20, official: false, note: "Community reported price." },
];

export type Business = {
  id: string;
  name: string;
  category: string;
  placeId?: string;
  status: "published" | "pending";
  views: number;
  searchAppearances: number;
  saves: number;
  offerClicks: number;
  availability: Availability;
  offers: { id: string; title: string; detail: string; active: boolean }[];
  hours: string;
  updatedHoursAgo: number;
  menu: MenuItem[];
};

export const BUSINESSES: Business[] = [
  {
    id: "biz-chai",
    name: "Nizam Irani Chai House",
    category: "Cafe",
    placeId: "chai-house",
    status: "published",
    views: 2140,
    searchAppearances: 8830,
    saves: 412,
    offerClicks: 178,
    availability: "available",
    hours: "06:00 – 22:00, daily",
    updatedHoursAgo: 2,
    offers: [
      { id: "o1", title: "Chai + biscuits ₹40", detail: "Weekdays before 10:00", active: true },
      { id: "o2", title: "Evening bun maska combo", detail: "After 17:00, ₹60", active: false },
    ],
    menu: [
      { name: "Irani Chai", price: 18, veg: true },
      { name: "Osmania Biscuits (4)", price: 30, veg: true },
      { name: "Bun Maska", price: 45, veg: true },
    ],
  },
  {
    id: "biz-terrace",
    name: "Terrace 7 Rooftop Kitchen",
    category: "Restaurant",
    placeId: "rooftop-kitchen",
    status: "published",
    views: 1310,
    searchAppearances: 4210,
    saves: 260,
    offerClicks: 94,
    availability: "limited",
    hours: "12:00 – 23:00, daily",
    updatedHoursAgo: 8,
    offers: [{ id: "o3", title: "Sunset table hold", detail: "Reserve 17:30 seating free", active: true }],
    menu: [
      { name: "Wood-fired Margherita", price: 380, veg: true },
      { name: "Andhra Chilli Chicken", price: 420, veg: false },
      { name: "Filter Coffee", price: 120, veg: true },
    ],
  },
  {
    id: "biz-craft",
    name: "Warangal Weaves Stall",
    category: "Handicrafts",
    status: "pending",
    views: 320,
    searchAppearances: 910,
    saves: 41,
    offerClicks: 12,
    availability: "unknown",
    hours: "10:00 – 20:00, Tue–Sun",
    updatedHoursAgo: 52,
    offers: [],
    menu: [],
  },
];

export type Report = {
  id: string;
  placeId: string;
  type: "price" | "hours" | "closure" | "photo";
  detail: string;
  reportedHoursAgo: number;
  status: "open" | "resolved";
};

export const REPORTS: Report[] = [
  {
    id: "r1",
    placeId: "laad-bazaar",
    type: "hours",
    detail: "Most shops now shut by 20:30, not 21:00.",
    reportedHoursAgo: 5,
    status: "open",
  },
  {
    id: "r2",
    placeId: "sudha-cars",
    type: "price",
    detail: "Adult entry raised to ₹50.",
    reportedHoursAgo: 14,
    status: "open",
  },
  {
    id: "r3",
    placeId: "step-well",
    type: "photo",
    detail: "New photos of the restored plaza.",
    reportedHoursAgo: 40,
    status: "resolved",
  },
];

export const INTERESTS = [
  "History",
  "Food",
  "Shopping",
  "Culture",
  "Nature",
  "Photography",
  "Nightlife",
  "Family",
] as const;

export const LANGUAGES = [
  { code: "en", label: "English", sample: "Show me a good place nearby for the evening." },
  { code: "te", label: "Telugu", sample: "Naku daggara lo evening ki family tho velladaniki manchi place cheppu." },
  { code: "hi", label: "Hindi", sample: "Mere paas 3 ghante hain, kya kar sakta hoon?" },
  { code: "ta", label: "Tamil", sample: "Enakku arugil nalla saapaadu edhu?" },
] as const;

export const placeById = (id: string) => PLACES.find((p) => p.id === id);
