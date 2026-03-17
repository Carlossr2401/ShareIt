import { createContext, useContext, useState, type ReactNode } from "react";

export type UserRole = "admin" | "user";

interface UserContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  userName: string;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>("user");
  const userName = role === "admin" ? "Admin User" : "Carlos López";
  return (
    <UserContext.Provider value={{ role, setRole, userName }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
