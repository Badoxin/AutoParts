import { Navigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Footer } from '../components/Footer';
import { MapPin, Smartphone, Clock, Facebook, ExternalLink } from 'lucide-react';
import { siteInfo } from '../config/siteInfo';
import { useAuth } from '../context/AuthContext';

export function Contacto() {
  const { user } = useAuth();

  // El equipo interno no necesita esta página: el admin ve los mensajes
  // directo en su panel.
  if (user?.rol === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(siteInfo.direccion)}`;
  const telHref = `tel:${siteInfo.telefono.replace(/\D/g, '')}`;

  const info = [
    {
      icon: MapPin,
      label: 'Dirección',
      value: siteInfo.direccion,
      href: mapsUrl,
      externo: true,
    },
    {
      icon: Smartphone,
      label: 'Teléfono',
      value: siteInfo.telefono,
      href: telHref,
      externo: false,
    },
    {
      icon: Clock,
      label: 'Horario',
      value: `${siteInfo.horarioEntreSemana} ${siteInfo.horarioDomingo}`,
    },
    {
      icon: Facebook,
      label: 'Facebook',
      value: 'Estética Dayandi',
      href: siteInfo.facebookUrl,
      externo: true,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumbs items={[{ label: 'Contacto' }]} />
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <p className="eyebrow text-muted-foreground mb-3">Dayandi · Estética Unisex</p>
          <h1 className="text-5xl text-foreground mb-3">Contacto</h1>
          <p className="text-muted-foreground">Visítanos, con gusto te atendemos</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          {/* Tarjeta única: info de contacto + mapa como "ventana" de la misma tarjeta */}
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="divide-y divide-border">
              {info.map(({ icon: Icon, label, value, href, externo }) => {
                const fila = (
                  <div className="flex items-start gap-4 px-6 py-5">
                    <div className="w-11 h-11 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                      <Icon className="w-[18px] h-[18px] text-primary" />
                    </div>
                    <div className="min-w-0 leading-relaxed">
                      <p className="text-muted-foreground text-xs uppercase tracking-widest mb-1">{label}</p>
                      <p className="text-foreground font-medium break-words">{value}</p>
                    </div>
                    {href && (
                      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground/50 ml-auto mt-1.5 shrink-0" />
                    )}
                  </div>
                );
                return href ? (
                  <a
                    key={label}
                    href={href}
                    target={externo ? '_blank' : undefined}
                    rel={externo ? 'noopener noreferrer' : undefined}
                    className="block hover:bg-muted/40 transition-colors"
                  >
                    {fila}
                  </a>
                ) : (
                  <div key={label}>{fila}</div>
                );
              })}
            </div>

            {/* El mapa como ventana de la tarjeta: mismo marco, sin cortes visuales */}
            <div className="border-t border-border">
              <div className="px-6 py-3 flex items-center gap-2 bg-muted/30">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                <p className="text-muted-foreground text-xs uppercase tracking-widest">Así nos encuentras</p>
              </div>
              <div className="h-64">
                <iframe
                  title={`Ubicación ${siteInfo.nombre}`}
                  src={siteInfo.mapEmbedSrc}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>

          {/* Foto de la fachada */}
          <div className="relative w-full h-full min-h-[420px] lg:min-h-[560px] rounded-xl overflow-hidden border border-border">
            <img
              src="/gallery/local-exterior.jpg"
              alt={`Fachada de ${siteInfo.nombre}`}
              className="w-full h-full object-cover"
              style={{
                objectPosition: '68% 45%',
                filter: 'brightness(1.05) saturate(1.1) contrast(1.03)',
              }}
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent px-6 py-5">
              <p className="text-white/90 text-sm tracking-wide">Nuestra fachada en San Luis Río Colorado</p>
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
}
