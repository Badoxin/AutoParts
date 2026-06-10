import { Routes, Route } from 'react-router-dom';
import { Home }     from './pages/Home';
import { Catalogo } from './pages/Catalogo';
import { Ofertas }  from './pages/Ofertas';
import { Contacto } from './pages/Contacto';
import { NotFoundPage } from './pages/NotFoundPage';

export default function App() {
  return (
    <Routes>
      <Route path="/"         element={<Home />}     />
      <Route path="/catalogo" element={<Catalogo />} />
      <Route path="/ofertas"  element={<Ofertas />}  />
      <Route path="/contacto" element={<Contacto />} />
      <Route path="*"         element={<NotFoundPage />} />
    </Routes>
  );
}