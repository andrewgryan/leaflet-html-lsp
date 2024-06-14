import { parse } from "node-html-parser";
import { Diagnostic, DiagnosticSeverity } from "./diagnostic";
import { ELEMENT_DEFINITIONS } from "./schema";

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

  // HTML parser
  const document = parse(text);
  ELEMENT_DEFINITIONS.forEach(({tagName, attributes}) => {
    const els = document.querySelectorAll(tagName);
    els.forEach((el) => {
      attributes.forEach((attribute) => {
        let iStart = el.range[0];
        let iEnd = el.range[1];
        if (el.hasAttribute(attribute.name)) {
          // Try to parse it
          const value = el.getAttribute(attribute.name);
          if (value !== undefined) {
            switch(attribute.format) {
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
                    message: `Could not parse: '${attribute.name}' into ${attribute.format}.`,
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
                    message: `Could not parse: '${attribute.name}' into ${attribute.format}.`,
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
            message: `Missing '${attribute.name}' HTML attribute.`,
          });
        }
      });
    });
  });
  return diagnostics;
};
