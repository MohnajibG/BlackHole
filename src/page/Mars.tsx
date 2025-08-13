import { useState } from "react";
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

const Mars = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [params, setParams] = useState<{
    sol: number;
    camera: string;
    rover: Rover;
  }>({
    sol: 1000,
    camera: "FHAZ",
    rover: "Curiosity",
  });

  const handleFetchPhotos = async () => {
    const fetchedPhotos = await fetchPhotos(params);
    if (fetchedPhotos) setPhotos(fetchedPhotos);
  };

  const handleRoverChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setParams((p) => ({ ...p, rover: event.target.value as Rover }));
  };

  const handleCameraChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setParams((p) => ({ ...p, camera: event.target.value }));
  };

  return (
    <main className="min-h-screen bg-red-400 flex flex-col items-center py-10 px-4 text-white">
      <h1 className="text-3xl font-bold mb-6">Mars Rover Photos</h1>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <label className="flex flex-col">
          <span className="mb-1 font-semibold">Rover</span>
          <select
            value={params.rover}
            onChange={handleRoverChange}
            className="p-2 rounded text-black"
          >
            {(Object.keys(CameraOptions) as Rover[]).map((rover) => (
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
      </div>

      <button
        onClick={handleFetchPhotos}
        className="bg-white text-red-600 font-semibold px-5 py-2 rounded-lg hover:bg-gray-200 transition"
      >
        Voir les photos
      </button>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-8 w-full max-w-6xl">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="bg-white rounded-lg shadow-lg overflow-hidden"
          >
            <img
              src={photo.img_src}
              alt={photo.camera.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <p className="text-gray-800">{photo.camera.name}</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};

export default Mars;
