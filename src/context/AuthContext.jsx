import React, { createContext, useState, useEffect, useContext } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState('student'); // Default to student
  const [loading, setLoading] = useState(true);

  // Helper to fetch role from DB
  const fetchUserRole = async (userId, email) => {
    // HARDCODED OVERRIDES FOR ROLES
    if (email === 'daksh.kumar@bcah.christuniversity.in') {
      setUserRole('admin');
      return;
    }
    
    // Add additional overrides here if needed
    // if (email === 'student@example.com') { setUserRole('student'); return; }
    // if (email === 'teacher@example.com') { setUserRole('teacher'); return; }

    try {
      const { data, error } = await supabase
        .from('user_points')
        .select('role')
        .eq('id', userId)
        .maybeSingle();
      
      if (data?.role) {
        setUserRole(data.role);
      } else {
        // If row doesn't exist, create it with default student role
        setUserRole('student');
        console.log("No role found, defaulting to student");
      }
    } catch (err) {
      console.error("Error fetching role:", err);
      setUserRole('student');
    }
  };

  useEffect(() => {
    // Get active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchUserRole(session.user.id, session.user.email);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id, session.user.email);
      } else {
        setUserRole('student');
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = () => supabase.auth.signOut();

  const login = async (email, password) => {
    const response = await supabase.auth.signInWithPassword({ email, password });
    if (response.data?.user && !response.error) {
       await fetchUserRole(response.data.user.id, response.data.user.email);
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
    role: userRole,
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
