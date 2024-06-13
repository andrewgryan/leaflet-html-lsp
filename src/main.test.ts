import { expect, test } from 'vitest'
import { encode } from "./main" 
import { decode } from "./rpc"

test('encode', () => {
  const expected = "Content-Length: 2\r\n\r\n{}"
  expect(encode({})).toEqual(expected)
})

test('decode request', () => {
  const payload = {id: 1, jsonrpc: "2.0", method: "textDocument/completion", params: {}}
  const request = encode(payload)
  const actual = decode(request)
  expect(actual).toEqual([payload])
})
