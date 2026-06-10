import { Link } from 'react-router-dom';
import { PackageX } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div
      className="min-h-screen relative flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2070&auto=format&fit=crop')",
      }}
    >
      {/* Overlay oscuro */}
      <div className="absolute inset-0 bg-black/80"></div>

      {/* Contenido */}
      <div className="relative z-10 flex flex-col items-center text-center px-6">

        {/* Icono */}
        <div className="bg-[#ff6b00]/20 border border-[#ff6b00] p-5 rounded-full mb-8">
          <PackageX className="h-14 w-14 text-[#ff6b00]" />
        </div>

        {/* 404 */}
        <h1
          className="text-8xl md:text-9xl font-black mb-4 text-transparent"
          style={{
            WebkitTextStroke: '3px #ff6b00',
          }}
        >
          404
        </h1>

        {/* Título */}
        <h2 className="text-4xl md:text-5xl font-extrabold text-white uppercase leading-tight mb-4">
          Página
          <br />
          No Encontrada
        </h2>

        {/* Texto */}
        <p className="text-gray-300 text-lg max-w-lg mb-10">
          La página que intentas visitar no existe, fue movida o la dirección ingresada es incorrecta.
        </p>

        {/* Botón */}
        <Link
          to="/"
          className="
            flex items-center gap-3
            bg-[#ff6b00]
            hover:bg-[#e65f00]
            text-white
            font-bold
            uppercase
            tracking-wide
            px-8
            py-4
            rounded-lg
            transition-all
            duration-300
            shadow-xl
            hover:scale-105
          "
        >
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
}