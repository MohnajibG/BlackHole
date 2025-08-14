import { useEffect, useMemo, useRef, useState } from "react";
import { fetchPhotos } from "../components/fetchPhotos";

interface Photo {
  id: number;
  img_src: string;
  camera: { name: string };
}

const CameraOptions = {
  Curiosity: [
    { abbreviation: "FHAZ", name: "Front Hazard Avoidance Camera" },
    { abbreviation: "RHAZ", name: "Rear Hazard Avoidance Camera" },
    { abbreviation: "MAST", name: "Mast Camera" },
    { abbreviation: "CHEMCAM", name: "Chemistry and Camera Complex" },
    { abbreviation: "MAHLI", name: "Mars Hand Lens Imager" },
    { abbreviation: "MARDI", name: "Mars Descent Imager" },
    { abbreviation: "NAVCAM", name: "Navigation Camera" },
  ],
  Opportunity: [
    { abbreviation: "FHAZ", name: "Front Hazard Avoidance Camera" },
    { abbreviation: "RHAZ", name: "Rear Hazard Avoidance Camera" },
    { abbreviation: "NAVCAM", name: "Navigation Camera" },
    { abbreviation: "PANCAM", name: "Panoramic Camera" },
    {
      abbreviation: "MINITES",
      name: "Miniature Thermal Emission Spectrometer",
    },
  ],
  Spirit: [
    { abbreviation: "FHAZ", name: "Front Hazard Avoidance Camera" },
    { abbreviation: "RHAZ", name: "Rear Hazard Avoidance Camera" },
    { abbreviation: "NAVCAM", name: "Navigation Camera" },
    { abbreviation: "PANCAM", name: "Panoramic Camera" },
    {
      abbreviation: "MINITES",
      name: "Miniature Thermal Emission Spectrometer",
    },
  ],
} as const;

type CameraMap = typeof CameraOptions;
type Rover = keyof CameraMap;
type CameraOption = CameraMap[keyof CameraMap][number];

const ROVERS: Rover[] = Object.keys(CameraOptions) as Rover[];

// bornes approximatives pour le sol (pour éviter des valeurs aberrantes)
const MAX_SOL: Record<Rover, number> = {
  Curiosity: 3500,
  Opportunity: 5111,
  Spirit: 2208,
};

function randInt(max: number) {
  return Math.floor(Math.random() * (max + 1));
}
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const Mars: React.FC = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string>("");

  const [params, setParams] = useState<{
    sol: number;
    camera: string;
    rover: Rover;
  }>({
    sol: 1000,
    camera: "FHAZ",
    rover: "Curiosity",
  });

  const currentPhoto = useMemo(
    () => (selected != null ? photos[selected] : photos[0]),
    [photos, selected]
  );

  // --- chargeur avec protection contre les réponses obsolètes ---
  const requestIdRef = useRef(0);
  const loadPhotos = async (p = params) => {
    const id = ++requestIdRef.current;
    try {
      setLoading(true);
      setErr("");
      const fetched = await fetchPhotos(p);
      if (requestIdRef.current !== id) return; // réponse obsolète -> on ignore
      const list: Photo[] = Array.isArray(fetched) ? fetched : [];
      setPhotos(list);
      setSelected(list.length ? 0 : null);
    } catch (e) {
      if (requestIdRef.current !== id) return;
      console.error(e);
      setErr("Impossible de récupérer les photos pour ces paramètres.");
    } finally {
      if (requestIdRef.current === id) setLoading(false);
    }
  };

  // --- auto-load avec debounce 500ms sur tout changement de params ---
  useEffect(() => {
    const t = setTimeout(() => loadPhotos(params), 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.rover, params.camera, params.sol]);

  const handleRoverChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const rover = event.target.value as Rover;
    const firstCam = CameraOptions[rover][0]?.abbreviation ?? "FHAZ";
    setParams((p) => ({ ...p, rover, camera: firstCam }));
  };
  const handleCameraChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setParams((p) => ({ ...p, camera: event.target.value }));
  };
  const handleSolInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const n = Math.max(
      0,
      Math.min(Number(event.target.value || 0), MAX_SOL[params.rover])
    );
    setParams((p) => ({ ...p, sol: n }));
  };

  const surprise = () => {
    const rover = ROVERS[randInt(ROVERS.length - 1)];
    const cams = CameraOptions[rover];
    const camera = cams[randInt(cams.length - 1)].abbreviation;
    const sol = randInt(MAX_SOL[rover]);
    setParams({ rover, camera, sol }); // l’auto-load s’occupera du fetch
  };
  const shuffleOrder = () => setPhotos((p) => shuffle(p));

  // Navigation clavier pour la modal (←/→, Esc)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!photos.length || selected == null) return;
      if (e.key === "ArrowLeft")
        setSelected((i) =>
          i == null ? i : (i - 1 + photos.length) % photos.length
        );
      if (e.key === "ArrowRight")
        setSelected((i) => (i == null ? i : (i + 1) % photos.length));
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [photos.length, selected]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-red-600 to-rose-800 text-white px-4 py-10">
      <div className="mx-auto w-full max-w-[1400px]">
        <header className="mb-6 flex flex-col gap-4">
          <h1 className="text-3xl font-bold">Mars Rover Photos</h1>

          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-end">
            <label className="flex flex-col">
              <span className="mb-1 font-semibold">Rover</span>
              <select
                value={params.rover}
                onChange={handleRoverChange}
                className="p-2 rounded text-black"
              >
                {ROVERS.map((rover) => (
                  <option key={rover} value={rover}>
                    {rover}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col">
              <span className="mb-1 font-semibold">Camera</span>
              <select
                value={params.camera}
                onChange={handleCameraChange}
                className="p-2 rounded text-black"
              >
                {CameraOptions[params.rover].map((camera: CameraOption) => (
                  <option key={camera.abbreviation} value={camera.abbreviation}>
                    {camera.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex-1">
              <label className="flex justify-between mb-1 font-semibold">
                <span>Sol</span>
                <span className="text-white/80">
                  max {MAX_SOL[params.rover]}
                </span>
              </label>
              <input
                type="range"
                min={0}
                max={MAX_SOL[params.rover]}
                value={params.sol}
                onChange={handleSolInput}
                className="w-full"
              />
              <input
                type="number"
                min={0}
                max={MAX_SOL[params.rover]}
                value={params.sol}
                onChange={handleSolInput}
                className="mt-1 w-full p-2 rounded text-black"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => loadPhotos()}
                disabled={loading}
                className="px-4 py-2 bg-white text-red-700 font-semibold rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
                title="Recharger maintenant (auto-load actif)"
              >
                {loading ? "Chargement…" : "Refresh"}
              </button>
              <button
                onClick={surprise}
                className="px-4 py-2 bg-amber-300 text-amber-900 font-semibold rounded-lg hover:bg-amber-200 transition"
                title="Rover/camera/sol aléatoires"
              >
                Random
              </button>
              <button
                onClick={shuffleOrder}
                disabled={!photos.length}
                className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition disabled:opacity-50"
                title="Mélanger l'ordre"
              >
                Shuffle
              </button>
            </div>
          </div>
        </header>

        {err && (
          <div className="mb-6 rounded-lg bg-red-500/20 border border-red-300/40 p-4">
            <p>{err}</p>
          </div>
        )}

        {/* HERO */}
        {loading ? (
          <div className="animate-pulse">
            <div className="h-[60vh] w-full bg-white/20 rounded-xl" />
          </div>
        ) : currentPhoto ? (
          <section className="bg-white text-gray-900 rounded-xl shadow-2xl overflow-hidden">
            <figure className="bg-black">
              <img
                src={currentPhoto.img_src}
                alt={currentPhoto.camera.name}
                className="block w-full max-h-[80vh] object-contain cursor-zoom-in"
                onClick={() =>
                  setSelected(photos.findIndex((p) => p.id === currentPhoto.id))
                }
                loading="eager"
                decoding="async"
              />
            </figure>
            <figcaption className="p-4">
              <p className="text-gray-700">{currentPhoto.camera.name}</p>
            </figcaption>
          </section>
        ) : (
          <p className="text-white/90">
            Aucune photo pour ces paramètres. Essaie “Random”.
          </p>
        )}

        {/* GRID */}
        <div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-8"
          aria-busy={loading}
        >
          {loading
            ? Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white/20 rounded-lg overflow-hidden animate-pulse"
                >
                  <div className="h-48 w-full bg-white/20" />
                  <div className="p-3">
                    <div className="h-4 w-2/3 bg-white/30 rounded" />
                  </div>
                </div>
              ))
            : photos.map((photo, i) => (
                <button
                  key={photo.id}
                  onClick={() => setSelected(i)}
                  className="group bg-white rounded-lg shadow-lg overflow-hidden text-left transform transition hover:-translate-y-1 hover:shadow-2xl"
                  title={photo.camera.name}
                >
                  <div className="overflow-hidden">
                    <img
                      src={photo.img_src}
                      alt={photo.camera.name}
                      className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className="p-3 text-gray-900">
                    <p className="font-medium">{photo.camera.name}</p>
                  </div>
                </button>
              ))}
        </div>
      </div>

      {/* MODAL / LIGHTBOX */}
      {selected != null && photos[selected] && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative max-w-[95vw] max-h-[95vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={photos[selected].img_src}
              alt={photos[selected].camera.name}
              className="max-h-[85vh] max-w-[90vw] object-contain"
            />
            <button
              onClick={() => setSelected(null)}
              className="absolute -top-3 -right-3 bg-white text-black rounded-full px-3 py-1 font-semibold"
              aria-label="Fermer"
            >
              ✕
            </button>

            <button
              onClick={() =>
                setSelected((i) =>
                  i == null ? i : (i - 1 + photos.length) % photos.length
                )
              }
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded"
              aria-label="Précédent"
            >
              ←
            </button>
            <button
              onClick={() =>
                setSelected((i) => (i == null ? i : (i + 1) % photos.length))
              }
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded"
              aria-label="Suivant"
            >
              →
            </button>

            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white/90">
              {photos[selected].camera.name}
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Mars;
