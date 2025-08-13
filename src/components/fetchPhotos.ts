import axios from "axios";

interface PhotosParams {
  sol: number;
  earthDate?: string;
  camera: string;
  rover: string;
}

interface Photo {
  id: number;
  img_src: string;
  camera: { name: string };
}

export const fetchPhotos = async ({
  sol,
  earthDate,
  camera,
  rover,
}: PhotosParams): Promise<Photo[] | void> => {
  const params = {
    sol,
    earthDate,
    camera,
    api_key: "44GNdiexpkZvAGrHLbRH2p1WkMRTmdhq31zdVauy", // Ajout de la clé API ici
  };
  try {
    const response = await axios.get(
      `https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/photos`,
      { params }
    );
    return response.data.photos; // Retourne les photos de la réponse
  } catch (error) {
    console.log(error);
  }
};
