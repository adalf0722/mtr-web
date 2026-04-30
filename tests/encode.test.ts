import { describe, it, expect } from 'vitest'
import { encodeData, decodeData } from '../src/lib/encode'

describe('encode', () => {
  it('roundtrip: encode then decode returns original string', async () => {
    const original = JSON.stringify({ hello: 'world', num: 42 })
    const encoded = await encodeData(original)
    const decoded = await decodeData(encoded)
    expect(decoded).toBe(original)
  })

  it('encoded string is shorter than original for large input', async () => {
    const large = JSON.stringify({ data: 'x'.repeat(1000) })
    const encoded = await encodeData(large)
    expect(encoded.length).toBeLessThan(large.length)
  })

  it('throws on invalid base64 input', async () => {
    await expect(decodeData('!!!invalid!!!')).rejects.toThrow()
  })
})
