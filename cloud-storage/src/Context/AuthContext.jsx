import React, { createContext, useContext, useEffect, useState } from 'react'
import axios from "axios";
import { BASE_URL } from '../../config';

const AuthContext = createContext();

export const AuthProvider = ({children}) =>{
    const [user ,setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const refreshUser = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${BASE_URL}/auth/checkSession`, { withCredentials: true });
            console.log("🔍 checkSession response:", res.data);
            if (res.data.loggedIn) {
                setUser(res.data.user);
                console.log("✅ User logged in:", res.data.user);
                return res.data.user;
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
    }, []);

    return(
        <AuthContext.Provider value={{user,setUser, loading, refreshUser}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
