import { parse } from "node-html-parser";
import { Diagnostic, DiagnosticSeverity } from "./diagnostic";

interface TypedAttribute {
  name: string;
  format: "json" | "number" | "string";
}

type Definition = [string, TypedAttribute[]];

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
    ["l-map", [{name: "center", format: "json"}, {name: "zoom", format: "number"}]],
    ["l-tile-layer", [{name: "url-template", format: "string"}]],
    ["l-circle", [{name: "lat-lng", format: "json"}]],
  ];

  // HTML parser
  const document = parse(text);
  definitions.forEach(([tagName, attNames]) => {
    const els = document.querySelectorAll(tagName);
    els.forEach((el) => {
      attNames.forEach((att) => {
        let iStart = el.range[0];
        let iEnd = el.range[1];
        if (el.hasAttribute(att.name)) {
          // Try to parse it
          const value = el.getAttribute(att.name);
          if (value !== undefined) {
            switch(att.format) {
              case("json"):
                try {
                  JSON.parse(value)
                } catch(e) {
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
                    message: `Could not parse: '${att.name}' into ${att.format}.`,
                  });
                }
                break;
              case("number"):
                if (isNaN(parseInt(value))) {
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
                    message: `Could not parse: '${att.name}' into ${att.format}.`,
                  });
                }
                break;
              case("string"):
                break;
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
            message: `Missing '${att.name}' HTML attribute.`,
          });
        }
      });
    });
  });
  return diagnostics;
};
