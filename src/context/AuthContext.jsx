import React, { createContext, useState, useEffect, useContext } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = () => supabase.auth.signOut();

  const login = async (email, password) => {
    const response = await supabase.auth.signInWithPassword({ email, password });
    if (response.data?.user && !response.error) {
       // Log the sign in
       await supabase.from('api_logs').insert([{
           user_id: response.data.user.id,
           action: 'Sign In',
           ip_address: 'Client Device',
           location: 'Web App',
           status: 'Success'
       }]);
    }
    return response;
  };

  const register = (email, password) => {
    return supabase.auth.signUp({ email, password });
  };

  const value = {
    session,
    user,
    loading,
    signOut,
    login,
    register,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
