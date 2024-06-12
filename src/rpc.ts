
interface ParsedMessage {
  length: number;
  payload: Object | null;
}

export const decode = (content: string) => {
  const messages = []
  while (content.length > 0) {
    const { payload, length } = parseMessage(content)
    if (payload !== null) {
      messages.push(payload)
    }
    content = content.substring(length)
  }
  return messages
}

const parseMessage = (content: string): ParsedMessage => {
  const [head, ...rest] = content.split("\r\n\r\n")
  const body = rest.join("\r\n\r\n")
  const prefix = "Content-Length: "
  if (head.startsWith(prefix)) {
    const messageLength = parseInt(head.replace(prefix, ""))
    const payload = JSON.parse(body.substring(0, messageLength))
    const length = head.length + 4 + messageLength
    return { length, payload }
  } else {
    return { length: 0, payload: null }
  }
}
