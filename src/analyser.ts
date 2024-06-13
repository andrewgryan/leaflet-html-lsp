import { parse } from "node-html-parser"
import { Diagnostic } from "./diagnostic"

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
    console.log(lineNumber)
    if (!el.hasAttribute("center")) {
      let i = el.range[0]
      let j = el.range[0] + el.tagName.length + 1
      diagnostics.push({
          range: {
            start: {line: lineNumber[i], character: characterNumber[i]},
            end: {line: lineNumber[j], character: characterNumber[j]},
          },
          message: "Missing 'center' HTML attribute."
      })
    }
    if (!el.hasAttribute("zoom")) {
      diagnostics.push({
          range: {
            start: {line: lineNumber[el.range[0]], character: characterNumber[el.range[0]]},
            end: {line: lineNumber[el.range[1] - 1], character: characterNumber[el.range[1] - 1]},
          },
          message: "Missing 'zoom' HTML attribute."
      })
    }
  })
  
  
  // // Low-level search
  // const lines = text.split("\n")
  // for (let i=0; i<lines.length; i++) {
  //   const j = lines[i].indexOf("l-map")
  //   if (j !== -1) {
  //     if (lines[i].indexOf("center") === -1) {
  //       diagnostics.push({
  //           range: {
  //             start: {line: i, character: j},
  //             end: {line: i, character: j + 5}
  //           },
  //           message: "Missing 'center' HTML attribute."
  //       })
  //     }
  //     if (lines[i].indexOf("zoom") === -1) {
  //       diagnostics.push({
  //           range: {
  //             start: {line: i, character: j},
  //             end: {line: i, character: j + 5}
  //           },
  //           message: "Missing 'zoom' HTML attribute."
  //       })
  //     }
  //   }
  // }
  return diagnostics
}
