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
}

// Decode message
export const decode = (content: string): RequestMessage | null => {
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
      textDocumentSync: 1
    },
    serverInfo: {
      name: "leaflet-html",
      version: "0.0.0"
    }
  }
}

const shutdownResult = () => null

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
      case("shutdown"):
        respond(payload.id, shutdownResult());
        break;
      case("exit"):
        process.exit(0)
    }
  }
})
