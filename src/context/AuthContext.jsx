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
    // 1. HARDCODED OVERRIDES (Highest Priority)
    if (email === 'dakshshah215@gmail.com') {
      setUserRole('admin');
      return;
    }
    
    try {
      // 2. Check if profile already exists in user_points
      const { data: profile } = await supabase
        .from('user_points')
        .select('role')
        .eq('id', userId)
        .maybeSingle();
      
      if (profile?.role) {
        setUserRole(profile.role);
        return;
      }

      // 3. User is new or has no profile. Check if Admin PRE-AUTHORIZED this email in 'user_roles'
      const { data: authorized } = await supabase
        .from('user_roles')
        .select('role')
        .eq('email', email.toLowerCase())
        .maybeSingle();

      const finalRole = authorized?.role || 'student';

      // 4. Create the profile with the determined role
      await supabase.from('user_points').insert([{
         id: userId,
         points: 0,
         role: finalRole,
         display_name: email.split('@')[0]
      }]);
      
      setUserRole(finalRole);
      console.log(`Synced authorized role for ${email}: ${finalRole}`);

    } catch (err) {
      console.error("Error syncing role:", err);
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
