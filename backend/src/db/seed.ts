import { db } from './client'
import { destinations } from './schema'

const SEED_DESTINATIONS = [
  // UK
  { id: 'london', city: 'London', country: 'UK', code: 'LON', note: 'Capital of culture', type: 'destination' as const, sortOrder: 0 },
  { id: 'manchester', city: 'Manchester', country: 'UK', code: 'MAN', note: 'Music + football', type: 'destination' as const, sortOrder: 1 },
  { id: 'edinburgh', city: 'Edinburgh', country: 'UK', code: 'EDI', note: 'Festival city', type: 'destination' as const, sortOrder: 2 },
  { id: 'glasgow', city: 'Glasgow', country: 'UK', code: 'GLA', note: 'Art + live music', type: 'destination' as const, sortOrder: 3 },
  { id: 'bristol', city: 'Bristol', country: 'UK', code: 'BRS', note: 'Street art + bridges', type: 'destination' as const, sortOrder: 4 },
  { id: 'birmingham', city: 'Birmingham', country: 'UK', code: 'BHX', note: 'Industrial heritage', type: 'destination' as const, sortOrder: 5 },
  { id: 'aberdeen', city: 'Aberdeen', country: 'UK', code: 'ABZ', note: 'Granite city', type: 'destination' as const, sortOrder: 6 },
  { id: 'belfast', city: 'Belfast', country: 'UK', code: 'BFS', note: 'Titanic + murals', type: 'destination' as const, sortOrder: 7 },

  // Ireland
  { id: 'dublin', city: 'Dublin', country: 'Ireland', code: 'DUB', note: 'Pubs + literature', type: 'destination' as const, sortOrder: 8 },
  { id: 'cork', city: 'Cork', country: 'Ireland', code: 'ORK', note: 'Food capital', type: 'destination' as const, sortOrder: 9 },

  // France
  { id: 'paris', city: 'Paris', country: 'France', code: 'CDG', note: 'City of Light', type: 'destination' as const, sortOrder: 10 },
  { id: 'nice', city: 'Nice', country: 'France', code: 'NCE', note: "Cote d'Azur charm", type: 'destination' as const, sortOrder: 11 },
  { id: 'lyon', city: 'Lyon', country: 'France', code: 'LYS', note: 'Gastronomy capital', type: 'destination' as const, sortOrder: 12 },
  { id: 'marseille', city: 'Marseille', country: 'France', code: 'MRS', note: 'Mediterranean port', type: 'destination' as const, sortOrder: 13 },
  { id: 'bordeaux', city: 'Bordeaux', country: 'France', code: 'BOD', note: 'Wine + architecture', type: 'destination' as const, sortOrder: 14 },
  { id: 'toulouse', city: 'Toulouse', country: 'France', code: 'TLS', note: 'Aerospace + pink city', type: 'destination' as const, sortOrder: 15 },
  { id: 'strasbourg', city: 'Strasbourg', country: 'France', code: 'SXB', note: 'Canals + parliament', type: 'destination' as const, sortOrder: 16 },
  { id: 'nantes', city: 'Nantes', country: 'France', code: 'NTE', note: 'Jules Verne + art', type: 'destination' as const, sortOrder: 17 },

  // Netherlands
  { id: 'amsterdam', city: 'Amsterdam', country: 'Netherlands', code: 'AMS', note: 'Canals + culture', type: 'destination' as const, sortOrder: 18 },
  { id: 'rotterdam', city: 'Rotterdam', country: 'Netherlands', code: 'RTM', note: 'Modern architecture', type: 'destination' as const, sortOrder: 19 },

  // Belgium
  { id: 'brussels', city: 'Brussels', country: 'Belgium', code: 'BRU', note: 'Chocolate + beer', type: 'destination' as const, sortOrder: 20 },
  { id: 'antwerp', city: 'Antwerp', country: 'Belgium', code: 'ANR', note: 'Fashion + diamonds', type: 'destination' as const, sortOrder: 21 },

  // Spain
  { id: 'barcelona', city: 'Barcelona', country: 'Spain', code: 'BCN', note: 'Beaches + Gaudi', type: 'destination' as const, sortOrder: 22 },
  { id: 'madrid', city: 'Madrid', country: 'Spain', code: 'MAD', note: 'Art + tapas', type: 'destination' as const, sortOrder: 23 },
  { id: 'malaga', city: 'Malaga', country: 'Spain', code: 'AGP', note: 'Costa del Sol', type: 'destination' as const, sortOrder: 24 },
  { id: 'seville', city: 'Seville', country: 'Spain', code: 'SVQ', note: 'Flamenco + plazas', type: 'destination' as const, sortOrder: 25 },
  { id: 'granada', city: 'Granada', country: 'Spain', code: 'GRX', note: 'Alhambra + tapas', type: 'destination' as const, sortOrder: 26 },
  { id: 'bilbao', city: 'Bilbao', country: 'Spain', code: 'BIO', note: 'Guggenheim + pintxos', type: 'destination' as const, sortOrder: 27 },
  { id: 'ibiza', city: 'Ibiza', country: 'Spain', code: 'IBZ', note: 'Nightlife + coves', type: 'destination' as const, sortOrder: 28 },
  { id: 'tenerife', city: 'Tenerife', country: 'Spain', code: 'TFS', note: 'Volcano + beaches', type: 'destination' as const, sortOrder: 29 },
  { id: 'palma', city: 'Palma de Mallorca', country: 'Spain', code: 'PMI', note: 'Beach + old town', type: 'destination' as const, sortOrder: 30 },
  { id: 'alicante', city: 'Alicante', country: 'Spain', code: 'ALC', note: 'Costa Blanca', type: 'destination' as const, sortOrder: 31 },

  // Portugal
  { id: 'lisbon', city: 'Lisbon', country: 'Portugal', code: 'LIS', note: 'Hills + pasteis', type: 'destination' as const, sortOrder: 32 },
  { id: 'porto', city: 'Porto', country: 'Portugal', code: 'OPO', note: 'Port wine + tiles', type: 'destination' as const, sortOrder: 33 },
  { id: 'faro', city: 'Faro', country: 'Portugal', code: 'FAO', note: 'Algarve gateway', type: 'destination' as const, sortOrder: 34 },

  // Italy
  { id: 'rome', city: 'Rome', country: 'Italy', code: 'FCO', note: 'Ancient history', type: 'destination' as const, sortOrder: 35 },
  { id: 'milan', city: 'Milan', country: 'Italy', code: 'MXP', note: 'Fashion + design', type: 'destination' as const, sortOrder: 36 },
  { id: 'venice', city: 'Venice', country: 'Italy', code: 'VCE', note: 'Canals + carnival', type: 'destination' as const, sortOrder: 37 },
  { id: 'florence', city: 'Florence', country: 'Italy', code: 'FLR', note: 'Renaissance art', type: 'destination' as const, sortOrder: 38 },
  { id: 'naples', city: 'Naples', country: 'Italy', code: 'NAP', note: 'Pizza + Pompeii', type: 'destination' as const, sortOrder: 39 },
  { id: 'verona', city: 'Verona', country: 'Italy', code: 'VRN', note: 'Romeo + Juliet', type: 'destination' as const, sortOrder: 40 },
  { id: 'catania', city: 'Catania', country: 'Italy', code: 'CTA', note: 'Mt Etna + baroque', type: 'destination' as const, sortOrder: 41 },
  { id: 'cagliari', city: 'Cagliari', country: 'Italy', code: 'CAG', note: 'Sardinian charm', type: 'destination' as const, sortOrder: 42 },
  { id: 'palermo', city: 'Palermo', country: 'Italy', code: 'PMO', note: 'Street food + mosaics', type: 'destination' as const, sortOrder: 43 },
  { id: 'olbia', city: 'Olbia', country: 'Italy', code: 'OLB', note: 'Emerald coast', type: 'destination' as const, sortOrder: 44 },
  { id: 'bari', city: 'Bari', country: 'Italy', code: 'BRI', note: 'Puglia coast', type: 'destination' as const, sortOrder: 45 },

  // Greece
  { id: 'athens', city: 'Athens', country: 'Greece', code: 'ATH', note: 'Islands nearby', type: 'destination' as const, sortOrder: 46 },
  { id: 'thessaloniki', city: 'Thessaloniki', country: 'Greece', code: 'SKG', note: 'Byzantine history', type: 'destination' as const, sortOrder: 47 },
  { id: 'santorini', city: 'Santorini', country: 'Greece', code: 'JTR', note: 'Sunsets + caldera', type: 'destination' as const, sortOrder: 48 },
  { id: 'mykonos', city: 'Mykonos', country: 'Greece', code: 'JMK', note: 'Windmills + parties', type: 'destination' as const, sortOrder: 49 },
  { id: 'heraklion', city: 'Heraklion', country: 'Greece', code: 'HER', note: 'Minoan ruins', type: 'destination' as const, sortOrder: 50 },
  { id: 'rhodes', city: 'Rhodes', country: 'Greece', code: 'RHO', note: 'Medieval old town', type: 'destination' as const, sortOrder: 51 },
  { id: 'corfu', city: 'Corfu', country: 'Greece', code: 'CFU', note: 'Ionian greenery', type: 'destination' as const, sortOrder: 52 },
  { id: 'kos', city: 'Kos', country: 'Greece', code: 'KGS', note: "Hippocrates' island", type: 'destination' as const, sortOrder: 53 },

  // Croatia
  { id: 'dubrovnik', city: 'Dubrovnik', country: 'Croatia', code: 'DBV', note: 'Adriatic gem', type: 'destination' as const, sortOrder: 54 },
  { id: 'split', city: 'Split', country: 'Croatia', code: 'SPU', note: "Diocletian's palace", type: 'destination' as const, sortOrder: 55 },
  { id: 'zagreb', city: 'Zagreb', country: 'Croatia', code: 'ZAG', note: 'Cafes + museums', type: 'destination' as const, sortOrder: 56 },
  { id: 'zadar', city: 'Zadar', country: 'Croatia', code: 'ZAD', note: 'Sea organ + sunsets', type: 'destination' as const, sortOrder: 57 },

  // Malta
  { id: 'valletta', city: 'Valletta', country: 'Malta', code: 'MLA', note: 'Knights + harbors', type: 'destination' as const, sortOrder: 58 },

  // Cyprus
  { id: 'larnaca', city: 'Larnaca', country: 'Cyprus', code: 'LCA', note: 'Beaches + history', type: 'destination' as const, sortOrder: 59 },
  { id: 'paphos', city: 'Paphos', country: 'Cyprus', code: 'PFO', note: "Aphrodite's isle", type: 'destination' as const, sortOrder: 60 },

  // Germany
  { id: 'berlin', city: 'Berlin', country: 'Germany', code: 'BER', note: 'Art + nightlife', type: 'destination' as const, sortOrder: 61 },
  { id: 'munich', city: 'Munich', country: 'Germany', code: 'MUC', note: 'Beer + alps', type: 'destination' as const, sortOrder: 62 },
  { id: 'frankfurt', city: 'Frankfurt', country: 'Germany', code: 'FRA', note: 'Skyline + sausages', type: 'destination' as const, sortOrder: 63 },
  { id: 'hamburg', city: 'Hamburg', country: 'Germany', code: 'HAM', note: 'Port + beats', type: 'destination' as const, sortOrder: 64 },
  { id: 'dusseldorf', city: 'Dusseldorf', country: 'Germany', code: 'DUS', note: 'Fashion + Rhine', type: 'destination' as const, sortOrder: 65 },
  { id: 'cologne', city: 'Cologne', country: 'Germany', code: 'CGN', note: 'Cathedral + karneval', type: 'destination' as const, sortOrder: 66 },

  // Austria
  { id: 'vienna', city: 'Vienna', country: 'Austria', code: 'VIE', note: 'Music + cafes', type: 'destination' as const, sortOrder: 67 },
  { id: 'salzburg', city: 'Salzburg', country: 'Austria', code: 'SZG', note: 'Mozart + alps', type: 'destination' as const, sortOrder: 68 },
  { id: 'innsbruck', city: 'Innsbruck', country: 'Austria', code: 'INN', note: 'Alpine capital', type: 'destination' as const, sortOrder: 69 },

  // Switzerland
  { id: 'zurich', city: 'Zurich', country: 'Switzerland', code: 'ZRH', note: 'Lakes + finance', type: 'destination' as const, sortOrder: 70 },
  { id: 'geneva', city: 'Geneva', country: 'Switzerland', code: 'GVA', note: "Jet d'Eau + UN", type: 'destination' as const, sortOrder: 71 },
  { id: 'basel', city: 'Basel', country: 'Switzerland', code: 'BSL', note: 'Art + Rhine', type: 'destination' as const, sortOrder: 72 },

  // Czechia
  { id: 'prague', city: 'Prague', country: 'Czechia', code: 'PRG', note: 'Fairy-tale old town', type: 'destination' as const, sortOrder: 73 },
  { id: 'brno', city: 'Brno', country: 'Czechia', code: 'BRQ', note: 'Villa Tugendhat', type: 'destination' as const, sortOrder: 74 },

  // Poland
  { id: 'warsaw', city: 'Warsaw', country: 'Poland', code: 'WAW', note: 'Rebuilt capital', type: 'destination' as const, sortOrder: 75 },
  { id: 'krakow', city: 'Krakow', country: 'Poland', code: 'KRK', note: 'Square + salt mines', type: 'destination' as const, sortOrder: 76 },
  { id: 'gdansk', city: 'Gdansk', country: 'Poland', code: 'GDN', note: 'Baltic amber', type: 'destination' as const, sortOrder: 77 },
  { id: 'wroclaw', city: 'Wroclaw', country: 'Poland', code: 'WRO', note: 'Dwarfs + bridges', type: 'destination' as const, sortOrder: 78 },
  { id: 'poznan', city: 'Poznan', country: 'Poland', code: 'POZ', note: 'Renaissance square', type: 'destination' as const, sortOrder: 79 },

  // Hungary
  { id: 'budapest', city: 'Budapest', country: 'Hungary', code: 'BUD', note: 'Thermal baths + ruin bars', type: 'destination' as const, sortOrder: 80 },

  // Slovakia
  { id: 'bratislava', city: 'Bratislava', country: 'Slovakia', code: 'BTS', note: 'Castle + Danube', type: 'destination' as const, sortOrder: 81 },

  // Denmark
  { id: 'copenhagen', city: 'Copenhagen', country: 'Denmark', code: 'CPH', note: 'Design + food', type: 'destination' as const, sortOrder: 82 },

  // Sweden
  { id: 'stockholm', city: 'Stockholm', country: 'Sweden', code: 'ARN', note: 'Islands + Nordic cool', type: 'destination' as const, sortOrder: 83 },
  { id: 'gothenburg', city: 'Gothenburg', country: 'Sweden', code: 'GOT', note: 'Coast + seafood', type: 'destination' as const, sortOrder: 84 },

  // Norway
  { id: 'oslo', city: 'Oslo', country: 'Norway', code: 'OSL', note: 'Fjords + Viking ships', type: 'destination' as const, sortOrder: 85 },
  { id: 'bergen', city: 'Bergen', country: 'Norway', code: 'BGO', note: 'Fjord gateway', type: 'destination' as const, sortOrder: 86 },

  // Finland
  { id: 'helsinki', city: 'Helsinki', country: 'Finland', code: 'HEL', note: 'Saunas + design', type: 'destination' as const, sortOrder: 87 },

  // Iceland
  { id: 'reykjavik', city: 'Reykjavik', country: 'Iceland', code: 'KEF', note: 'Geysers + Northern Lights', type: 'destination' as const, sortOrder: 88 },

  // Estonia
  { id: 'tallinn', city: 'Tallinn', country: 'Estonia', code: 'TLL', note: 'Medieval old town', type: 'destination' as const, sortOrder: 89 },

  // Latvia
  { id: 'riga', city: 'Riga', country: 'Latvia', code: 'RIX', note: 'Art Nouveau + amber', type: 'destination' as const, sortOrder: 90 },

  // Lithuania
  { id: 'vilnius', city: 'Vilnius', country: 'Lithuania', code: 'VNO', note: 'Baroque old town', type: 'destination' as const, sortOrder: 91 },

  // Romania
  { id: 'bucharest', city: 'Bucharest', country: 'Romania', code: 'OTP', note: 'Little Paris', type: 'destination' as const, sortOrder: 92 },
  { id: 'cluj-napoca', city: 'Cluj-Napoca', country: 'Romania', code: 'CLJ', note: 'Transylvanian hub', type: 'destination' as const, sortOrder: 93 },
  { id: 'timisoara', city: 'Timisoara', country: 'Romania', code: 'TSR', note: 'Baroque squares', type: 'destination' as const, sortOrder: 94 },

  // Bulgaria
  { id: 'sofia', city: 'Sofia', country: 'Bulgaria', code: 'SOF', note: 'Mountains + churches', type: 'destination' as const, sortOrder: 95 },
  { id: 'varna', city: 'Varna', country: 'Bulgaria', code: 'VAR', note: 'Black Sea coast', type: 'destination' as const, sortOrder: 96 },
  { id: 'plovdiv', city: 'Plovdiv', country: 'Bulgaria', code: 'PDV', note: 'Roman amphitheatre', type: 'destination' as const, sortOrder: 97 },

  // Serbia
  { id: 'belgrade', city: 'Belgrade', country: 'Serbia', code: 'BEG', note: 'Fortress + nightlife', type: 'destination' as const, sortOrder: 98 },

  // Slovenia
  { id: 'ljubljana', city: 'Ljubljana', country: 'Slovenia', code: 'LJU', note: 'Green + dragon bridge', type: 'destination' as const, sortOrder: 99 },
]

const SEED_ORIGINS = [
  // UK
  { id: 'london', city: 'London', country: null, code: 'LON', note: null, type: 'origin' as const, sortOrder: 0 },
  { id: 'manchester', city: 'Manchester', country: null, code: 'MAN', note: null, type: 'origin' as const, sortOrder: 1 },
  { id: 'edinburgh', city: 'Edinburgh', country: null, code: 'EDI', note: null, type: 'origin' as const, sortOrder: 2 },
  { id: 'glasgow', city: 'Glasgow', country: null, code: 'GLA', note: null, type: 'origin' as const, sortOrder: 3 },
  { id: 'bristol', city: 'Bristol', country: null, code: 'BRS', note: null, type: 'origin' as const, sortOrder: 4 },
  { id: 'birmingham', city: 'Birmingham', country: null, code: 'BHX', note: null, type: 'origin' as const, sortOrder: 5 },
  { id: 'aberdeen', city: 'Aberdeen', country: null, code: 'ABZ', note: null, type: 'origin' as const, sortOrder: 6 },
  { id: 'belfast', city: 'Belfast', country: null, code: 'BFS', note: null, type: 'origin' as const, sortOrder: 7 },
  { id: 'newcastle', city: 'Newcastle', country: null, code: 'NCL', note: null, type: 'origin' as const, sortOrder: 8 },
  { id: 'leeds', city: 'Leeds', country: null, code: 'LBA', note: null, type: 'origin' as const, sortOrder: 9 },
  { id: 'liverpool', city: 'Liverpool', country: null, code: 'LPL', note: null, type: 'origin' as const, sortOrder: 10 },
  { id: 'cardiff', city: 'Cardiff', country: null, code: 'CWL', note: null, type: 'origin' as const, sortOrder: 11 },
  { id: 'jersey', city: 'Jersey', country: null, code: 'JER', note: null, type: 'origin' as const, sortOrder: 12 },
  { id: 'southampton', city: 'Southampton', country: null, code: 'SOU', note: null, type: 'origin' as const, sortOrder: 13 },

  // Ireland
  { id: 'dublin', city: 'Dublin', country: null, code: 'DUB', note: null, type: 'origin' as const, sortOrder: 14 },
  { id: 'cork', city: 'Cork', country: null, code: 'ORK', note: null, type: 'origin' as const, sortOrder: 15 },
  { id: 'shannon', city: 'Shannon', country: null, code: 'SNN', note: null, type: 'origin' as const, sortOrder: 16 },

  // France
  { id: 'paris', city: 'Paris', country: null, code: 'CDG', note: null, type: 'origin' as const, sortOrder: 17 },
  { id: 'nice', city: 'Nice', country: null, code: 'NCE', note: null, type: 'origin' as const, sortOrder: 18 },
  { id: 'lyon', city: 'Lyon', country: null, code: 'LYS', note: null, type: 'origin' as const, sortOrder: 19 },
  { id: 'marseille', city: 'Marseille', country: null, code: 'MRS', note: null, type: 'origin' as const, sortOrder: 20 },
  { id: 'bordeaux', city: 'Bordeaux', country: null, code: 'BOD', note: null, type: 'origin' as const, sortOrder: 21 },
  { id: 'toulouse', city: 'Toulouse', country: null, code: 'TLS', note: null, type: 'origin' as const, sortOrder: 22 },
  { id: 'strasbourg', city: 'Strasbourg', country: null, code: 'SXB', note: null, type: 'origin' as const, sortOrder: 23 },
  { id: 'nantes', city: 'Nantes', country: null, code: 'NTE', note: null, type: 'origin' as const, sortOrder: 24 },
  { id: 'lille', city: 'Lille', country: null, code: 'LIL', note: null, type: 'origin' as const, sortOrder: 25 },

  // Netherlands
  { id: 'amsterdam', city: 'Amsterdam', country: null, code: 'AMS', note: null, type: 'origin' as const, sortOrder: 26 },
  { id: 'rotterdam', city: 'Rotterdam', country: null, code: 'RTM', note: null, type: 'origin' as const, sortOrder: 27 },
  { id: 'eindhoven', city: 'Eindhoven', country: null, code: 'EIN', note: null, type: 'origin' as const, sortOrder: 28 },

  // Belgium
  { id: 'brussels', city: 'Brussels', country: null, code: 'BRU', note: null, type: 'origin' as const, sortOrder: 29 },
  { id: 'antwerp', city: 'Antwerp', country: null, code: 'ANR', note: null, type: 'origin' as const, sortOrder: 30 },

  // Spain
  { id: 'barcelona', city: 'Barcelona', country: null, code: 'BCN', note: null, type: 'origin' as const, sortOrder: 31 },
  { id: 'madrid', city: 'Madrid', country: null, code: 'MAD', note: null, type: 'origin' as const, sortOrder: 32 },
  { id: 'malaga', city: 'Malaga', country: null, code: 'AGP', note: null, type: 'origin' as const, sortOrder: 33 },
  { id: 'seville', city: 'Seville', country: null, code: 'SVQ', note: null, type: 'origin' as const, sortOrder: 34 },
  { id: 'granada', city: 'Granada', country: null, code: 'GRX', note: null, type: 'origin' as const, sortOrder: 35 },
  { id: 'bilbao', city: 'Bilbao', country: null, code: 'BIO', note: null, type: 'origin' as const, sortOrder: 36 },
  { id: 'palma', city: 'Palma de Mallorca', country: null, code: 'PMI', note: null, type: 'origin' as const, sortOrder: 37 },

  // Portugal
  { id: 'lisbon', city: 'Lisbon', country: null, code: 'LIS', note: null, type: 'origin' as const, sortOrder: 38 },
  { id: 'porto', city: 'Porto', country: null, code: 'OPO', note: null, type: 'origin' as const, sortOrder: 39 },
  { id: 'faro', city: 'Faro', country: null, code: 'FAO', note: null, type: 'origin' as const, sortOrder: 40 },

  // Italy
  { id: 'rome', city: 'Rome', country: null, code: 'FCO', note: null, type: 'origin' as const, sortOrder: 41 },
  { id: 'milan', city: 'Milan', country: null, code: 'MXP', note: null, type: 'origin' as const, sortOrder: 42 },
  { id: 'venice', city: 'Venice', country: null, code: 'VCE', note: null, type: 'origin' as const, sortOrder: 43 },
  { id: 'florence', city: 'Florence', country: null, code: 'FLR', note: null, type: 'origin' as const, sortOrder: 44 },
  { id: 'naples', city: 'Naples', country: null, code: 'NAP', note: null, type: 'origin' as const, sortOrder: 45 },
  { id: 'verona', city: 'Verona', country: null, code: 'VRN', note: null, type: 'origin' as const, sortOrder: 46 },
  { id: 'catania', city: 'Catania', country: null, code: 'CTA', note: null, type: 'origin' as const, sortOrder: 47 },
  { id: 'cagliari', city: 'Cagliari', country: null, code: 'CAG', note: null, type: 'origin' as const, sortOrder: 48 },
  { id: 'bologna', city: 'Bologna', country: null, code: 'BLQ', note: null, type: 'origin' as const, sortOrder: 49 },

  // Greece
  { id: 'athens', city: 'Athens', country: null, code: 'ATH', note: null, type: 'origin' as const, sortOrder: 50 },
  { id: 'thessaloniki', city: 'Thessaloniki', country: null, code: 'SKG', note: null, type: 'origin' as const, sortOrder: 51 },
  { id: 'heraklion', city: 'Heraklion', country: null, code: 'HER', note: null, type: 'origin' as const, sortOrder: 52 },

  // Croatia
  { id: 'dubrovnik', city: 'Dubrovnik', country: null, code: 'DBV', note: null, type: 'origin' as const, sortOrder: 53 },
  { id: 'split', city: 'Split', country: null, code: 'SPU', note: null, type: 'origin' as const, sortOrder: 54 },
  { id: 'zagreb', city: 'Zagreb', country: null, code: 'ZAG', note: null, type: 'origin' as const, sortOrder: 55 },

  // Malta
  { id: 'valletta', city: 'Valletta', country: null, code: 'MLA', note: null, type: 'origin' as const, sortOrder: 56 },

  // Cyprus
  { id: 'larnaca', city: 'Larnaca', country: null, code: 'LCA', note: null, type: 'origin' as const, sortOrder: 57 },

  // Germany
  { id: 'berlin', city: 'Berlin', country: null, code: 'BER', note: null, type: 'origin' as const, sortOrder: 58 },
  { id: 'munich', city: 'Munich', country: null, code: 'MUC', note: null, type: 'origin' as const, sortOrder: 59 },
  { id: 'frankfurt', city: 'Frankfurt', country: null, code: 'FRA', note: null, type: 'origin' as const, sortOrder: 60 },
  { id: 'hamburg', city: 'Hamburg', country: null, code: 'HAM', note: null, type: 'origin' as const, sortOrder: 61 },
  { id: 'dusseldorf', city: 'Dusseldorf', country: null, code: 'DUS', note: null, type: 'origin' as const, sortOrder: 62 },
  { id: 'cologne', city: 'Cologne', country: null, code: 'CGN', note: null, type: 'origin' as const, sortOrder: 63 },
  { id: 'stuttgart', city: 'Stuttgart', country: null, code: 'STR', note: null, type: 'origin' as const, sortOrder: 64 },
  { id: 'nuremberg', city: 'Nuremberg', country: null, code: 'NUE', note: null, type: 'origin' as const, sortOrder: 65 },
  { id: 'leipzig', city: 'Leipzig', country: null, code: 'LEJ', note: null, type: 'origin' as const, sortOrder: 66 },
  { id: 'hanover', city: 'Hanover', country: null, code: 'HAJ', note: null, type: 'origin' as const, sortOrder: 67 },
  { id: 'bremen', city: 'Bremen', country: null, code: 'BRE', note: null, type: 'origin' as const, sortOrder: 68 },
  { id: 'dresden', city: 'Dresden', country: null, code: 'DRS', note: null, type: 'origin' as const, sortOrder: 69 },

  // Austria
  { id: 'vienna', city: 'Vienna', country: null, code: 'VIE', note: null, type: 'origin' as const, sortOrder: 70 },
  { id: 'salzburg', city: 'Salzburg', country: null, code: 'SZG', note: null, type: 'origin' as const, sortOrder: 71 },
  { id: 'innsbruck', city: 'Innsbruck', country: null, code: 'INN', note: null, type: 'origin' as const, sortOrder: 72 },

  // Switzerland
  { id: 'zurich', city: 'Zurich', country: null, code: 'ZRH', note: null, type: 'origin' as const, sortOrder: 73 },
  { id: 'geneva', city: 'Geneva', country: null, code: 'GVA', note: null, type: 'origin' as const, sortOrder: 74 },
  { id: 'basel', city: 'Basel', country: null, code: 'BSL', note: null, type: 'origin' as const, sortOrder: 75 },

  // Czechia
  { id: 'prague', city: 'Prague', country: null, code: 'PRG', note: null, type: 'origin' as const, sortOrder: 76 },
  { id: 'brno', city: 'Brno', country: null, code: 'BRQ', note: null, type: 'origin' as const, sortOrder: 77 },

  // Poland
  { id: 'warsaw', city: 'Warsaw', country: null, code: 'WAW', note: null, type: 'origin' as const, sortOrder: 78 },
  { id: 'krakow', city: 'Krakow', country: null, code: 'KRK', note: null, type: 'origin' as const, sortOrder: 79 },
  { id: 'gdansk', city: 'Gdansk', country: null, code: 'GDN', note: null, type: 'origin' as const, sortOrder: 80 },
  { id: 'wroclaw', city: 'Wroclaw', country: null, code: 'WRO', note: null, type: 'origin' as const, sortOrder: 81 },
  { id: 'poznan', city: 'Poznan', country: null, code: 'POZ', note: null, type: 'origin' as const, sortOrder: 82 },
  { id: 'katowice', city: 'Katowice', country: null, code: 'KTW', note: null, type: 'origin' as const, sortOrder: 83 },

  // Hungary
  { id: 'budapest', city: 'Budapest', country: null, code: 'BUD', note: null, type: 'origin' as const, sortOrder: 84 },
  { id: 'debrecen', city: 'Debrecen', country: null, code: 'DEB', note: null, type: 'origin' as const, sortOrder: 85 },

  // Slovakia
  { id: 'bratislava', city: 'Bratislava', country: null, code: 'BTS', note: null, type: 'origin' as const, sortOrder: 86 },
  { id: 'kosice', city: 'Kosice', country: null, code: 'KSC', note: null, type: 'origin' as const, sortOrder: 87 },

  // Denmark
  { id: 'copenhagen', city: 'Copenhagen', country: null, code: 'CPH', note: null, type: 'origin' as const, sortOrder: 88 },
  { id: 'billund', city: 'Billund', country: null, code: 'BLL', note: null, type: 'origin' as const, sortOrder: 89 },

  // Sweden
  { id: 'stockholm', city: 'Stockholm', country: null, code: 'ARN', note: null, type: 'origin' as const, sortOrder: 90 },
  { id: 'gothenburg', city: 'Gothenburg', country: null, code: 'GOT', note: null, type: 'origin' as const, sortOrder: 91 },
  { id: 'malmo', city: 'Malmo', country: null, code: 'MMX', note: null, type: 'origin' as const, sortOrder: 92 },

  // Norway
  { id: 'oslo', city: 'Oslo', country: null, code: 'OSL', note: null, type: 'origin' as const, sortOrder: 93 },
  { id: 'bergen', city: 'Bergen', country: null, code: 'BGO', note: null, type: 'origin' as const, sortOrder: 94 },
  { id: 'stavanger', city: 'Stavanger', country: null, code: 'SVG', note: null, type: 'origin' as const, sortOrder: 95 },

  // Finland
  { id: 'helsinki', city: 'Helsinki', country: null, code: 'HEL', note: null, type: 'origin' as const, sortOrder: 96 },
  { id: 'tampere', city: 'Tampere', country: null, code: 'TMP', note: null, type: 'origin' as const, sortOrder: 97 },

  // Iceland
  { id: 'reykjavik', city: 'Reykjavik', country: null, code: 'KEF', note: null, type: 'origin' as const, sortOrder: 98 },

  // Estonia
  { id: 'tallinn', city: 'Tallinn', country: null, code: 'TLL', note: null, type: 'origin' as const, sortOrder: 99 },
]

async function seed() {
  console.log('Seeding destinations table...')
  await db.insert(destinations).values([...SEED_DESTINATIONS, ...SEED_ORIGINS]).onConflictDoNothing()
  console.log(`Inserted ${SEED_DESTINATIONS.length} destinations and ${SEED_ORIGINS.length} origins`)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
