import { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { CategoryCard } from '../components/CategoryCard';
import { Footer } from '../components/Footer';
import { FiltroVehiculo } from '../components/FiltroVehiculo';
import { Disc3, Zap, Settings, Battery, CircleDot, Search } from 'lucide-react';

const categories = [
  { title: 'Frenos',     icon: Disc3,     slug: 'frenos'     },
  { title: 'Motor',      icon: Settings,  slug: 'motor'      },
  { title: 'Suspensión', icon: Zap,       slug: 'suspension' },
  { title: 'Baterías',   icon: Battery,   slug: 'baterias'   },
  { title: 'Llantas',    icon: CircleDot, slug: 'llantas'    },
];

export function Home() {
  const [filtroOpen, setFiltroOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-950">

      <FiltroVehiculo
        isOpen={filtroOpen}
        onClose={() => setFiltroOpen(false)}
      />

      <Navbar />

      {/* Hero Section */}
      <section className="relative h-screen overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1759189189642-192febc42404?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydHMlMjBjYXIlMjBhdXRvbW90aXZlJTIwcGFydHMlMjB3b3Jrc2hvcHxlbnwxfHx8fDE3NzkyNDQ5MjZ8MA&ixlib=rb-4.1.0&q=80&w=1920"
            alt="Hero car"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent"></div>
        </div>

        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-orange-500 text-white text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded mb-6">
              Refacciones Originales
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-white uppercase leading-none mb-2">
              Tu auto
            </h1>
            <h1 className="text-6xl md:text-8xl font-black uppercase leading-none mb-6"
                style={{ WebkitTextStroke: '2px #f97316', color: 'transparent' }}>
              Busca
            </h1>
            <h1 className="text-6xl md:text-8xl font-black uppercase leading-none mb-8"
                style={{ WebkitTextStroke: '2px #f97316', color: 'transparent' }}>
              Calidad
            </h1>
            <p className="text-xl text-white font-bold mb-2">
              Refacciones originales y accesorios para que tu carro no falle.
            </p>
            <p className="text-gray-300 mb-8">
              El inventario más avanzado en San Luis Río Colorado y Mexicali.<br />
              <strong className="text-white">Encuentra tu pieza exacta</strong> sin salir de casa.
            </p>
            <button
              onClick={() => setFiltroOpen(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded font-black uppercase tracking-widest flex items-center gap-2 transition-colors text-sm"
            >
              <Search className="w-5 h-5" />
              Encontrar partes
            </button>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">Categorías Principales</h2>
          <p className="text-gray-400">Explora nuestro catálogo de refacciones por categoría</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {categories.map((category) => (
            <CategoryCard
              key={category.title}
              title={category.title}
              icon={category.icon}
              slug={category.slug}
            />
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}