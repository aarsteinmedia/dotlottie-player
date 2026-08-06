import { readdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// List assets and write file
const { url } = import.meta,
  __dirname = dirname(fileURLToPath(url)),
  assets = readdirSync(resolve(
    __dirname, '..', 'assets'
  )).filter(file => /\.(?:json|lottie)$/i.test(file))

try {
  writeFileSync(resolve(__dirname, 'files.js'),
    `const files = ${JSON.stringify(assets)}

export default files`)
} catch (error) {
  console.error(error)
}
