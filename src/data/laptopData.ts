import { LaptopIssue, LaptopPart } from '../types';

export const BRANDS = [
  'HP',
  'Dell',
  'Lenovo',
  'Apple (MacBook)',
  'Asus',
  'Acer',
  'MSI',
  'Samsung',
];

export const MODELS_BY_BRAND: Record<string, string[]> = {
  'HP': ['Pavilion 15', 'Spectre x360', 'Envy 13', 'Omen 16', 'EliteBook 840', 'HP 15s'],
  'Dell': ['XPS 13', 'XPS 15', 'Inspiron 15', 'Latitude 5420', 'Alienware m15', 'Vostro 3510'],
  'Lenovo': ['ThinkPad T14', 'Yoga 7i', 'IdeaPad Slim 3', 'Legion 5 Pro', 'Flex 5', 'ThinkBook 15'],
  'Apple (MacBook)': ['MacBook Air M1', 'MacBook Air M2', 'MacBook Pro 14"', 'MacBook Pro 16"', 'MacBook Pro 13" (Intel)'],
  'Asus': ['ZenBook Duo', 'ROG Zephyrus G14', 'TUF Gaming F15', 'VivoBook 15', 'ExpertBook B1'],
  'Acer': ['Swift 3', 'Aspire 5', 'Nitro 5', 'Predator Helios 300', 'Spin 5'],
  'MSI': ['GF63 Thin', 'Katana GF66', 'Modern 14', 'Stealth 15M', 'Creator M16'],
  'Samsung': ['Galaxy Book2 Pro', 'Galaxy Book Flex', 'Galaxy Book Odyssey', 'Galaxy Book Go'],
};

export const COMMON_ISSUES: LaptopIssue[] = [
  {
    id: 'screen_damage',
    name: 'Broken / Flicker Screen Replacement',
    category: 'Display',
    baseRepairCost: 3500,
    estimatedHours: '2-4 hours',
    description: 'Replacement of damaged, cracked, bleeding, or completely black LCD/LED panels with 100% original screens.'
  },
  {
    id: 'battery_fail',
    name: 'Battery Replacement (Back-up issues/Swollen)',
    category: 'Power',
    baseRepairCost: 1800,
    estimatedHours: '1-2 hours',
    description: 'Replacement of weak, non-charging, or swollen internal batteries. Includes safe disposal of the old lithium battery.'
  },
  {
    id: 'motherboard_repair',
    name: 'Motherboard Chip-level Repair / Short-circuit',
    category: 'Hardware',
    baseRepairCost: 4500,
    estimatedHours: '1-3 days',
    description: 'Advanced chip-level micro-soldering, liquid spill corrosion clean-up, IC replacement, and short-circuit repair.'
  },
  {
    id: 'keyboard_fail',
    name: 'Keyboard Replacement / Missing Keys',
    category: 'Input',
    baseRepairCost: 1200,
    estimatedHours: '2-3 hours',
    description: 'Replacing non-functional individual keys or the entire keyboard panel for sticky, broken, or water-damaged keyboards.'
  },
  {
    id: 'liquid_damage',
    name: 'Liquid Spill Damage Restoration',
    category: 'Hardware',
    baseRepairCost: 2500,
    estimatedHours: '1-2 days',
    description: 'Complete ultrasonic chemical wash of affected boards to arrest rust, re-tinning of copper tracks, and multi-point moisture bake-out.'
  },
  {
    id: 'overheating_fan',
    name: 'Overheating & Thermal Paste Application / Fan Noise',
    category: 'Thermal',
    baseRepairCost: 800,
    estimatedHours: '1-2 hours',
    description: 'Deep internal dust removal from fan vents, processor heatsink cleaning, and application of high-end cooling thermal paste.'
  },
  {
    id: 'charging_port',
    name: 'Power DC Jack / Type-C Port Replacement',
    category: 'Power',
    baseRepairCost: 950,
    estimatedHours: '1-2 hours',
    description: 'Repair or extraction of loose/damaged charging ports and soldering of fresh DC connector ports on the mainboard.'
  },
  {
    id: 'slow_performance',
    name: 'SSD & RAM Performance Upgrade',
    category: 'Speed',
    baseRepairCost: 1500,
    estimatedHours: '1 hour',
    description: 'Cloning OS to blazing fast NVMe SSD, migrating files, and expanding high-speed RAM to speed up boot and core operations.'
  }
];

export const SPARE_PARTS: LaptopPart[] = [
  // Adapters
  {
    id: 'part_hp_65w_adapter',
    name: 'HP 65W Smart AC Adapter (Blue Pin)',
    type: 'adapter',
    brand: 'HP',
    compatibleModels: ['Pavilion 15', 'HP 15s', 'Envy 13'],
    price: 1450,
    stock: 12,
    description: 'Genuine HP 65W AC Adapter with power cord. Outputs 19.5V 3.33A. Safety tested with 1 Year SKU-level Warranty.',
    image: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=600&auto=format&fit=crop&q=60'
  },
  {
    id: 'part_dell_65w_adapter',
    name: 'Dell 65W Laptop Charger (4.5mm Pin)',
    type: 'adapter',
    brand: 'Dell',
    compatibleModels: ['Inspiron 15', 'Latitude 5420', 'Vostro 3510'],
    price: 1550,
    stock: 8,
    description: 'Original Dell 65W backup adapter featuring overvoltage charging protection. Compatible with modern Inspiron and Latitude lines.',
    image: 'https://images.unsplash.com/photo-1619143100346-bf5cdce3c2bc?w=600&auto=format&fit=crop&q=60'
  },
  {
    id: 'part_apple_85w_magsafe2',
    name: 'Apple 85W MagSafe 2 Power Adapter',
    type: 'adapter',
    brand: 'Apple (MacBook)',
    compatibleModels: ['MacBook Pro 13" (Intel)', 'MacBook Pro 15"'],
    price: 3800,
    stock: 5,
    description: 'Magnetic Apple standard 85W MagSafe adapter including LED battery charging indicator. Complete overload safety certificate.',
    image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&auto=format&fit=crop&q=60'
  },
  {
    id: 'part_apple_67w_usbc',
    name: 'Apple 67W USB-C Original Power Adapter',
    type: 'adapter',
    brand: 'Apple (MacBook)',
    compatibleModels: ['MacBook Air M1', 'MacBook Air M2', 'MacBook Pro 14"'],
    price: 4900,
    stock: 7,
    description: 'USB-C fast adapter compatible with newer Apple silicon MacBook Air and 14" MacBook Pro models.',
    image: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&auto=format&fit=crop&q=60'
  },

  // Batteries
  {
    id: 'part_lenovo_l15m3pb0',
    name: 'Lenovo IdeaPad & Yoga Real Battery (L15M3PB0)',
    type: 'battery',
    brand: 'Lenovo',
    compatibleModels: ['Yoga 7i', 'IdeaPad Slim 3', 'Flex 5'],
    price: 2850,
    stock: 14,
    description: 'Genuine Lenovo internal 3-cell Rechargeable Li-ion battery. Nominal Voltage 11.25V, 45Wh capacity.',
    image: 'https://images.unsplash.com/photo-1595182811462-cbd2d9d1b0d2?w=600&auto=format&fit=crop&q=60'
  },
  {
    id: 'part_dell_wdx0r_battery',
    name: 'Dell WDX0R Original 42Wh Laptop Battery',
    type: 'battery',
    brand: 'Dell',
    compatibleModels: ['Inspiron 15', 'Latitude 5420', 'Vostro 3510'],
    price: 3100,
    stock: 9,
    description: 'Safe Dell 11.4V Lithium-ion cell battery with intelligent power cycle monitoring circuitry.',
    image: 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=600&auto=format&fit=crop&q=60'
  },
  {
    id: 'part_hp_ht03xl_battery',
    name: 'HP HT03XL Original Internal Battery',
    type: 'battery',
    brand: 'HP',
    compatibleModels: ['Pavilion 15', 'HP 15s'],
    price: 2900,
    stock: 15,
    description: 'High longevity lithium battery module compatible with HP 15s thin series. 11.55V, 41.04Wh capacity.',
    image: 'https://images.unsplash.com/photo-1624996379697-f01d168b1a52?w=600&auto=format&fit=crop&q=60'
  },

  // Motherboards
  {
    id: 'part_lenovo_t14_mobo',
    name: 'Lenovo ThinkPad T14 Motherboard (Intel i5-11th Gen)',
    type: 'motherboard',
    brand: 'Lenovo',
    compatibleModels: ['ThinkPad T14'],
    price: 12500,
    stock: 2,
    description: 'OEM replacement motherboard for ThinkPad T14 Gen 2 (Intel Core i5-1135G7 integrated, ready with memory solder slots). Direct fitting.',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=60'
  },
  {
    id: 'part_hp_p15_mobo',
    name: 'HP Pavilion 15 Core i5 mainboard (MX350 GPU)',
    type: 'motherboard',
    brand: 'HP',
    compatibleModels: ['Pavilion 15'],
    price: 11800,
    stock: 3,
    description: 'Authentic HP core motherboard featuring Intel i5 processor + dedicated NVIDIA GeForce MX350 2GB graphics chip.',
    image: 'https://images.unsplash.com/photo-1601524909162-be87252be298?w=600&auto=format&fit=crop&q=60'
  },
  {
    id: 'part_dell_xps13_mobo',
    name: 'Dell XPS 13 9305 Motherboard (i7-11th, 16GB RAM)',
    type: 'motherboard',
    brand: 'Dell',
    compatibleModels: ['XPS 13'],
    price: 18500,
    stock: 1,
    description: 'Premium masterboard replacement for Dell XPS 13. Pre-integrated with high power Intel Core i7-1165G7 and 16GB Dual-Channel LPDDR4X Memory.',
    image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=600&auto=format&fit=crop&q=60'
  },

  // Upgrades & SSD
  {
    id: 'part_crucial_1tb_nvme',
    name: 'Crucial P3 1TB PCIe M.2 NVMe SSD',
    type: 'ssd',
    brand: 'All Brands',
    compatibleModels: ['Pavilion 15', 'Inspiron 15', 'IdeaPad Slim 3', 'ZenBook Duo', 'Swift 3', 'Nitro 5'],
    price: 5200,
    stock: 45,
    description: 'Exceptional file loading benchmark - speeds up to 3500MB/s. Compatible across nearly all brands with an M.2 socket.',
    image: 'https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=600&auto=format&fit=crop&q=60'
  },
  {
    id: 'part_corsair_16gb_ddr4',
    name: 'Corsair Vengeance 16GB SODIMM DDR4 3200MHz RAM',
    type: 'ram',
    brand: 'All Brands',
    compatibleModels: ['Pavilion 15', 'Inspiron 15', 'IdeaPad Slim 3', 'Nitro 5', 'GF63 Thin', 'TUF Gaming F15'],
    price: 3400,
    stock: 30,
    description: 'Premium laptop memory module designed to boost multi-tasking limits, web browsing loads, and standard workstation performance.',
    image: 'https://images.unsplash.com/photo-1541029071473-074b372d441c?w=600&auto=format&fit=crop&q=60'
  }
];

export const SKB_INFO = {
  companyName: 'SKB Enterprises',
  city: 'New Delhi',
  subLocality: 'Nehru Place Computer Market',
  address: 'Shop No. 204, 2nd Floor, Deep Cinema Building, Commercial Complex, Nehru Place, New Delhi, Delhi 110019',
  mapCoordinates: '28.5492° N, 77.2519° E',
  phone: '+91 98104 XXXXX, +91 011-4160XXXX',
  supportEmail: 'support@skbenterprises.in',
  timings: 'Monday to Saturday: 10:30 AM - 7:30 PM (Sunday Closed)',
  features: [
    { title: 'All-Brand Repair', desc: 'Expert technicians for Apple, HP, Dell, Lenovo, Asus, Acer, MSI & more.' },
    { title: 'Nehru Place Price Edge', desc: 'Direct sourcing of authentic spare parts means we pass savings directly to you.' },
    { title: 'Instant Online Quoting', desc: 'Define your issues, choose active brand models, and see actual rates transparently.' },
    { title: 'Same-Day Diagnostics', desc: 'Quick diagnostic checks with interactive status tracking via the Client Portal.' },
  ]
};
