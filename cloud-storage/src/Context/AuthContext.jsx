import React, { createContext, useContext, useEffect, useState } from 'react'
import axios from "axios";
import { BASE_URL } from '../../config';

const AuthContext = createContext();

export const AuthProvider = ({children}) =>{
    const [user ,setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() =>{
        axios.get(`${BASE_URL}/auth/checkSession`,{withCredentials: true})
        
        .then(res =>{
             console.log("🔍 checkSession response:", res.data); 
            if(res.data.loggedIn){
                setUser(res.data.user);
                console.log("✅ User logged in:", res.data.user);
            }else{
                console.log("❌ No active session");
                setUser(null);
            }
        })
        .catch((err) =>{
            setUser(null);
            console.error("⚠️ checkSession failed:", err);
        })
        .finally(() =>setLoading(false));
    },[]);

    return(
        <AuthContext.Provider value={{user,setUser, loading}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
