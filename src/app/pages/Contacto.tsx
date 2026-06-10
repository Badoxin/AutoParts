import { Navbar } from '../components/Navbar';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export function Contacto() {
  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumbs items={[{ label: 'Contacto' }]} />
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-3">Contacto</h1>
          <p className="text-gray-400">Visítanos o escríbenos, con gusto te ayudamos a encontrar tu pieza</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Formulario */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Envíanos un mensaje</h2>
            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Nombre</label>
                <input
                  type="text"
                  placeholder="Tu nombre completo"
                  className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Correo electrónico</label>
                <input
                  type="email"
                  placeholder="tu@correo.com"
                  className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Teléfono</label>
                <input
                  type="tel"
                  placeholder="+52 000 000 0000"
                  className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Mensaje</label>
                <textarea
                  rows={4}
                  placeholder="¿En qué podemos ayudarte?"
                  className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-orange-500 transition-colors resize-none"
                />
              </div>
              <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold transition-colors">
                Enviar mensaje
              </button>
            </div>
          </div>

          {/* Info de contacto */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Información de contacto</h2>

            {[
              {
                icon: MapPin,
                label: 'Dirección',
                value: 'Av. Libertad 2501, Col. Jalisco, San Luis Río Colorado, Sonora'
              },
              {
                icon: Phone,
                label: 'Teléfono',
                value: '653 517 0902'
              },
              {
                icon: Mail,
                label: 'Sitio web',
                value: 'www.Autoparts.com'
              },
              {
                icon: Clock,
                label: 'Horario',
                value: 'Lun–Sáb: 8:00am–7:00pm · Dom: 8:30am–4:00pm'
              },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-4">
                <div className="w-12 h-12 bg-orange-500/10 border border-orange-500/20 rounded-lg flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">{label}</p>
                  <p className="text-white font-medium">{value}</p>
                </div>
              </div>
            ))}

          </div>
        </div>

        {/* Sucursales */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Nuestras Sucursales</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Sucursal Libertad',
                address: 'Av. Libertad 2501, Col. Jalisco',
                phone: '653 517 0902',
              },
              {
                name: 'Sucursal 10 de Abril',
                address: 'Av. Libertad s/n, Col. 10 de Abril',
                phone: '653 517 0902',
              },
              {
                name: 'Sucursal Nuevo León',
                address: 'Av. Nuevo León 3401, Col. Altar',
                phone: '653 517 0902',
              },
            ].map((suc) => (
              <div
                key={suc.name}
                className="bg-gray-900 border border-gray-800 rounded-lg p-5 hover:border-orange-500 transition-colors"
              >
                <h3 className="text-white font-bold mb-3">{suc.name}</h3>
                <div className="flex items-start gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                  <p className="text-gray-400 text-sm">{suc.address}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-orange-500 shrink-0" />
                  <p className="text-gray-400 text-sm">{suc.phone}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </section>

      <Footer />
    </div>
  );
}