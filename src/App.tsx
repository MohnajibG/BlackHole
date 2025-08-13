import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./page/Home";
import Apod from "./page/Apod";
import Epic from "./page/Epic";
import Mars from "./page/Mars";

import { Header } from "./components/header";

const App = () => {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/epic" element={<Epic />} />
        <Route path="/apod" element={<Apod />} />
        <Route path="/mars" element={<Mars />} />
      </Routes>
    </Router>
  );
};

export default App;
