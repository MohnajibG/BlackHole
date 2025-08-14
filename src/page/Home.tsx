import { useEffect, useMemo, useState } from "react";
import axios from "axios";

interface HomeData {
  title: string;
  url: string;
}

interface Item {
  data?: { title?: string }[];
  links?: { href?: string }[];
}

const SEED_TOPICS = [
  "mars",
  "moon",
  "jupiter",
  "saturn",
  "earth",
  "galaxy",
  "nebula",
  "supernova",
  "apollo",
  "hubble",
  "iss",
  "orion",
  "black hole",
  "eclipse",
  "comet",
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickN<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n);
}

async function searchImages(query: string): Promise<HomeData[]> {
  const url = `https://images-api.nasa.gov/search?q=${encodeURIComponent(
    query
  )}&media_type=image`;
  const { data } = await axios.get(url);
  const items: Item[] = data?.collection?.items ?? [];
  return items
    .map((it) => ({
      title: it.data?.[0]?.title || "Untitled",
      url: it.links?.[0]?.href || "",
    }))
    .filter((x) => x.url); // garder seulement celles avec image
}

const Home: React.FC = () => {
  const [data, setData] = useState<HomeData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>("");

  // 2–3 thèmes choisis aléatoirement à chaque montage (mémo pour rester stables jusqu’au “Surprise me”)
  const initialTopics = useMemo(() => pickN(SEED_TOPICS, 3), []);

  const loadRandom = async () => {
    try {
      setLoading(true);
      setErr("");
      // chercher en parallèle
      const results = await Promise.all(initialTopics.map(searchImages));
      // fusionner, dédupliquer par URL, mélanger, prendre 15
      const merged = shuffle(
        Array.from(
          new Map(
            results.flat().map((x) => [x.url, x]) // unique par url
          ).values()
        )
      ).slice(0, 15);
      setData(merged);
    } catch (e) {
      console.error(e);
      setErr("Impossible de charger les images pour le moment.");
    } finally {
      setLoading(false);
    }
  };

  const surpriseMe = async () => {
    // nouveaux topics aléatoires (indépendants de initialTopics)
    const freshTopics = pickN(SEED_TOPICS, 3);
    try {
      setLoading(true);
      setErr("");
      const results = await Promise.all(freshTopics.map(searchImages));
      const merged = shuffle(
        Array.from(new Map(results.flat().map((x) => [x.url, x])).values())
      ).slice(0, 15);
      setData(merged);
    } catch (e) {
      console.error(e);
      setErr("Impossible de charger un nouveau set d’images.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = async () => {
    if (!searchTerm.trim()) return;
    try {
      setLoading(true);
      setErr("");
      const items = await searchImages(searchTerm.trim());
      setData(shuffle(items).slice(0, 18));
    } catch (e) {
      console.error(e);
      setErr("Recherche impossible. Réessaie avec un autre mot-clé.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRandom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-500 to-indigo-700 text-white flex flex-col items-center py-10 px-4">
      <h1 className="text-3xl font-bold mb-3 text-center">NASA Image Search</h1>
      <p className="text-white/90 mb-6 text-center">
        Random picks on load • Try your own search or hit{" "}
        <span className="font-semibold">Surprise me</span>
      </p>

      <div className="flex w-full max-w-2xl gap-2 mb-6">
        <input
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
          placeholder="Search for NASA images…"
          className="flex-1 p-3 rounded-lg border border-white/30 bg-white/10 backdrop-blur placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white"
        />
        <button
          onClick={handleSearchSubmit}
          className="px-5 py-3 bg-white text-blue-700 font-semibold rounded-lg hover:bg-gray-100 transition"
        >
          Search
        </button>
        <button
          onClick={surpriseMe}
          className="px-5 py-3 bg-amber-300 text-amber-900 font-semibold rounded-lg hover:bg-amber-200 transition"
        >
          Surprise me
        </button>
      </div>

      {err && (
        <div className="w-full max-w-2xl mb-4 bg-red-500/20 border border-red-300/40 rounded p-3">
          <p>{err}</p>
        </div>
      )}

      {loading ? (
        // skeleton grid
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 w-full max-w-6xl">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="bg-white/20 rounded-lg overflow-hidden animate-pulse"
            >
              <div className="h-48 w-full bg-white/20" />
              <div className="p-4">
                <div className="h-5 w-3/4 bg-white/30 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 w-full max-w-6xl">
          {data.length > 0 ? (
            data.map((item, index) => (
              <a
                key={`${item.url}-${index}`}
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="group bg-white rounded-lg shadow-lg overflow-hidden transform transition hover:-translate-y-1 hover:shadow-2xl"
              >
                <div className="overflow-hidden">
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-52 object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="p-4 text-gray-900">
                  <h3 className="text-base font-semibold line-clamp-2">
                    {item.title}
                  </h3>
                </div>
              </a>
            ))
          ) : (
            <p className="text-white text-lg col-span-full text-center">
              Nothing found. Try another keyword or click “Surprise me”.
            </p>
          )}
        </div>
      )}
    </main>
  );
};

export default Home;
