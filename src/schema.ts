// Leaflet-HTML definitions
interface TypedAttribute {
  name: string;
  format: "json" | "number" | "string";
  default: string;
}

type Definition = [string, TypedAttribute[]];

export const ELEMENT_DEFINITIONS: Definition[] = [
  [
    "l-map",
    [
      { name: "center", format: "json", default: "[0, 0]" },
      { name: "zoom", format: "number", default: "0" },
    ],
  ],
  ["l-tile-layer", [{ name: "url-template", format: "string", default: "" }]],
  ["l-circle", [{ name: "lat-lng", format: "json", default: "[0, 0]" }]],
];
