/**
 * Structured-data (schema.org) for the property, emitted site-wide so search
 * engines and rich results surface the business name, location, contact, and
 * hours. Rendered as a JSON-LD <script> in the public layout.
 */
const LOCAL_BUSINESS = {
  "@context": "https://schema.org",
  "@type": "ApartmentComplex",
  name: "Baba Flats",
  url: "https://babaflats.com",
  telephone: "+17707268907",
  email: "Contact@babaflats.com",
  image: "https://babaflats.com/images/banner.png",
  address: {
    "@type": "PostalAddress",
    streetAddress: "1204 Veterans Memorial Hwy SW",
    addressLocality: "Mableton",
    addressRegion: "GA",
    postalCode: "30126",
    addressCountry: "US",
  },
  openingHours: ["Mo-Fr 09:00-18:00", "Sa 10:00-16:00"],
};

export function LocalBusinessJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(LOCAL_BUSINESS) }}
    />
  );
}
