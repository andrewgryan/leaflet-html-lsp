const fs = require("fs")


const log = (msg: string) => {
  fs.appendFile("./logs.txt", msg, (err: Error) => {
    if (err) {
      console.error(err)
    }
  })
}

// Listen on stdin/stdout
process.stdin.on("data", (buf) => {
  const message = buf.toString()
  log(message)
  process.stdout.write(message)
})
