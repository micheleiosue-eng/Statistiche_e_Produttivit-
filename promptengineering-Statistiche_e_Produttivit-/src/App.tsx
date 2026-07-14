import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from "./store/AppContext";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Board } from "./pages/Board";
import { Team } from "./pages/Team";
import { GestioneStato } from "./pages/GestioneStato";
import { GestioneCategorie } from "./pages/GestioneCategorie";
import { GestioneProgetti } from "./pages/GestioneProgetti";

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/board" element={<Board />} />
            <Route path="/team" element={<Team />} />
            <Route path="/gestione_stato" element={<GestioneStato />} />
            <Route path="/categorie" element={<GestioneCategorie />} />
            <Route path="/progetti" element={<GestioneProgetti />} />
          </Route>
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;