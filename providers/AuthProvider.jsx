
"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";


const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);

    // loading=true heißt: "Noch nicht entschieden, ob eingeloggt"
    const [loading, setLoading] = useState(true);

    // Holt den aktuellen User von Laravel (oder null wenn nicht eingeloggt)
    const refreshUser = async () => {
        const res = await apiFetch("/api/user", { method: "GET" });

        if (!res.ok) {
            setUser(null);
            return null;
        }

        const data = (await res.json());
        setUser(data);
        return data;
    };

    // Initialer Check: genau 1x beim App-Start
    useEffect(() => {
        (async () => {
            try {
                await refreshUser();
            } finally {
                setLoading(false); // <-- ab jetzt wissen wir es sicher
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const login = async (email, password) => {
        // 1) CSRF Cookie holen (Sanctum / Fortify)
        await apiFetch("/sanctum/csrf-cookie", { method: "GET" });

        // 2) Login POST
        const res = await apiFetch("/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
            // optional: Fehlermeldung auslesen
            throw new Error("Login fehlgeschlagen");
        }

        // 3) WICHTIG: Context aktualisieren!
        // Ohne diesen Schritt bleibt user ggf. null obwohl Cookie gesetzt wurde.
        await refreshUser();
    };

    const logout = async () => {
        // Optional: Fortify Logout
        await apiFetch("/logout", { method: "POST" });

        // Context sofort leeren
        setUser(null);
    };

    const value = useMemo(
        () => ({ user, loading, refreshUser, login, logout }),
        [user, loading]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth muss innerhalb von <AuthProvider> genutzt werden");
    return ctx;
}
