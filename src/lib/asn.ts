interface AsnInfo {
  asn: string
  isp: string
}

const cache = new Map<string, AsnInfo | null>()

export async function lookupAsn(ip: string): Promise<AsnInfo | null> {
  if (ip === '???' || ip === '*') return null
  if (cache.has(ip)) return cache.get(ip)!

  try {
    const res = await fetch(`https://ipapi.co/${ip}/json/`, { signal: AbortSignal.timeout(3000) })
    if (!res.ok) { cache.set(ip, null); return null }
    const data = await res.json()
    const info: AsnInfo = {
      asn: data.asn ?? '',
      isp: data.org ?? '',
    }
    cache.set(ip, info)
    return info
  } catch {
    cache.set(ip, null)
    return null
  }
}
