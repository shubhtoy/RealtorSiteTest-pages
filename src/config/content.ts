import type {
  AccessibilityContent,
  AmenityCategory,
  CTAContent,
  CommunityFeaturesContent,
  ContactInfo,
  FAQItem,
  FloorPlanItem,
  FocusCardItem,
  HeroContent,
  LeaseTermsContent,
  MaintenanceContent,
  NeighborhoodContent,
  ParkingContent,
  PetPolicyContent,
  ResidentPortalContent,
  SiteMetadata,
  StatItem,
  TestimonialItem,
} from "@/types/content";

export const siteMetadata: SiteMetadata = {
  name: "Baba Flats",
  tagline: "Premium Apartment Living in Atlanta",
  description:
    "Modern 1BR, 2BR, and 3BR apartments in Atlanta with practical layouts, pet-friendly spaces, and a connected location.",
  keywords: [
    "Atlanta apartments",
    "Baba Flats",
    "1BR apartments",
    "2BR apartments",
    "3BR apartments",
    "pet-friendly apartments",
  ],
};

export const heroContent: HeroContent = {
  tagline: "Premium Apartment Living",
  title: "Atlanta Homes That Feel",
  flipWords: ["Modern", "Warm", "Effortless"],
  description:
    "Explore 1BR, 2BR, and 3BR homes with practical layouts, bright interiors, and a connected neighborhood location. Placeholder marketing copy: this lead paragraph can scale to two or three lines for stronger storytelling while still preserving fast scanning and clear CTA focus.",
  images: [
    "/images/exterior.jpg",
    "/images/aerial.jpg",
    "/images/living-1br.jpg",
    "/images/kitchen-2br.jpg",
    "/images/home-3br.jpg",
  ],
  cta: {
    primary: { text: "Explore Gallery", link: "/gallery" },
    secondary: { text: "Book a Tour", link: "/contact" },
  },
};

export const statsContent: StatItem[] = [
  { value: 720, suffix: "+", label: "Min Sq Ft" },
  { value: 1250, suffix: "", label: "Max Sq Ft" },
  { value: 3, suffix: "", label: "Layout Options" },
  { value: 98, suffix: "%", label: "Resident Satisfaction" },
];

export const focusCardsContent: FocusCardItem[] = [
  { title: "1BR / 1BA Suite", src: "/images/living-1br.jpg" },
  { title: "2BR / 1BA Home", src: "/images/kitchen-2br.jpg" },
  { title: "3BR / 2BA Family", src: "/images/home-3br.jpg" },
];

export const floorPlansContent: FloorPlanItem[] = [
  {
    title: "1BR / 1BA",
    bedrooms: 1,
    bathrooms: 1,
    sqft: "~720 sq ft",
    description:
      "Efficient circulation with bright living room and practical kitchen flow. Placeholder detail text can include sample resident persona use-cases, furniture fit notes, and common move-in questions.",
    image: "/images/living-1br.jpg",
    features: [
      "Open-concept living area",
      "Modern kitchen with stainless finishes",
      "Large windows for natural light",
    ],
    priceRange: "Contact for pricing",
  },
  {
    title: "2BR / 1BA",
    bedrooms: 2,
    bathrooms: 1,
    sqft: "~950 sq ft",
    description:
      "Balanced shared and private zones for flexibility and comfort. Placeholder detail text demonstrates medium-length copy so design review can evaluate line breaks, card density, and hierarchy.",
    image: "/images/kitchen-2br.jpg",
    features: [
      "Generous common area",
      "Updated kitchen and storage",
      "Flexible second bedroom",
    ],
    priceRange: "Contact for pricing",
  },
  {
    title: "3BR / 2BA",
    bedrooms: 3,
    bathrooms: 2,
    sqft: "~1,250 sq ft",
    description:
      "Expanded footprint with family-friendly room count. Placeholder detail copy can hold storage notes, room dimensions context, and multigenerational use scenarios before final copy is signed off.",
    image: "/images/home-3br.jpg",
    features: [
      "Primary suite with private bath",
      "Two additional bedrooms",
      "Ideal layout for larger households",
    ],
    priceRange: "Contact for pricing",
  },
];

export const amenitiesContent: AmenityCategory[] = [
  {
    id: "comfort",
    label: "Comfort",
    title: "Everyday Practicality",
    description:
      "On-site laundry, reliable parking, and responsive leasing support make daily routines easier.",
    image: "/images/laundry.jpg",
    features: ["On-site laundry", "Dedicated parking", "24/7 emergency maintenance"],
  },
  {
    id: "community",
    label: "Community",
    title: "Pet-Friendly Living",
    description:
      "Walkable outdoor spaces and a welcoming community atmosphere for residents and pets.",
    image: "/images/dog-park.jpg",
    features: ["Dog park", "Pet stations", "Resident-friendly atmosphere"],
  },
  {
    id: "location",
    label: "Location",
    title: "Connected Atlanta Access",
    description:
      "Fast access to commuter routes, retail corridors, and daily essentials across Atlanta.",
    image: "/images/aerial.jpg",
    features: ["Quick highway access", "Nearby retail", "Connected neighborhood routes"],
  },
];

export const testimonialsContent: TestimonialItem[] = [
  {
    quote:
      "Moving into Baba Flats was the best decision. The layout is practical, the community is welcoming, and the location is perfect for my commute.",
    name: "Sarah M.",
    designation: "1BR Resident since 2024",
    src: "/images/living-1br.jpg",
  },
  {
    quote:
      "The 2BR unit gives us exactly the space we need. The kitchen is functional, natural light is great, and move-in was seamless.",
    name: "James and Priya K.",
    designation: "2BR Residents since 2023",
    src: "/images/kitchen-2br.jpg",
  },
  {
    quote:
      "Our family loves the 3BR layout. The dog park is a huge plus, and having laundry on-site saves us a lot of time every week.",
    name: "The Rodriguez Family",
    designation: "3BR Residents since 2024",
    src: "/images/home-3br.jpg",
  },
];

export const faqContent: FAQItem[] = [
  {
    question: "What layout types are available?",
    answer:
      "1BR/1BA, 2BR/1BA, and 3BR/2BA options are available based on current inventory. Placeholder expansion: this answer can also include typical square-foot ranges and best-fit household examples.",
    category: "Units",
  },
  {
    question: "Can I schedule a same-week tour?",
    answer:
      "Yes. Contact leasing for current openings and same-week availability. Placeholder expansion: include suggested tour windows, what to bring, and virtual tour alternatives when schedules are tight.",
    category: "Tours",
  },
  {
    question: "Is the community pet-friendly?",
    answer:
      "Yes, pet-friendly living is available with practical outdoor access. Placeholder expansion: final copy can list max pets, estimated fees, breed guidance, and nearby walking routes.",
    category: "Pets",
  },
  {
    question: "What amenities are included?",
    answer:
      "On-site laundry, dedicated parking, responsive leasing support, and updated interior finishes. Placeholder expansion: this can be split into in-home amenities vs community amenities for easier scanning.",
    category: "Amenities",
  },
  {
    question: "How quickly are maintenance requests handled?",
    answer:
      "Routine requests are typically handled in normal business windows, while urgent issues are prioritized. Placeholder expansion: final copy can include average response times and emergency examples.",
    category: "Maintenance",
  },
  {
    question: "What documents are needed to apply?",
    answer:
      "Most applications require valid ID, proof of income, and prior rental history. Placeholder expansion: add exact file formats, guarantor requirements, and screening criteria as needed.",
    category: "Application",
  },
  {
    question: "Are short-term leases available?",
    answer:
      "Lease options vary by inventory and season. Placeholder expansion: this answer can include standard term lengths, premium adjustments, and renewal path examples.",
    category: "Leasing",
  },
  {
    question: "Which utilities are resident responsibility?",
    answer:
      "Utility responsibilities depend on unit and lease details. Placeholder expansion: final content can list included utilities, setup providers, and estimated monthly ranges.",
    category: "Utilities",
  },
];

export const galleryImages: string[] = [
  "/images/exterior.jpg",
  "/images/living-1br.jpg",
  "/images/kitchen-2br.jpg",
  "/images/aerial.jpg",
  "/images/home-3br.jpg",
  "/images/entrance.jpg",
  "/images/dog-park.jpg",
  "/images/kitchen-1br.jpg",
  "/images/laundry.jpg",
];

export const homeHeroRailMedia: string[] = [
  "/images/exterior.jpg",
  "/images/aerial.jpg",
  "/images/living-1br.jpg",
  "/images/kitchen-2br.jpg",
  "/images/home-3br.jpg",
  "/images/entrance.jpg",
  "/images/dog-park.jpg",
  "/images/kitchen-1br.jpg",
  "/images/laundry.jpg",
];

export const homeQuickHighlights: Array<{ title: string; description: string; link: string }> = [
  {
    title: "Floor Plans That Fit",
    description: "1BR, 2BR, and 3BR options with practical flow and flexible living zones.",
    link: "/gallery",
  },
  {
    title: "Pet-Friendly By Design",
    description: "Dog park, walkable outdoor paths, and daily convenience for pet owners.",
    link: "/gallery",
  },
  {
    title: "Connected Atlanta Access",
    description: "Fast commuter routes with retail and essentials minutes from home.",
    link: "/contact",
  },
];

export const homeAmenityPanels: Array<{ title: string; description: string; image: string }> = [
  {
    title: "On-Site Laundry Facilities",
    description:
      "Modern laundry rooms are available on-site, reducing off-site trips and making your routine faster. Clean stations and practical layout keep laundry day easy.",
    image: "/images/laundry.jpg",
  },
  {
    title: "Pet-Friendly Community",
    description:
      "Dedicated pet zones, walkable paths, and convenient waste stations support a better daily rhythm for residents with pets.",
    image: "/images/dog-park.jpg",
  },
  {
    title: "Connected Atlanta Access",
    description:
      "Live near commuter routes, retail corridors, and neighborhood essentials so weekdays run smoother and weekends stay flexible.",
    image: "/images/aerial.jpg",
  },
  {
    title: "Updated Interiors",
    description:
      "Practical kitchens, bright living areas, and refreshed finishes create homes that are easy to maintain and comfortable to live in.",
    image: "/images/kitchen-2br.jpg",
  },
];

export const ctaContent: CTAContent = {
  tagline: "Contact Leasing",
  title: "Ready to See Your Next Home?",
  description: "Call directly or open the full tour request form.",
  actions: {
    primary: { text: "(770) 726-8907", link: "tel:+17707268907", type: "phone" },
    secondary: { text: "Contact Page", link: "/contact", type: "link" },
  },
};

export const contactInfo: ContactInfo = {
  phone: "(770) 726-8907",
  email: "Contact@babaflats.com",
  address: {
    street: "1204 Veterans Memorial Hwy SW",
    city: "Atlanta",
    state: "GA",
    zip: "30126",
    full: "1204 Veterans Memorial Hwy SW, Atlanta, GA 30126",
  },
  hours: {
    weekdays: "Monday - Friday: 9:00 AM - 6:00 PM",
    weekends: "Saturday: 10:00 AM - 4:00 PM, Sunday: Closed",
  },
  mapEmbedUrl:
    "https://www.google.com/maps?q=1204+Veterans+Memorial+Hwy+SW,+Atlanta,+GA&output=embed",
};

export const neighborhoodContent: NeighborhoodContent = {
  title: "Your Atlanta Neighborhood",
  tagline: "Location and Lifestyle",
  description:
    "Baba Flats offers quick access to major routes, shopping, dining, and everyday essentials while staying rooted in a welcoming neighborhood environment. Placeholder copy: this paragraph can be extended to include commute patterns, lifestyle highlights, and weekend itinerary examples.",
  highlights: [
    {
      title: "Downtown Atlanta",
      description: "Easy commute to business and entertainment districts.",
      distance: "15 minutes",
    },
    {
      title: "Hartsfield-Jackson Airport",
      description: "Convenient travel access for frequent flyers.",
      distance: "10 minutes",
    },
    {
      title: "Greenbriar Mall",
      description: "Nearby retail and dining options.",
      distance: "5 minutes",
    },
    {
      title: "Cascade Springs Preserve",
      description: "Green space and trails for weekends outdoors.",
      distance: "8 minutes",
    },
  ],
  nearbyPlaces: [
    {
      category: "Shopping and Retail",
      places: ["Greenbriar Mall", "Camp Creek Marketplace", "Target", "Walmart Supercenter"],
    },
    {
      category: "Dining and Entertainment",
      places: ["Local restaurants", "Cafes", "Cinema options", "Neighborhood dining"],
    },
  ],
};

export const petPolicyContent: PetPolicyContent = {
  title: "Pet-Friendly Community",
  tagline: "Pets Welcome",
  description: "We welcome your companions and support pet-friendly living every day.",
  allowed: true,
  restrictions: {
    maxPets: 2,
    weightLimit: "50 lbs per pet",
    breeds: ["Most breeds welcome", "Some restrictions apply", "Contact leasing for details"],
  },
  amenities: ["Dog park", "Pet relief areas", "Waste stations", "Walkable outdoor routes"],
  fees: {
    deposit: "$300 per pet (refundable)",
    monthlyRent: "$25 per pet",
    note: "Service and support animals are handled per Fair Housing guidelines.",
  },
};

export const leaseTermsContent: LeaseTermsContent = {
  title: "Flexible Lease Options",
  tagline: "Lease Terms",
  description: "Choose terms that match your timeline and housing needs.",
  terms: {
    standard: ["12-month lease", "Renewal options", "Competitive monthly pricing"],
    flexible: ["6-month lease", "Month-to-month after initial term", "Corporate options"],
  },
  requirements: {
    title: "Application Requirements",
    items: [
      "Valid ID",
      "Proof of income",
      "Rental history",
      "Background and credit screening",
    ],
  },
  utilities: {
    included: ["Water", "Sewer", "Trash"],
    tenant: ["Electricity", "Gas (if applicable)", "Internet", "Renter's insurance"],
  },
};

export const communityFeaturesContent: CommunityFeaturesContent = {
  title: "Community Amenities",
  tagline: "More Than Just an Apartment",
  description: "A practical and resident-focused set of daily conveniences.",
  features: [
    { title: "On-Site Laundry", description: "Well-maintained facilities for daily convenience." },
    { title: "Dedicated Parking", description: "Assigned spaces with practical access." },
    { title: "Responsive Management", description: "Helpful on-site team and clear communication." },
    { title: "24/7 Maintenance", description: "Emergency support when urgent needs arise." },
  ],
};

export const accessibilityContent: AccessibilityContent = {
  title: "Accessibility Features",
  tagline: "Inclusive Living",
  description: "We support residents with accessible options and reasonable accommodations.",
  features: [
    "Ground-floor options",
    "Accessible parking",
    "Wide pathways in select units",
    "Accessible common areas",
  ],
  contact: "Please contact leasing for specific accessibility requests and available options.",
};

export const parkingContent: ParkingContent = {
  title: "Parking Information",
  tagline: "Convenient Parking",
  description: "Resident and guest parking options are available with clear policies.",
  options: [
    {
      type: "Resident Parking",
      description: "One assigned space per unit in most cases.",
      cost: "Included in rent",
    },
    {
      type: "Additional Parking",
      description: "Extra spaces may be available based on inventory.",
      cost: "$25/month",
    },
    {
      type: "Guest Parking",
      description: "Designated guest areas available.",
      cost: "No charge for short-term visits",
    },
  ],
};

export const maintenanceContent: MaintenanceContent = {
  title: "Maintenance and Support",
  tagline: "We Are Here to Help",
  description: "Our maintenance team handles routine and emergency requests promptly.",
  services: [
    "Emergency maintenance",
    "HVAC service",
    "Plumbing and electrical",
    "Appliance support",
  ],
  emergency: {
    phone: "(770) 726-8907",
    available: "24/7",
  },
  requestProcess: [
    "Submit through resident portal",
    "Receive confirmation",
    "Track status",
    "Issue resolved and closed",
  ],
};

export const residentPortalContent: ResidentPortalContent = {
  title: "Online Resident Portal",
  tagline: "Manage Your Home Online",
  description: "Use the portal for payments, requests, and communication.",
  features: [
    { title: "Pay Rent", description: "Set one-time or auto-pay online." },
    { title: "Maintenance Requests", description: "Submit requests with details and updates." },
    { title: "Lease Documents", description: "Access key documents when needed." },
    { title: "Community Updates", description: "Get announcements from management." },
  ],
  access: "Portal credentials are provided at move-in.",
};
