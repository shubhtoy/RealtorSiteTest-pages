export type EditableLink = {
  text: string;
  link: string;
};

export type EditableStat = {
  value: number;
  suffix: string;
  label: string;
};

export type EditableFloorPlan = {
  title: string;
  bedrooms: number;
  bathrooms: number;
  sqft: string;
  description: string;
  image: string;
  features: string[];
  priceRange: string;
};

export type EditableAmenityPanel = {
  title: string;
  description: string;
  image: string;
};

export type EditableWhyCard = {
  title: string;
  description: string;
  tag: string;
  icon: "building" | "paw" | "car" | "map" | "shield" | "sparkles";
};

export type EditableTestimonial = {
  quote: string;
  name: string;
  designation: string;
};

export type EditableFaq = {
  question: string;
  answer: string;
  category: string;
};

export type EditableNeighborhoodHighlight = {
  title: string;
  description: string;
  distance: string;
};

export type EditableGalleryItem = {
  src: string;
  alt: string;
  label: string;
  category: "Exterior" | "Interiors" | "Amenities" | "Floor Plans";
  type?: "image" | "video";
};

export type GlobalLayer = {
  siteName: string;
  cityLabel: string;
  tagline: string;
  description: string;
  phone: string;
  email: string;
  addressLine: string;
  hoursLine: string;
  navCtaText: string;
  navCtaLink: string;
  navLinks: Array<{ to: string; label: string }>;
  footerBadges: string[];
  seoTitleSuffix: string;
};

export type HomeLayer = {
  sectionVisibility: {
    stats: boolean;
    residences: boolean;
    unitExplorer: boolean;
    amenities: boolean;
    why: boolean;
    neighborhood: boolean;
    testimonials: boolean;
    faq: boolean;
    map: boolean;
    finalCta: boolean;
    mobileBar: boolean;
  };
  hero: {
    tagline: string;
    title: string;
    highlightText: string;
    description: string;
    primaryCta: EditableLink;
    secondaryCta: EditableLink;
    heroRailMedia: string[];
  };
  stats: EditableStat[];
  focusCards: Array<{ title: string; src: string }>;
  floorPlans: EditableFloorPlan[];
  amenityPanels: EditableAmenityPanel[];
  whyCards: EditableWhyCard[];
  neighborhood: {
    eyebrow: string;
    title: string;
    description: string;
    highlights: EditableNeighborhoodHighlight[];
  };
  testimonials: EditableTestimonial[];
  faq: EditableFaq[];
  finalCta: {
    tagline: string;
    title: string;
    description: string;
    primary: EditableLink;
    secondary: EditableLink;
  };
  ui: {
    residencesEyebrow: string;
    residencesTitle: string;
    residencesDescription: string;
    unitExplorerEyebrow: string;
    unitExplorerTitle: string;
    unitExplorerDescription: string;
    amenitiesEyebrow: string;
    amenitiesTitle: string;
    amenitiesDescription: string;
    whyEyebrow: string;
    whyTitle: string;
    whyDescription: string;
    whyStickyEyebrow: string;
    whyStickyTitle: string;
    whyStickyDescription: string;
    neighborhoodStickyEyebrow: string;
    neighborhoodStickyTitle: string;
    neighborhoodStickyDescription: string;
    testimonialsEyebrow: string;
    testimonialsTitle: string;
    testimonialsDescription: string;
    faqEyebrow: string;
    faqTitle: string;
    faqDescription: string;
    faqHelpEyebrow: string;
    faqHelpTitle: string;
    faqHelpDescription: string;
    faqHelpPrimaryLabel: string;
    faqHelpSecondaryLabel: string;
    mapEyebrow: string;
    mapTitle: string;
    mapDescription: string;
    mapCardOfficeLabel: string;
    mapCardCallLabel: string;
    mapCardHoursLabel: string;
    mobilePrimaryLabel: string;
    mobileSecondaryLabel: string;
  };
};

export type GalleryLayer = {
  sectionVisibility: {
    hero: boolean;
    media: boolean;
    cta: boolean;
  };
  heroEyebrow: string;
  heroTitle: string;
  heroDescription: string;
  heroImage: string;
  items: EditableGalleryItem[];
  cta: {
    eyebrow: string;
    title: string;
    description: string;
    primary: EditableLink;
    secondary: EditableLink;
  };
};

export type ContactLayer = {
  sectionVisibility: {
    hero: boolean;
    form: boolean;
    map: boolean;
  };
  heroEyebrow: string;
  heroTitle: string;
  heroDescription: string;
  heroImage: string;
  mapEmbedUrl: string;
  officeHoursTitle: string;
  officeHours: string[];
  tourFormTitle: string;
  tourFormDescription: string;
  formOptions: {
    bedroom: string[];
    moveIn: string[];
    tourType: string[];
  };
  submitText: string;
  integrations: {
    smtp: {
      enabled: boolean;
      endpoint: string;
      method: string;
      authHeader: string;
      fromEmail: string;
      toEmail: string;
      subjectTemplate: string;
    };
    submitHooks: Array<{
      name: string;
      url: string;
      method: string;
      enabled: boolean;
      sendFormData: boolean;
      headersJson: string;
    }>;
  };
  ui: {
    callButtonPrefix: string;
    browseButtonText: string;
    formEyebrow: string;
    infoBullets: string[];
    featureBadges: string[];
    labels: {
      fullName: string;
      email: string;
      phone: string;
      bedroomType: string;
      moveIn: string;
      tourPreference: string;
      message: string;
    };
    placeholders: {
      fullName: string;
      email: string;
      phone: string;
      message: string;
    };
  };
};

export type EditableSiteDocument = {
  version: number;
  updatedAt: string;
  global: GlobalLayer;
  home: HomeLayer;
  gallery: GalleryLayer;
  contact: ContactLayer;
};
