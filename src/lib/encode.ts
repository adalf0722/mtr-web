export async function encodeData(json: string): Promise<string> {
  const bytes = new TextEncoder().encode(json)
  const stream = new CompressionStream('gzip')
  const writer = stream.writable.getWriter()
  writer.write(bytes)
  writer.close()
  const compressed = await new Response(stream.readable).arrayBuffer()
  return btoa(String.fromCharCode(...new Uint8Array(compressed)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

export async function decodeData(encoded: string): Promise<string> {
  const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(base64)
  const bytes = Uint8Array.from(binary, c => c.charCodeAt(0))
  const stream = new DecompressionStream('gzip')
  const writer = stream.writable.getWriter()
  writer.write(bytes)
  writer.close()
  const decompressed = await new Response(stream.readable).arrayBuffer()
  return new TextDecoder().decode(decompressed)
}
