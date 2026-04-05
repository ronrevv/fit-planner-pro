import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import type { Gym, Trainer } from "@shared/schema";

interface AppContextType {
  activeGym: Gym | null;
  setActiveGym: (gym: Gym | null) => void;
  activeTrainer: Trainer | null;
  setActiveTrainer: (trainer: Trainer | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppContextProvider({ children }: { children: ReactNode }) {
  const [activeGym, setActiveGym] = useState<Gym | null>(() => {
    const saved = localStorage.getItem("activeGym");
    try {
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [activeTrainer, setActiveTrainer] = useState<Trainer | null>(() => {
    const saved = localStorage.getItem("activeTrainer");
    try {
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    if (activeGym) localStorage.setItem("activeGym", JSON.stringify(activeGym));
    else localStorage.removeItem("activeGym");
  }, [activeGym]);

  useEffect(() => {
    if (activeTrainer) localStorage.setItem("activeTrainer", JSON.stringify(activeTrainer));
    else localStorage.removeItem("activeTrainer");
  }, [activeTrainer]);

  return (
    <AppContext.Provider value={{ activeGym, setActiveGym, activeTrainer, setActiveTrainer }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppContextProvider");
  return context;
}
