// Leaflet-HTML definitions
interface TypedAttribute {
  name: string;
  format: "json" | "number" | "string";
  default: string;
}

type Definition = { tagName: string; attributes: TypedAttribute[], documentation: string };

export const ELEMENT_DEFINITIONS: Definition[] = [
  {
    tagName: "l-map",
    documentation: "L.map() custom HTML element.",
    attributes: [
      { name: "center", format: "json", default: "[0, 0]" },
      { name: "zoom", format: "number", default: "0" },
    ],
  },
  {
    tagName: "l-tile-layer",
    documentation: "L.tileLayer() custom HTML element.",
    attributes: [{ name: "url-template", format: "string", default: "" }],
  },
  {
    tagName: "l-circle",
    documentation: "L.circle() custom HTML element.",
    attributes: [{ name: "lat-lng", format: "json", default: "[0, 0]" }],
  },
];
