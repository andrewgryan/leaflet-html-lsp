import { parse } from "node-html-parser";
import { Diagnostic, DiagnosticSeverity } from "./diagnostic";

type Definition = [string, string[]];

// Analyse Leaflet-HTML syntax
export const analyse = (text: string): Diagnostic[] => {
  const diagnostics: Diagnostic[] = [];

  // Translate from string index to line/character numbers
  const lineNumber = new Array(text.length);
  let j = 0;
  for (let i = 0; i < text.length; i++) {
    lineNumber[i] = j;
    if (text[i] === "\n") {
      j += 1;
    }
  }

  const characterNumber = new Array(text.length);
  let k = 0;
  for (let i = 0; i < text.length; i++) {
    characterNumber[i] = k;
    if (text[i] === "\n") {
      k = 0;
    } else {
      k += 1;
    }
  }

  // Definition
  const definitions: Definition[] = [
    ["l-map", ["center", "zoom"]],
    ["l-tile-layer", ["url-template"]],
    ["l-circle", ["lat-lng"]],
  ];

  // HTML parser
  const document = parse(text);
  definitions.forEach(([tagName, attNames]) => {
    const els = document.querySelectorAll(tagName);
    els.forEach((el) => {
      attNames.forEach((attName) => {
        let iStart = el.range[0];
        let iEnd = el.range[1];
        if (el.hasAttribute(attName)) {
          // Try to parse it
          if (attName === "zoom") {
            const value = el.getAttribute(attName);
            if (value !== undefined && isNaN(parseInt(value))) {
              diagnostics.push({
                severity: DiagnosticSeverity.Error,
                range: {
                  start: {
                    line: lineNumber[iStart],
                    character: characterNumber[iStart],
                  },
                  end: {
                    line: lineNumber[iEnd],
                    character: characterNumber[iEnd],
                  },
                },
                message: `Could not parse: '${attName}' into integer.`,
              });
            }
          }
        } else {
          // Complain that it is missing
          diagnostics.push({
            severity: DiagnosticSeverity.Error,
            range: {
              start: {
                line: lineNumber[iStart],
                character: characterNumber[iStart],
              },
              end: { line: lineNumber[iEnd], character: characterNumber[iEnd] },
            },
            message: `Missing '${attName}' HTML attribute.`,
          });
        }
      });
    });
  });
  return diagnostics;
};
