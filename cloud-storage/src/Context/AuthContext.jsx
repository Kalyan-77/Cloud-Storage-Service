import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../Services/authService';
import { subscribeTo401 } from '../Services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const refreshUser = async () => {
        setLoading(true);
        try {
            const data = await authService.checkSession();
            console.log("🔍 checkSession response:", data);
            if (data.loggedIn) {
                setUser(data.user);
                console.log("✅ User logged in:", data.user);
                return data.user;
            } else {
                setUser(null);
                console.log("❌ No active session");
                return null;
            }
        } catch (err) {
            setUser(null);
            console.error("⚠️ checkSession failed:", err);
            return null;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Run initial session check on mount
        refreshUser();

        // Auto clean user session in frontend state on unauthorized backend responses
        const unsubscribe = subscribeTo401(() => {
            setUser(null);
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, loading, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
