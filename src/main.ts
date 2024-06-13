import fs from "fs"
import { encode, decode } from "./rpc"
import { analyse } from "./analyser"
import { Diagnostic, Range } from "./diagnostic"


const log = (msg: string) => {
  fs.appendFile("./logs.txt", msg, (err: NodeJS.ErrnoException | null) => {
    if (err) {
      console.error(err)
    }
  })
}

interface Message {
  jsonrpc: string;
}

interface RequestMessage extends Message {
  id: number;
  method: string;
  params?: Object;
}

interface ResponseMessage extends Message {
  id: number;
  result?: Object | null;
}

interface NotificationMessage extends Message {
  method: string;
  params?: Object;
}

interface CompletionRequest extends RequestMessage {
  method: "textDocument/completion";
  params: CompletionParams;
}

interface TextDocumentCompletionResponse extends ResponseMessage {
  result: CompletionItem[]
}

interface CompletionParams {}

interface InitializeRequest extends RequestMessage {
  method: "initialize";
}

interface InitializeResponse extends ResponseMessage {
  result: InitializeResult
}

interface InitializeResult {
  capabilities: ServerCapabilities;
  serverInfo: {
    name: string;
    version: string;
  }
}

interface ServerCapabilities {
  textDocumentSync: number;
  codeActionProvider: boolean;
  completionProvider: Object;
}

interface ShutdownResponse extends ResponseMessage {
  result: null
}


interface ShutdownRequest extends RequestMessage {
  method: "shutdown";
}

interface ExitRequest extends RequestMessage {
  method: "exit";
}

interface CodeActionRequest extends RequestMessage {
  method: "textDocument/codeAction";
  params: CodeActionParams
}

interface CodeActionResponse extends ResponseMessage {
  result: CodeActionResult;
}

interface ExitRequest extends RequestMessage {
  method: "exit";
}

interface CodeActionParams {
  textDocument: TextDocumentIdentifier;
  range: Range;
  context: CodeActionContext;
}

interface CodeActionContext {
  diagnostics: Diagnostic[];
}

type Request =
  | InitializeRequest
  | ShutdownRequest
  | ExitRequest
  | CompletionRequest
  | CodeActionRequest

type Notification =
  | {method: "textDocument/didOpen", params: DidOpenTextDocumentParams}
  | {method: "textDocument/didChange", params: DidChangeTextDocumentParams}
  | PublishDiagnosticsNotification

interface PublishDiagnosticsNotification extends NotificationMessage {
  method: "textDocument/publishDiagnostics",
  params: PublishDiagnosticsParams
}

type DocumentUri = string

interface PublishDiagnosticsParams {
  uri: DocumentUri;
  diagnostics: Diagnostic[];
}

const respond = (message: NotificationMessage | ResponseMessage) => {
  const response = encode(message)
  process.stdout.write(response)
}

const initializeResponse = (id: number): InitializeResponse => {
  return {
    jsonrpc: "2.0",
    id,
    result: initializeResult()
  }
}

const initializeResult = (): InitializeResult => {
  return {
    capabilities: {
      textDocumentSync: 1,
      codeActionProvider: true,
      completionProvider: {}
    },
    serverInfo: {
      name: "leaflet-html",
      version: "0.0.0"
    }
  }
}

const shutdownResponse = (id: number): ShutdownResponse => {
  return {
    jsonrpc: "2.0",
    id,
    result: null
  }
}

const textDocumentCompletionResponse = (id: number): TextDocumentCompletionResponse => {
  return {
    jsonrpc: "2.0",
    id,
    result: textDocumentCompletionResult()
  }
}

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

// Diagnostics
const publishDiagnostics = (uri: DocumentUri): PublishDiagnosticsNotification => {
  const text = DOCUMENTS[uri]
  return {
    jsonrpc: "2.0",
    method: "textDocument/publishDiagnostics",
    params: {
      uri,
      diagnostics: analyse(text)
    }
  }
}

// Code actions
type CodeActionResult = (Command | CodeAction)[] | null

interface CodeAction {
  title: string;
  edit?: WorkspaceEdit;
  command?: Command;
}

interface WorkspaceEdit {
  changes: {[uri: DocumentUri]: TextEdit[]; };
}

interface Command {
  title: string;
  command: string;
}

interface TextEdit {
  range: Range;
  newText: string;
}

const codeActionResponse = (id: number, result: CodeActionResult): CodeActionResponse => {
  return {
    jsonrpc: "2.0",
    id,
    result
  }
}

const codeActions = (params: CodeActionParams): CodeActionResult => {
  const changes = {
    [params.textDocument.uri]: [
      {
        range: params.range,
        newText: "Hello, World!"
      }
    ]
  }
  return [{ title: "Insert/replace with Hello, World!", edit: { changes }}]
}

// Listen on stdin/stdout
process.stdin.on("data", (buf) => {
  const message = buf.toString()
  log(`${message}\n`)
  const payloads = decode(message) as (Request | Notification)[]
  payloads.forEach(payload => {
    switch (payload.method) {
      case("initialize"):
        respond(initializeResponse(payload.id));
        break;
      case("textDocument/didOpen"):
        textDocumentDidOpen(payload.params)
        respond(publishDiagnostics(payload.params.textDocument.uri))
        break;
      case("textDocument/didChange"):
        textDocumentDidChange(payload.params)
        respond(publishDiagnostics(payload.params.textDocument.uri))
        break;
      case("textDocument/completion"):
        respond(textDocumentCompletionResponse(payload.id))
        break;
      case("textDocument/codeAction"):
        respond(codeActionResponse(payload.id, codeActions(payload.params)))
        break;
      case("shutdown"):
        respond(shutdownResponse(payload.id));
        break;
      case("exit"):
        process.exit(0)
    }
  })
})
