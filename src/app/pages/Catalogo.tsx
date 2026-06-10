import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { FiltroVehiculo } from '../components/FiltroVehiculo';
import { Search, SlidersHorizontal, PackageSearch } from 'lucide-react';
const categories = [
  'Frenos', 'Motor', 'Suspensión', 'Baterías',
  'Llantas', 'Transmisión', 'Eléctrico', 'Enfriamiento'
];

export function Catalogo() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [filtroOpen, setFiltroOpen] = useState(false);

  // Leer categoría desde la URL
  const categoriaUrl = searchParams.get('categoria') ?? '';
  const [categoriaActiva, setCategoriaActiva] = useState(categoriaUrl);

  // Sincronizar cuando cambia la URL (al venir de una CategoryCard)
  useEffect(() => {
    setCategoriaActiva(searchParams.get('categoria') ?? '');
  }, [searchParams]);

  // Breadcrumb dinámico
  const breadcrumbItems = categoriaActiva
    ? [
        { label: 'Catálogo', href: '/catalogo' },
        { label: categoriaActiva },
      ]
    : [{ label: 'Catálogo' }];

  // Info del vehículo si vino del filtro
  const marcaFiltro  = searchParams.get('marca');
  const modeloFiltro = searchParams.get('modelo');
  const anioFiltro   = searchParams.get('anio');
  const vehiculoLabel = [marcaFiltro, modeloFiltro, anioFiltro].filter(Boolean).join(' ');

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <FiltroVehiculo
        isOpen={filtroOpen}
        onClose={() => setFiltroOpen(false)}
      />

      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumbs items={breadcrumbItems} />
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Banner vehículo */}
        {vehiculoLabel && (
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg px-5 py-3 mb-8 flex items-center justify-between">
            <p className="text-orange-400 text-sm font-semibold">
               Mostrando refacciones para: <span className="text-white">{vehiculoLabel}</span>
            </p>
            <a href="/catalogo" className="text-gray-500 hover:text-white text-xs transition-colors">
              Quitar filtro
            </a>
          </div>
        )}

        {/* Header + buscador */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-1">
              {categoriaActiva ? categoriaActiva : 'Catálogo'}
            </h1>
            <p className="text-gray-400">
              {categoriaActiva
                ? `Refacciones de la categoría ${categoriaActiva}`
                : 'Explora nuestras refacciones por categoría o vehículo'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar producto o marca..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="bg-gray-800 border border-gray-700 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:border-orange-500 transition-colors w-64"
              />
            </div>
            <button
              onClick={() => setFiltroOpen(true)}
              className="flex items-center gap-2 bg-gray-800 border border-gray-700 text-gray-300 px-4 py-2 rounded-lg hover:border-orange-500 hover:text-orange-500 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="text-sm font-semibold">Filtrar por Vehículo</span>
            </button>
          </div>
        </div>

        {/* Pills de categoría */}
        <div className="flex items-center gap-2 flex-wrap mb-12">
          <button
            onClick={() => setCategoriaActiva('')}
            className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition-all ${
              categoriaActiva === ''
                ? 'bg-orange-500 border-orange-500 text-white'
                : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-orange-500 hover:text-orange-500'
            }`}
          >
            Todos
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoriaActiva(prev => prev === cat ? '' : cat)}
              className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                categoriaActiva === cat
                  ? 'bg-orange-500 border-orange-500 text-white'
                  : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-orange-500 hover:text-orange-500'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="text-center py-32 border border-dashed border-gray-800 rounded-xl">
          <PackageSearch className="w-14 h-14 text-gray-700 mx-auto mb-4" />
          <p className="text-white font-bold text-xl mb-2">
            {categoriaActiva ? `${categoriaActiva} próximamente` : 'Catálogo en construcción'}
          </p>
          <p className="text-gray-500 text-sm">
            Pronto encontrarás aquí todas nuestras refacciones disponibles.
          </p>
        </div>

      </section>

      <Footer />
    </div>
  );
}