export type ProductType = "pre-printed" | "pod";
export type MaterialFinish = "matte-pla" | "silk-pla" | "resin" | "painted";
export type Category =
  | "pots" | "wall-arts" | "ornaments"
  | "action-figures" | "statues" | "light-boxes"
  | "filament" | "nozzles" | "parts"
  | "custom";

export interface Product {
  id: string;
  name: string;
  price: number;
  priceRs: number;
  category: Category;
  finish: MaterialFinish;
  type: ProductType;
  images: string[];
  description: string;
  rating: number;
  reviews: number;
  printHours?: number;
  topSelling?: boolean;
  stock?: number;
  filamentColorId?: string;
  gramsPerUnit?: number;
  maxChars?: number;
}

export interface FilamentSpool {
  id: string;
  colorName: string;
  hex: string;
  material: "PLA Matte" | "PLA Silk" | "PETG" | "Resin";
  remainingGrams: number;
  totalGrams: number;
}

export type OrderStage = "new" | "print-queue" | "printing" | "ready-to-ship" | "shipped";

export interface Order {
  id: string;
  customer: string;
  placed: string;
  productId: string;
  productName: string;
  type: ProductType;
  qty: number;
  customText?: string;
  stage: OrderStage;
  total: number;
}

export const filaments: FilamentSpool[] = [
  { id: "f-white", colorName: "White", hex: "#f5f5f2", material: "PLA Matte", remainingGrams: 780, totalGrams: 1000 },
  { id: "f-green", colorName: "Bamboo Green", hex: "#4a7c3f", material: "PLA Silk", remainingGrams: 340, totalGrams: 1000 },
  { id: "f-black", colorName: "Midnight", hex: "#1a2b18", material: "PLA Matte", remainingGrams: 620, totalGrams: 1000 },
  { id: "f-grey", colorName: "Stone Grey", hex: "#8a9a8b", material: "PLA Matte", remainingGrams: 90, totalGrams: 750 },
  { id: "f-gold", colorName: "Gold Silk", hex: "#c5a142", material: "PLA Silk", remainingGrams: 460, totalGrams: 500 },
];

export const products: Product[] = [
  {
    id: "p-01",
    name: "Geometric Planter Pod",
    price: 24.99,
    priceRs: 4500,
    category: "pots",
    finish: "matte-pla",
    type: "pre-printed",
    stock: 14,
    rating: 4.8,
    reviews: 32,
    printHours: 6,
    topSelling: true,
    description: "Minimalist geometric planter with drainage hole. Perfect for succulents and small plants. Printed in matte bone PLA, sealed interior.",
    images: [
      "https://images.unsplash.com/photo-1730267252256-67bee55353e8?w=800&h=1000&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1730267245087-5c7b159e2ddc?w=800&h=1000&fit=crop&auto=format",
    ],
  },
  {
    id: "p-02",
    name: "Dynamic Warrior Figure",
    price: 34.99,
    priceRs: 6200,
    category: "action-figures",
    finish: "painted",
    type: "pre-printed",
    stock: 7,
    rating: 4.9,
    reviews: 58,
    printHours: 14,
    topSelling: true,
    description: "Highly detailed action figure in a dynamic battle pose with sword and gun. Hand-painted finish with weathering effects.",
    images: [
      "https://images.unsplash.com/photo-1776736851933-4a2ece025ec5?w=800&h=1000&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1630412612770-dc85fccc79d5?w=800&h=1000&fit=crop&auto=format",
    ],
  },
  {
    id: "p-03",
    name: "Custom Name Tag — Serif",
    price: 12.99,
    priceRs: 2300,
    category: "custom",
    finish: "matte-pla",
    type: "pod",
    filamentColorId: "f-white",
    gramsPerUnit: 28,
    maxChars: 20,
    rating: 4.7,
    reviews: 124,
    printHours: 2,
    topSelling: true,
    description: "Made-to-order nameplate in your choice of filament color. Perfect for desks, doors, and gifting. Serif font, precision-printed.",
    images: [
      "https://images.unsplash.com/photo-1742745063996-8d74bacb8a9e?w=800&h=1000&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1588883819938-de362db62aa3?w=800&h=1000&fit=crop&auto=format",
    ],
  },
  {
    id: "p-04",
    name: "Hex Panel Wall Art",
    price: 42.00,
    priceRs: 7500,
    category: "wall-arts",
    finish: "matte-pla",
    type: "pre-printed",
    stock: 5,
    rating: 4.6,
    reviews: 19,
    printHours: 18,
    topSelling: true,
    description: "Modular hexagonal wall art panel. Mount solo or tile together for a statement wall. Available in matte white or bone.",
    images: [
      "https://images.unsplash.com/photo-1515155075601-23009d0cb6d4?w=800&h=1000&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1524351543168-8e38787614e9?w=800&h=1000&fit=crop&auto=format",
    ],
  },
  {
    id: "p-05",
    name: "Darth Vader Bust",
    price: 28.99,
    priceRs: 5200,
    category: "statues",
    finish: "painted",
    type: "pre-printed",
    stock: 12,
    rating: 4.9,
    reviews: 87,
    printHours: 10,
    description: "Iconic Darth Vader bust, precision-printed at 0.1mm resolution and hand-finished with a matte black coat.",
    images: [
      "https://images.unsplash.com/photo-1638429489654-9d298ecfe49f?w=800&h=1000&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1674271895767-d06559f81f1e?w=800&h=1000&fit=crop&auto=format",
    ],
  },
  {
    id: "p-06",
    name: "Botanical Vase Trio",
    price: 19.99,
    priceRs: 3600,
    category: "pots",
    finish: "silk-pla",
    type: "pre-printed",
    stock: 9,
    rating: 4.5,
    reviews: 44,
    printHours: 8,
    description: "Set of three organic-form bud vases in silk PLA. Silk sheen finish, watertight base, dishwasher-safe coating.",
    images: [
      "https://images.unsplash.com/photo-1595154590878-2447aa53bde1?w=800&h=1000&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1730267252256-67bee55353e8?w=800&h=1000&fit=crop&auto=format",
    ],
  },
  {
    id: "p-07",
    name: "Light Box Diorama",
    price: 54.99,
    priceRs: 9800,
    category: "light-boxes",
    finish: "resin",
    type: "pre-printed",
    stock: 4,
    rating: 4.8,
    reviews: 23,
    printHours: 22,
    description: "Layered LED light box with scenic diorama. USB-C powered, three brightness levels, resin finish.",
    images: [
      "https://images.unsplash.com/photo-1483959651481-dc75b89291f1?w=800&h=1000&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1454117096348-e4abbeba002c?w=800&h=1000&fit=crop&auto=format",
    ],
  },
  {
    id: "p-08",
    name: "Custom Door Marker",
    price: 18.99,
    priceRs: 3400,
    category: "custom",
    finish: "matte-pla",
    type: "pod",
    filamentColorId: "f-green",
    gramsPerUnit: 55,
    maxChars: 24,
    rating: 4.6,
    reviews: 66,
    printHours: 3,
    description: "House number or family name printed to order. UV-resistant coating option available. Ships island-wide.",
    images: [
      "https://images.unsplash.com/photo-1588883819938-de362db62aa3?w=800&h=1000&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1742745063996-8d74bacb8a9e?w=800&h=1000&fit=crop&auto=format",
    ],
  },
];

export const initialOrders: Order[] = [
  { id: "SO-1042", customer: "M. Perera", placed: "Jul 05", productId: "p-03", productName: "Custom Name Tag — Serif", type: "pod", qty: 1, customText: "AURAFORM", stage: "print-queue", total: 2300 },
  { id: "SO-1043", customer: "L. Fernando", placed: "Jul 05", productId: "p-01", productName: "Geometric Planter Pod", type: "pre-printed", qty: 1, stage: "ready-to-ship", total: 4500 },
  { id: "SO-1044", customer: "J. Silva", placed: "Jul 06", productId: "p-08", productName: "Custom Door Marker", type: "pod", qty: 2, customText: "SILVA — 22B", stage: "new", total: 6800 },
  { id: "SO-1045", customer: "R. Wickrama", placed: "Jul 06", productId: "p-04", productName: "Hex Panel Wall Art", type: "pre-printed", qty: 1, stage: "new", total: 7500 },
  { id: "SO-1046", customer: "S. Gunawardena", placed: "Jul 07", productId: "p-03", productName: "Custom Name Tag — Serif", type: "pod", qty: 1, customText: "DESIGN STUDIO", stage: "printing", total: 2300 },
  { id: "SO-1047", customer: "H. Rathnayake", placed: "Jul 07", productId: "p-02", productName: "Dynamic Warrior Figure", type: "pre-printed", qty: 1, stage: "shipped", total: 6200 },
];

export const categoryLabels: Record<string, string> = {
  pots: "Pots",
  "wall-arts": "Wall Arts",
  ornaments: "Ornaments",
  "action-figures": "Action Figures",
  statues: "Statues",
  "light-boxes": "Light Boxes",
  custom: "Custom",
  filament: "Filament",
  nozzles: "Nozzles",
  parts: "Parts & Spares",
};

export const finishLabels: Record<MaterialFinish, string> = {
  "matte-pla": "Matte PLA",
  "silk-pla": "Silk PLA",
  "resin": "Resin",
  "painted": "Hand-Painted",
};
