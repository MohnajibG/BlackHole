import { useState, useEffect } from "react";
import axios from "axios";

interface EpicPageData {
  caption: string;
  date: string; // format "YYYY-MM-DD HH:MM:SS"
  image: string; // id d'image (sans extension)
  identifier: string;
}

const Epic: React.FC = () => {
  const [data, setData] = useState<EpicPageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const buildEpicUrl = (item: EpicPageData) => {
    // date: "YYYY-MM-DD HH:MM:SS" -> on garde la partie YYYY-MM-DD
    const d = item.date.slice(0, 10); // "YYYY-MM-DD"
    const [yyyy, mm, dd] = d.split("-");
    return `https://epic.gsfc.nasa.gov/archive/natural/${yyyy}/${mm}/${dd}/png/${item.image}.png`;
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await axios.get<EpicPageData[]>(
        "https://api.nasa.gov/EPIC/api/natural/images?api_key=44GNdiexpkZvAGrHLbRH2p1WkMRTmdhq31zdVauy"
      );
      setData(data);
    } catch (e) {
      setError("Une erreur est survenue lors du chargement des images EPIC.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <main className="min-h-screen bg-blue-500 text-white px-4 py-10 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Earth Polychromatic Imaging Camera (EPIC)
      </h1>

      {error && (
        <div className="w-full max-w-4xl mb-6 rounded-lg bg-white/20 backdrop-blur p-4">
          <p className="text-white">{error}</p>
        </div>
      )}

      {loading ? (
        <p className="text-white/90">Chargement...</p>
      ) : (
        <div className="grid w-full max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((item) => (
            <article
              key={item.identifier}
              className="bg-white rounded-lg shadow-lg overflow-hidden text-gray-900"
            >
              <img
                src={buildEpicUrl(item)}
                alt={item.caption}
                className="w-full h-56 object-cover"
                loading="lazy"
              />
              <div className="p-4">
                <p className="text-sm text-gray-600">
                  {new Date(item.date).toLocaleString()}
                </p>
                <h3 className="mt-1 font-semibold line-clamp-2">
                  {item.caption}
                </h3>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
};
export default Epic;
