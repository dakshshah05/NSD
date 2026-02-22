import React, { createContext, useState, useEffect, useContext } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState('student'); // Default to student
  const [loading, setLoading] = useState(true);

  // Helper to fetch role from DB
  const fetchUserRole = async (currentUser) => {
    if (!currentUser) return;
    
    const userId = currentUser.id;
    const email = currentUser.email;

    // 1. HARDCODED OVERRIDES (Highest Priority)
    if (email === 'dakshshah215@gmail.com') {
      setUserRole('admin');
      return;
    }
    
    try {
      // 2. Lookup pre-authorization FIRST (Whitelist)
      const { data: authorized } = await supabase
        .from('user_roles')
        .select('role')
        .eq('email', email.toLowerCase())
        .maybeSingle();

      // 3. Lookup existing profile
      const { data: profile } = await supabase
        .from('user_points')
        .select('role')
        .eq('id', userId)
        .maybeSingle();
      
      // 4. Lookup User Metadata (From Registration)
      const metaRole = currentUser?.user_metadata?.role;

      // Determine the best role based on priority
      let finalRole = 'student';
      if (authorized) {
        finalRole = authorized.role;
      } else if (metaRole) {
        finalRole = metaRole;
      } else if (profile) {
        finalRole = profile.role;
      }

      console.log(`Role detection for ${email}: Authorized=${authorized?.role}, Meta=${metaRole}, Profile=${profile?.role} -> Final=${finalRole}`);

      if (!profile && userId) {
        // 4a. Create profile if missing
        const initialRole = finalRole;
        const displayName = email.split('@')[0].split('.')[0].charAt(0).toUpperCase() + email.split('@')[0].split('.')[0].slice(1);
        
        const { error: insertError } = await supabase.from('user_points').insert([{
           id: userId,
           points: 0,
           role: initialRole,
           display_name: displayName
        }]);

        if (insertError) {
          console.error("Error creating user profile:", insertError);
        } else {
          console.log(`Created profile for ${email} with role: ${initialRole}`);
        }
      } else if (profile && ( (authorized && profile.role !== authorized.role) || (metaRole && profile.role !== metaRole) )) {
        // 4b. UPDATE profile if authorization or metadata exists and differs from current role
        const roleToUpdate = authorized ? authorized.role : metaRole;
        
        await supabase.from('user_points')
          .update({ role: roleToUpdate })
          .eq('id', userId);
        console.log(`Updated role for ${email} to: ${roleToUpdate}`);
        finalRole = roleToUpdate;
      }

      setUserRole(finalRole);

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
      if (session?.user) fetchUserRole(session.user);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user);
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
       await fetchUserRole(response.data.user);
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

  const register = (email, password, role = 'student') => {
    return supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: { role }
      }
    });
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
