import { Link } from 'react-router-dom';
import { FrenosIcon, MotorIcon, SuspensionIcon, BateriasIcon, LlantasIcon } from './CategoryIcons';
import { LucideIcon } from 'lucide-react';

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  frenos:     FrenosIcon,
  motor:      MotorIcon,
  suspension: SuspensionIcon,
  baterias:   BateriasIcon,
  llantas:    LlantasIcon,
};

const slugToCategoria: Record<string, string> = {
  frenos:     'Frenos',
  motor:      'Motor',
  suspension: 'Suspensión',
  baterias:   'Baterías',
  llantas:    'Llantas',
};

interface CategoryCardProps {
  title: string;
  icon?: LucideIcon;
  slug: string;
}

export function CategoryCard({ title, slug }: CategoryCardProps) {
  const Icon = iconMap[slug];
  const categoria = slugToCategoria[slug] ?? title;

  return (
    <Link to={`/catalogo?categoria=${encodeURIComponent(categoria)}`} className="block group">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-orange-500 transition-all duration-300 cursor-pointer">
        <div className="flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mb-4 transition-all duration-300 bg-gray-800 group-hover:bg-orange-500">
            {Icon && (
              <Icon className="w-14 h-14 text-orange-500 group-hover:text-white transition-colors duration-300" />
            )}
          </div>
          <h3 className="text-white font-semibold group-hover:text-orange-500 transition-colors duration-300">
            {title}
          </h3>
        </div>
      </div>
    </Link>
  );
}