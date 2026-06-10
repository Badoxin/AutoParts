import { Navbar } from '../components/Navbar';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { Tag, PackageSearch } from 'lucide-react';

export function Ofertas() {
  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumbs items={[{ label: 'Ofertas' }]} />
        </div>
      </div>

      {/* Banner */}
      <div className="bg-orange-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center gap-4">
          <Tag className="w-10 h-10 text-white" />
          <div>
            <h1 className="text-3xl font-bold text-white">Ofertas Especiales</h1>
            <p className="text-orange-100"> %</p>
          </div>
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center py-32 border border-dashed border-gray-800 rounded-xl">
          <PackageSearch className="w-14 h-14 text-gray-700 mx-auto mb-4" />
          <p className="text-white font-bold text-xl mb-2">Ofertas próximamente</p>
          <p className="text-gray-500 text-sm">
            Estamos preparando descuentos exclusivos para ti. ¡Vuelve pronto!
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}