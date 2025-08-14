import { useEffect, useMemo, useState } from "react";
import axios from "axios";

interface EpicPageData {
  caption: string;
  date: string; // "YYYY-MM-DD HH:MM:SS"
  image: string; // id d'image (sans extension)
  identifier: string;
}

const API =
  "https://api.nasa.gov/EPIC/api/natural/images?api_key=44GNdiexpkZvAGrHLbRH2p1WkMRTmdhq31zdVauy";

const buildEpicUrl = (item: EpicPageData) => {
  const d = item.date.slice(0, 10); // "YYYY-MM-DD"
  const [yyyy, mm, dd] = d.split("-");
  return `https://epic.gsfc.nasa.gov/archive/natural/${yyyy}/${mm}/${dd}/png/${item.image}.png`;
};

const Epic: React.FC = () => {
  const [data, setData] = useState<EpicPageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [index, setIndex] = useState(0);

  const hasData = data.length > 0;
  const current = hasData ? data[index] : null;
  const currentUrl = useMemo(
    () => (current ? buildEpicUrl(current) : ""),
    [current]
  );

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await axios.get<EpicPageData[]>(API);
      setData(data);
      setIndex(0);
    } catch (e) {
      console.error(e);
      setError("Une erreur est survenue lors du chargement des images EPIC.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // navigation
  const prev = () =>
    hasData && setIndex((i) => (i - 1 + data.length) % data.length);
  const next = () => hasData && setIndex((i) => (i + 1) % data.length);
  const surprise = () =>
    hasData && setIndex(() => Math.floor(Math.random() * data.length));

  // clavier ← →
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [data.length]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-800 text-white px-4 py-10">
      <div className="mx-auto w-full max-w-[1400px]">
        <header className="mb-6 flex flex-col sm:flex-row items-center gap-3">
          <h1 className="text-3xl font-bold flex-1 text-center sm:text-left">
            Earth Polychromatic Imaging Camera (EPIC)
          </h1>
          <div className="flex gap-2">
            <button
              onClick={prev}
              className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition disabled:opacity-50"
              disabled={!hasData || loading}
              aria-label="Previous"
            >
              ← Prev
            </button>
            <button
              onClick={next}
              className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition disabled:opacity-50"
              disabled={!hasData || loading}
              aria-label="Next"
            >
              Next →
            </button>
            <button
              onClick={surprise}
              className="px-4 py-2 bg-amber-300 text-amber-900 font-semibold rounded-lg hover:bg-amber-200 transition disabled:opacity-50"
              disabled={!hasData || loading}
            >
              Surprise me
            </button>
          </div>
        </header>

        {error && (
          <div className="mb-6 rounded-lg bg-red-500/20 border border-red-300/40 p-4">
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <div className="animate-pulse">
            <div className="h-[70vh] w-full bg-white/20 rounded-xl" />
            <div className="mt-4 h-6 w-1/2 bg-white/30 rounded" />
            <div className="mt-2 h-4 w-2/3 bg-white/20 rounded" />
          </div>
        ) : hasData ? (
          <>
            {/* HERO très grand */}
            <section className="bg-white text-gray-900 rounded-xl shadow-2xl overflow-hidden">
              <figure className="bg-black">
                <img
                  src={currentUrl}
                  alt={current!.caption}
                  className="block w-full max-h-[85vh] object-contain"
                  loading="eager"
                  decoding="async"
                />
              </figure>
              <figcaption className="p-5">
                <p className="text-sm text-gray-600">
                  {new Date(current!.date).toLocaleString()}
                </p>
                <h2 className="text-xl font-semibold mt-1">
                  {current!.caption}
                </h2>
              </figcaption>
            </section>

            {/* THUMBNAILS défilables */}
            <section className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">More from this set</h3>
                <button
                  onClick={fetchData}
                  className="px-3 py-1.5 bg-white/20 rounded hover:bg-white/30 transition"
                >
                  Refresh
                </button>
              </div>

              <div className="flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {data.map((item, i) => {
                  const url = buildEpicUrl(item);
                  const active = i === index;
                  return (
                    <button
                      key={item.identifier}
                      onClick={() => setIndex(i)}
                      className={`shrink-0 rounded-lg overflow-hidden border transition-transform ${
                        active
                          ? "border-white scale-[1.03]"
                          : "border-white/0 hover:border-white/40"
                      }`}
                      title={new Date(item.date).toLocaleString()}
                    >
                      <img
                        src={url}
                        alt={item.caption}
                        className={`h-24 w-24 object-cover ${
                          active ? "" : "opacity-90"
                        }`}
                        loading="lazy"
                        decoding="async"
                      />
                    </button>
                  );
                })}
              </div>
            </section>
          </>
        ) : (
          <p className="text-white/90">Aucune image disponible.</p>
        )}
      </div>
    </main>
  );
};

export default Epic;
