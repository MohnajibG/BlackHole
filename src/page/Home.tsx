import { useState } from "react";
import axios from "axios";

// Interface pour structurer les données d'image
interface HomeData {
  title: string;
  url: string;
}

// Interface pour chaque élément de la réponse de l'API
interface Item {
  data: { title: string }[];
  links: { href: string }[];
}

const Home: React.FC = () => {
  const [data, setData] = useState<HomeData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async (query: string) => {
    try {
      const response = await axios.get(
        `https://images-api.nasa.gov/search?q=${query}`
      );

      const items = response.data.collection.items.map((item: Item) => ({
        title: item.data[0].title,
        url: item.links ? item.links[0].href : "",
      }));
      setData(items);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = () => {
    if (searchTerm.trim() !== "") {
      fetchData(searchTerm);
    }
  };

  return (
    <main className="min-h-screen bg-sky-300 flex flex-col items-center py-10 px-4">
      <h1 className="text-white text-3xl font-bold mb-6 text-center">
        NASA Image Search
      </h1>

      <div className="flex w-full max-w-xl gap-2 mb-8">
        <input
          type="search"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Search for NASA images..."
          className="flex-1 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-white"
        />
        <button
          onClick={handleSearchSubmit}
          className="px-5 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition"
        >
          Search
        </button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 w-full max-w-6xl">
        {data.length > 0 ? (
          data.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
            >
              <img
                src={item.url}
                alt={item.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {item.title}
                </h3>
              </div>
            </div>
          ))
        ) : (
          <p className="text-white text-lg col-span-full text-center">
            Search for images above.
          </p>
        )}
      </div>
    </main>
  );
};
export default Home;
