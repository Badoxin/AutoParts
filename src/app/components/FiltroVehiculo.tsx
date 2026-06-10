import { useState } from 'react';
import { X, Search, ChevronDown } from 'lucide-react';
import { categories } from '../data/products';

interface FiltroVehiculoProps {
  isOpen: boolean;
  onClose: () => void;
}

const marcasAuto = ['Toyota', 'Nissan', 'Chevrolet', 'Ford', 'Honda', 'Volkswagen', 'Dodge', 'Kia', 'Hyundai', 'Mazda'];
const anios = Array.from({ length: 25 }, (_, i) => String(2024 - i));

export function FiltroVehiculo({ isOpen, onClose }: FiltroVehiculoProps) {
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [anio, setAnio] = useState('');
  const [categoria, setCategoria] = useState('');

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/70 z-40 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-lg shadow-2xl">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-orange-500" />
              <h2 className="text-white font-black uppercase tracking-wider text-lg">
                Buscar por Vehículo
              </h2>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-gray-500 text-sm text-center px-6 pt-4 pb-2">
            Selecciona tu vehículo para ver las refacciones compatibles
          </p>

          <div className="px-6 py-4 space-y-4">

            {/* Marca + Año */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1.5 block">
                  Marca <span className="text-orange-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={marca}
                    onChange={e => setMarca(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-orange-500 transition-colors appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Ej. Toyota...</option>
                    {marcasAuto.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1.5 block">
                  Año <span className="text-orange-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={anio}
                    onChange={e => setAnio(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-orange-500 transition-colors appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Ej. 2020</option>
                    {anios.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Modelo */}
            <div>
              <label className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1.5 block">
                Modelo <span className="text-gray-600 font-normal normal-case">(opcional)</span>
              </label>
              <input
                type="text"
                placeholder="Ej. Altima, Ranger, Corolla..."
                value={modelo}
                onChange={e => setModelo(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-orange-500 transition-colors placeholder:text-gray-600"
              />
            </div>

            {/* Categoría */}
            <div>
              <label className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2 block">
                ¿Qué tipo de refacción buscas?{' '}
                <span className="text-gray-600 font-normal normal-case">(opcional)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategoria(prev => prev === cat ? '' : cat)}
                    className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                      categoria === cat
                        ? 'bg-orange-500 border-orange-500 text-white'
                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-orange-500 hover:text-orange-500'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6">
            <button
              disabled
              className="w-full bg-gray-700 cursor-not-allowed text-gray-500 py-3.5 rounded-lg font-black uppercase tracking-widest flex items-center justify-center gap-2 text-sm"
            >
              <Search className="w-4 h-4" />
              Próximamente
            </button>
            <p className="text-gray-600 text-xs text-center mt-2">
              Esta función estará disponible próximamente
            </p>
          </div>

        </div>
      </div>
    </>
  );
}