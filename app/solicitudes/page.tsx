"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  nombre: string;
  role: "admin" | "usuario";
}

export default function SolicitudesPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    // 1. Si no hay sesión, redirige inmediatamente y detiene el código
    if (!token || !storedUser) {
      router.replace("/login");
      return;
    }

    try {
      // 2. Intenta parsear los datos del usuario
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setLoading(false); // Apaga el loading si todo sale bien
    } catch (error) {
      // 3. Si el JSON está corrupto, limpia, apaga loading y redirige
      localStorage.clear();
      setLoading(false); // Evita que la pantalla se quede congelada en "Verificando..."
      router.replace("/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.replace("/login");
  };

  // Pantalla de carga mientras se verifica el localStorage
  if (loading) {
    return <p style={{ padding: "2rem" }}>Verificando sesión...</p>;
  }

  // Si no hay usuario válido, no renderiza nada mientras redirige
  if (!user) return null;

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Gestión de Solicitudes</h1>
      <p>Bienvenido, {user.nombre}</p>
      <p>Rol: {user.role}</p>
      
      <button 
        onClick={handleLogout} 
        style={{ marginTop: "10px", padding: "6px 12px", cursor: "pointer" }}
      >
        Cerrar sesión
      </button>
      
      <hr />
      
      <h3>Acciones disponibles:</h3>
      <ul>
        <li>Crear solicitud</li>
        
        {/* Vista exclusiva para Administradores */}
        {user.role === "admin" && (
          <>
            <li>Eliminar cualquier solicitud</li>
            <li>Ver todas las solicitudes del sistema</li>
          </>
        )}
        
        {/* Vista exclusiva para Usuarios */}
        {user.role === "usuario" && (
          <li>Ver solo mis solicitudes</li>
        )}
      </ul>
    </main>
  );
}
