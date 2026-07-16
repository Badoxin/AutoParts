import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { Home }         from './pages/Home';
import { Servicios }    from './pages/Servicios';
import { Citas }        from './pages/Citas';
import { Contacto }     from './pages/Contacto';
import { Perfil }       from './pages/Perfil';
import { ConfirmarCita } from './pages/ConfirmarCita';
import { AdminPanel }   from './pages/AdminPanel';
import { AuthModal }    from './components/AuthModal';
import { PageTransition } from './components/PageTransition';

export default function App() {
  const location = useLocation();

  return (
    <>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/"          element={<PageTransition><Home /></PageTransition>}         />
          <Route path="/servicios" element={<PageTransition><Servicios /></PageTransition>}    />
          <Route path="/citas"     element={<PageTransition><Citas /></PageTransition>}        />
          <Route path="/contacto"  element={<PageTransition><Contacto /></PageTransition>}     />
          <Route path="/perfil"    element={<PageTransition><Perfil /></PageTransition>}       />
          <Route path="/confirmar-cita/:id" element={<PageTransition><ConfirmarCita /></PageTransition>} />
          <Route path="/admin"     element={<PageTransition><AdminPanel /></PageTransition>}   />
        </Routes>
      </AnimatePresence>
      <AuthModal />
    </>
  );
}
