import { parse } from "node-html-parser"
import { Diagnostic, DiagnosticSeverity } from "./diagnostic"

// Analyse Leaflet-HTML syntax
export const analyse = (text: string): Diagnostic[] => {
  const diagnostics: Diagnostic[] = []

  // Translate from string index to line/character numbers
  const lineNumber = new Array(text.length)
  let j = 0
  for (let i=0; i<text.length; i++) {
    lineNumber[i] = j
    if (text[i] === "\n") {
      j += 1
    }
  }
  
  const characterNumber = new Array(text.length)
  let k = 0
  for (let i=0; i<text.length; i++) {
    characterNumber[i] = k
    if (text[i] === "\n") {
      k = 0
    } else {
      k += 1
    }
  }

  // HTML parser
  const document = parse(text)
  const els = document.querySelectorAll("l-map")
  els.forEach(el => {
    console.log(lineNumber);
    ["center", "zoom"].forEach(attName => {
      if (!el.hasAttribute(attName)) {
        let iStart = el.range[0]
        let iEnd = el.range[1]
        diagnostics.push({
            severity: DiagnosticSeverity.Error,
            range: {
              start: {line: lineNumber[iStart], character: characterNumber[iStart]},
              end: {line: lineNumber[iEnd], character: characterNumber[iEnd]},
            },
            message: `Missing '${attName}' HTML attribute.`
        })
      }
    })
  })
  return diagnostics
}
