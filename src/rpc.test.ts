import { decode } from "./rpc"
import { it, expect } from "vitest"


it.each([
  ["", []],
  ["Content-Length: 2\r\n\r\n{}", [{}]],
  ["Content-Length: 2\r\n\r\n{}Content-Length: 2\r\n\r\n{}", [{}, {}]],
  ["Content-Length: 14\r\n\r\n{\"foo\": \"bar\"}Content-Length: 2\r\n\r\n{}", [{foo: "bar"}, {}]]
])("should decode %s message into %s", (buffer, expected) => {
  expect(decode(buffer)).toEqual(expected)
})
