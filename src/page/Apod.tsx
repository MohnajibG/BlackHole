import { useState, useEffect } from "react";
import axios from "axios";

interface ApodPageData {
  copyright?: string;
  date: string;
  explanation: string;
  hdurl?: string;
  url: string;
  title: string;
  media_type: "image" | "video";
}

const Apod: React.FC = () => {
  const [data, setData] = useState<ApodPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get<ApodPageData>(
        "https://api.nasa.gov/planetary/apod?api_key=44GNdiexpkZvAGrHLbRH2p1WkMRTmdhq31zdVauy"
      );
      setData(res.data);
    } catch (e) {
      console.error(e);
      setError("Impossible de charger l’APOD pour le moment.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <main className="min-h-screen bg-blue-600 text-white px-4 py-10 flex justify-center">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Astronomy Picture of the Day
        </h1>

        {error && (
          <div className="mb-6 rounded-lg bg-white/20 p-4">
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <div className="animate-pulse">
            <div className="h-7 w-2/3 bg-white/30 rounded mb-4" />
            <div className="h-64 w-full bg-white/20 rounded" />
            <div className="h-4 w-full bg-white/20 rounded mt-6" />
            <div className="h-4 w-5/6 bg-white/20 rounded mt-2" />
            <div className="h-4 w-4/6 bg-white/20 rounded mt-2" />
          </div>
        ) : data ? (
          <div className="bg-white text-gray-900 rounded-lg shadow-lg overflow-hidden">
            <div className="p-5">
              <h2 className="text-2xl font-semibold mb-3">{data.title}</h2>

              {/* Media */}
              <div className="rounded-lg overflow-hidden">
                {data.media_type === "image" ? (
                  <a
                    href={data.hdurl ?? data.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block"
                  >
                    <img
                      src={data.hdurl ?? data.url}
                      alt={data.title}
                      className="w-full max-h-[560px] object-contain bg-gray-100"
                      loading="lazy"
                    />
                  </a>
                ) : (
                  <div className="aspect-video bg-gray-100">
                    <iframe
                      src={data.url}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={data.title}
                    />
                  </div>
                )}
              </div>

              {/* Meta */}
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-700">
                <p>
                  <span className="font-semibold">Date :</span> {data.date}
                </p>
                {data.copyright && (
                  <p>
                    <span className="font-semibold">Crédits :</span>{" "}
                    {data.copyright}
                  </p>
                )}
              </div>

              {/* Explanation */}
              <div className="mt-5">
                <h3 className="text-lg font-semibold mb-2">Explanation</h3>
                <p className="leading-relaxed">{data.explanation}</p>
                <a
                  className="inline-block mt-4 text-blue-600 hover:underline"
                  href="https://apod.nasa.gov/apod/archivepix.html"
                  target="_blank"
                  rel="noreferrer"
                >
                  Archives
                </a>
              </div>
            </div>
          </div>
        ) : (
          <p>Aucune donnée.</p>
        )}
      </div>
    </main>
  );
};
export default Apod;
