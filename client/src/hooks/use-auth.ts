import { useState, useCallback, useEffect } from "react";

export interface AuthState {
  isLoggedIn: boolean;
  doctorName: string;
  doctorSpecialty: string;
  usageCount: number;
  usageLimit: number;
  plan: "free" | "gold" | "diamond";
  onboardingDone: boolean;
}

const DEFAULT_STATE: AuthState = {
  isLoggedIn: false,
  doctorName: "",
  doctorSpecialty: "",
  usageCount: 0,
  usageLimit: 5,
  plan: "free",
  onboardingDone: false,
};

function loadAuth(): AuthState {
  try {
    const raw = localStorage.getItem("deltascan_auth");
    if (raw) return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_STATE;
}

function saveAuth(state: AuthState) {
  localStorage.setItem("deltascan_auth", JSON.stringify(state));
}

let _listeners: Array<() => void> = [];
let _state: AuthState = loadAuth();

function notifyAll() {
  _listeners.forEach((fn) => fn());
}

export function useAuth() {
  const [, rerender] = useState(0);

  // FIX: useEffect instead of useState for subscription (prevents memory leak)
  useEffect(() => {
    const fn = () => rerender((n) => n + 1);
    _listeners.push(fn);
    return () => {
      _listeners = _listeners.filter((l) => l !== fn);
    };
  }, []);

  const login = useCallback((name: string) => {
    _state = { ..._state, isLoggedIn: true, doctorName: name };
    saveAuth(_state);
    notifyAll();
  }, []);

  const completeOnboarding = useCallback((specialty: string, plan: "free" | "gold" | "diamond" = "free") => {
    const limit = plan === "diamond" ? 999 : plan === "gold" ? 100 : 5;
    _state = { ..._state, doctorSpecialty: specialty, plan, usageLimit: limit, onboardingDone: true };
    saveAuth(_state);
    notifyAll();
  }, []);

  const incrementUsage = useCallback(() => {
    _state = { ..._state, usageCount: _state.usageCount + 1 };
    saveAuth(_state);
    notifyAll();
  }, []);

  const logout = useCallback(() => {
    _state = DEFAULT_STATE;
    localStorage.removeItem("deltascan_auth");
    notifyAll();
  }, []);

  const upgradePlan = useCallback((plan: "gold" | "diamond") => {
    const limit = plan === "diamond" ? 999 : 100;
    _state = { ..._state, plan, usageLimit: limit };
    saveAuth(_state);
    notifyAll();
  }, []);

  return {
    auth: _state,
    login,
    completeOnboarding,
    incrementUsage,
    logout,
    upgradePlan,
  };
}
