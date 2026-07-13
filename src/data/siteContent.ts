export type GalleryItem = {
  src: string;
  alt: string;
  label: string;
  category: "Exterior" | "Interiors" | "Amenities" | "Floor Plans";
};

export const galleryItems: GalleryItem[] = [
  {
    src: "/images/exterior.jpg",
    alt: "Exterior view of Baba Flats apartment community",
    label: "Community Exterior",
    category: "Exterior"
  },
  {
    src: "/images/aerial.jpg",
    alt: "Aerial context around Baba Flats",
    label: "Aerial Context",
    category: "Exterior"
  },
  {
    src: "/images/entrance.jpg",
    alt: "Entrance sign at Baba Flats",
    label: "Entry Sign",
    category: "Exterior"
  },
  {
    src: "/images/living-1br.jpg",
    alt: "One bedroom living room at Baba Flats",
    label: "1BR Living",
    category: "Interiors"
  },
  {
    src: "/images/kitchen-1br.jpg",
    alt: "One bedroom kitchen at Baba Flats",
    label: "1BR Kitchen",
    category: "Interiors"
  },
  {
    src: "/images/kitchen-2br.jpg",
    alt: "Two bedroom kitchen at Baba Flats",
    label: "2BR Kitchen",
    category: "Interiors"
  },
  {
    src: "/images/entry-2br.jpg",
    alt: "Two bedroom entry area at Baba Flats",
    label: "2BR Entry",
    category: "Interiors"
  },
  {
    src: "/images/home-3br.jpg",
    alt: "Three bedroom interior at Baba Flats",
    label: "3BR Interior",
    category: "Interiors"
  },
  {
    src: "/images/dog-park.jpg",
    alt: "Dog park amenity at Baba Flats",
    label: "Dog Park",
    category: "Amenities"
  },
  {
    src: "/images/laundry.jpg",
    alt: "Laundry amenity at Baba Flats",
    label: "Laundry",
    category: "Amenities"
  },
  {
    src: "/images/layout-1br.png",
    alt: "One bedroom floor plan at Baba Flats",
    label: "1BR Plan",
    category: "Floor Plans"
  },
  {
    src: "/images/layout-2br.png",
    alt: "Two bedroom floor plan at Baba Flats",
    label: "2BR Plan",
    category: "Floor Plans"
  }
];
