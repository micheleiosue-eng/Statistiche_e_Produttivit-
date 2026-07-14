import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from "./store/AppContext";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Board } from "./pages/Board";
import { Team } from "./pages/Team";
import { GestioneStato } from "./pages/GestioneStato";

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
          </Route>
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;