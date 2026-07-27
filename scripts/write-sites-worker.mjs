import { mkdir, writeFile } from 'node:fs/promises'

const worker = `export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    let response = await env.ASSETS.fetch(new Request(url, request))

    if (response.status === 404) {
      const fallback = new URL('/index.html', request.url)
      response = await env.ASSETS.fetch(new Request(fallback, request))
    }

    return response
  },
}
`

await mkdir('dist/server', { recursive: true })
await writeFile('dist/server/index.js', worker)
