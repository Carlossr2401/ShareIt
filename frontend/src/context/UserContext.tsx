import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type UserRole = "admin" | "user";

interface UserContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  userName: string;
  avatarUrl?: string;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>("user");
  const [userName, setUserName] = useState<string>("Cargando...");
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const res = await fetch(`${API_URL}/auth/me`, {
        credentials: "include", // Enviar cookie access_token httpOnly
      });
      if (res.ok) {
        const data = await res.json();
        const userData = data.user;
        
        // Obtener datos del user_metadata de Supabase Auth
        const metadata = userData?.user_metadata || {};
        const name = metadata.name || metadata.username || userData?.email?.split('@')[0] || "Usuario";
        setUserName(name);
        
        if (metadata.avatar_url) {
          setAvatarUrl(metadata.avatar_url);
        }

        if (userData?.app_metadata?.role === "admin") {
          setRole("admin");
        }
      } else {
        setUserName("Invitado");
      }
    } catch (e) {
      console.error(e);
      setUserName("Invitado");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ role, setRole, userName, avatarUrl, loading, refreshUser: fetchUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
