import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export function Registro() {
  const [formData, setFormData] = useState({ nombre: '', correo: '', contrasena: '' });
  const navigate = useNavigate();

  const handleRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/api/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      alert(data.mensaje);
      if (response.ok) navigate('/login');
    } catch (error) {
      console.error("Error al registrar:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-grow flex items-center justify-center p-6">
        <form onSubmit={handleRegistro} className="bg-card p-8 rounded-xl border border-border w-full max-w-md">
          <h2 className="text-foreground text-2xl font-black mb-6 uppercase">Registro</h2>
          <input className="w-full bg-muted p-3 mb-4 text-foreground rounded" placeholder="Nombre" onChange={(e) => setFormData({...formData, nombre: e.target.value})} required />
          <input className="w-full bg-muted p-3 mb-4 text-foreground rounded" placeholder="Correo" type="email" onChange={(e) => setFormData({...formData, correo: e.target.value})} required />
          <input className="w-full bg-muted p-3 mb-6 text-foreground rounded" placeholder="Contraseña" type="password" onChange={(e) => setFormData({...formData, contrasena: e.target.value})} required />
          <button className="w-full bg-primary p-3 text-foreground font-bold rounded hover:opacity-90" type="submit">Registrarse</button>
        </form>
      </div>
      <Footer />
    </div>
  );
}