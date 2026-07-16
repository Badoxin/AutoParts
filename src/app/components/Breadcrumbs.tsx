import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center space-x-2 text-sm">
      <Link
        to="/"
        className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors duration-200"
      >
        <Home className="w-4 h-4" />
        <span>Inicio</span>
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={index} className="flex items-center space-x-2">
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            {isLast ? (
              <span className="text-muted-foreground hover:text-primary transition-colors duration-200 cursor-default">
                {item.label}
              </span>
            ) : (
              <Link
                to={item.href ?? '#'}
                className="text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                {item.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}