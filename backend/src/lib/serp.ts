const BASE = 'https://serpapi.com/search.json'

export async function serpFetch(params: Record<string, string>): Promise<unknown> {
  const url = new URL(BASE)
  url.searchParams.set('api_key', process.env.SERP_API_KEY!)
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v)
  }
  const res = await fetch(url.toString())
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`SerpAPI error ${res.status}: ${text}`)
  }
  return res.json()
}
