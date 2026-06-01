const BASE = "https://serpapi.com/search.json";

export async function serpFetch(
  params: Record<string, string>
): Promise<unknown> {
  const { engine, api_key: _key, ...logParams } = { ...params, api_key: '' } as Record<string, string>
  console.log(`  [serp] ${engine} →`, JSON.stringify(logParams))

  const url = new URL(BASE);
  url.searchParams.set("api_key", process.env.SERP_API_KEY!);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  const res = await fetch(url.toString());
  if (!res.ok) {
    const text = await res.text();
    console.error(`  [serp] ${engine} failed ${res.status}:`, text.slice(0, 200))
    throw new Error(`SerpAPI error ${res.status}: ${text}`);
  }
  console.log(`  [serp] ${engine} ok`)
  return res.json();
}
