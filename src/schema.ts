// Leaflet-HTML definitions
interface TypedAttribute {
  name: string;
  format: "json" | "number" | "string";
  default: string;
}

type Definition = { tagName: string; attributes: TypedAttribute[] };

export const ELEMENT_DEFINITIONS: Definition[] = [
  {
    tagName: "l-map",
    attributes: [
      { name: "center", format: "json", default: "[0, 0]" },
      { name: "zoom", format: "number", default: "0" },
    ],
  },
  {
    tagName: "l-tile-layer",
    attributes: [{ name: "url-template", format: "string", default: "" }],
  },
  {
    tagName: "l-circle",
    attributes: [{ name: "lat-lng", format: "json", default: "[0, 0]" }],
  },
];
