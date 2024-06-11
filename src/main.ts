const fs = require("fs")


const log = (msg: string) => {
  fs.appendFile("./logs.txt", msg, (err: Error) => {
    if (err) {
      console.error(err)
    }
  })
}

// Encode message
export const encode = (payload: Object) => {
  const content = JSON.stringify(payload)
  return `Content-Length: ${content.length}\r\n\r\n${content}`
}

interface Message {
  jsonrpc: string;
}

interface RequestMessage extends Message {
  id: number;
  method: string;
  params?: Object;
}

interface CompletionRequest extends RequestMessage {
  method: "textDocument/completion";
  params: CompletionParams;
}

interface CompletionParams {}

interface InitializeRequest extends RequestMessage {
  method: "initialize";
}

interface ShutdownRequest extends RequestMessage {
  method: "shutdown";
}

interface ExitRequest extends RequestMessage {
  method: "exit";
}

type Request =
  | InitializeRequest
  | ShutdownRequest
  | ExitRequest
  | CompletionRequest

type Notification =
  | {method: "textDocument/didOpen", params: DidOpenTextDocumentParams}
  | {method: "textDocument/didChange", params: DidChangeTextDocumentParams}

// Decode message
export const decode = (content: string): Notification | Request | null => {
  const [header, body] = content.split("\r\n\r\n")
  if (header.startsWith("Content-Length")) {
    const length = parseInt(header.split(": ")[1])
    return JSON.parse(body.substring(0, length))
  } else {
    log(`Could not parse: ${content}\n`)
    return null
  }
}

const respond = (id: number, result: Object | null) => {
  const response = encode({ jsonrpc: "2.0", id, result })
  process.stdout.write(response)
  log(response + "\n")
}

const initializeResult = () => {
  return {
    capabilities: {
      textDocumentSync: 1,
      completionProvider: {}
    },
    serverInfo: {
      name: "leaflet-html",
      version: "0.0.0"
    }
  }
}

const shutdownResult = () => null

type DocumentStore = {
  [key: string]: string;
}

const DOCUMENTS: DocumentStore = {}

interface TextDocumentItem {
  uri: string;
  languageId: string;
  version: number;
  text: string;
}

interface DidOpenTextDocumentParams {
  textDocument: TextDocumentItem;
}

interface DidChangeTextDocumentParams {
  textDocument: VersionedTextDocumentIdentifier;
  contentChanges: TextDocumentContentChangeEvent[];
}

interface VersionedTextDocumentIdentifier extends TextDocumentIdentifier {
  version: number;
}

interface TextDocumentIdentifier {
  uri: string;
}

type TextDocumentContentChangeEvent = {
  // TODO: implement other properties
  text: string;
}

const textDocumentDidOpen = (params: DidOpenTextDocumentParams) => {
  DOCUMENTS[params.textDocument.uri] = params.textDocument.text
}

const textDocumentDidChange = (params: DidChangeTextDocumentParams) => {
  if (params.contentChanges.length > 0) {
    DOCUMENTS[params.textDocument.uri] = params.contentChanges[0].text
  }
}

// Completion
interface CompletionItem {
  label: string;
  detail: string;
  documentation: string;
}

const textDocumentCompletionResult = (): CompletionItem[] => {
  return [
    { label: "l-map", detail: "l-map", documentation: "Leaflet L.map component" },
    { label: "l-tile-layer", detail: "l-tile-layer", documentation: "Leaflet L.tileLayer component" },
    { label: "l-marker", detail: "l-marker", documentation: "Leaflet L.marker component" },
    { label: "l-icon", detail: "l-icon", documentation: "Leaflet L.icon component" },
  ]
}

// Listen on stdin/stdout
process.stdin.on("data", (buf) => {
  const message = buf.toString()
  log(message + "\n")
  const payload = decode(message)
  if (payload !== null) {
    switch (payload.method) {
      case("initialize"):
        respond(payload.id, initializeResult());
        break;
      case("textDocument/didOpen"):
        textDocumentDidOpen(payload.params)
        break;
      case("textDocument/didChange"):
        textDocumentDidChange(payload.params)
        break;
      case("textDocument/completion"):
        respond(payload.id, textDocumentCompletionResult())
        break;
      case("shutdown"):
        respond(payload.id, shutdownResult());
        break;
      case("exit"):
        process.exit(0)
    }
  }
})
