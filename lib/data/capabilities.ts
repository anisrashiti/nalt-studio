export type Capability = {
  id: string;
  title: string;
  description: string;
  tags: readonly string[];
  visualType: "interface" | "commerce" | "states" | "platform";
};

export const capabilities: readonly Capability[] = [
  {
    id: "websites",
    title: "Websites",
    description: "High-performance digital experiences where brand, content and engineering work as one system.",
    tags: ["BRAND", "UX", "PERFORMANCE"],
    visualType: "interface",
  },
  {
    id: "e-commerce",
    title: "E-commerce",
    description: "Commerce experiences connecting product, content, checkout and operations without feeling templated.",
    tags: ["STOREFRONT", "CHECKOUT", "INTEGRATIONS"],
    visualType: "commerce",
  },
  {
    id: "digital-products",
    title: "Digital Products",
    description: "Interfaces and product systems designed around real workflows, not just polished screens.",
    tags: ["UX", "SYSTEM", "INTERACTION"],
    visualType: "states",
  },
  {
    id: "custom-platforms",
    title: "Custom Platforms",
    description: "Purpose-built systems for complex business processes, integrations, automation and scale.",
    tags: ["INTEGRATIONS", "AUTOMATION", "SCALE"],
    visualType: "platform",
  },
];

// Both the static SVGs and the continuing desktop SVG use these same primitives.
// The units retain their identity: planes become slots, then states, then layers.
export const capabilityVisualStates = [
  {
    units: [
      { x: 234, y: 174, scaleX: 1.54, scaleY: 1.42, radius: 0, opacity: 0.42 },
      { x: 285, y: 219, scaleX: 1.54, scaleY: 1.42, radius: 0, opacity: 0.72 },
      { x: 336, y: 264, scaleX: 1.54, scaleY: 1.42, radius: 0, opacity: 1 },
    ],
    links: ["M234 174L285 219", "M285 219L336 264"],
    linkOpacity: 0,
    marker: { x: 412, y: 264 },
  },
  {
    units: [
      { x: 104, y: 220, scaleX: 0.79, scaleY: 1.1, radius: 0, opacity: 0.85 },
      { x: 300, y: 220, scaleX: 0.79, scaleY: 1.1, radius: 0, opacity: 1 },
      { x: 496, y: 220, scaleX: 0.79, scaleY: 1.1, radius: 0, opacity: 0.85 },
    ],
    links: ["M167 220L237 220", "M363 220L433 220"],
    linkOpacity: 0.7,
    marker: { x: 397, y: 220 },
  },
  {
    units: [
      { x: 202, y: 190, scaleX: 0.7, scaleY: 1, radius: 80, opacity: 0.65 },
      { x: 300, y: 260, scaleX: 0.7, scaleY: 1, radius: 80, opacity: 1 },
      { x: 398, y: 190, scaleX: 0.7, scaleY: 1, radius: 80, opacity: 0.65 },
    ],
    links: ["M247 222L255 228", "M345 228L353 222"],
    linkOpacity: 0.7,
    marker: { x: 300, y: 260 },
  },
  {
    units: [
      { x: 264, y: 112, scaleX: 1.7, scaleY: 0.62, radius: 0, opacity: 0.7 },
      { x: 264, y: 220, scaleX: 1.7, scaleY: 0.62, radius: 0, opacity: 1 },
      { x: 264, y: 328, scaleX: 1.7, scaleY: 0.62, radius: 0, opacity: 0.7 },
    ],
    links: ["M426 112L426 220", "M426 220L426 328"],
    linkOpacity: 0.7,
    marker: { x: 426, y: 220 },
  },
] as const;
