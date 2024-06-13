import { it, expect } from "vitest"
import { analyse } from "./analyser"

it("should analyse HTML", () => {
  expect(analyse("")).toEqual([])
})

it("should identify malformed l-map", () => {
  const range = {
    start: { line: 0, character: 1 },
    end: { line: 0, character: 6}
  }
  const expected = [
    {
      range,
      message: "Missing 'center' HTML attribute."
    },
    {
      range,
      message: "Missing 'zoom' HTML attribute."
    }
  ]
  expect(analyse("<l-map></l-map>")).toEqual(expected)
})
