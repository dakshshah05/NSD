import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { User, Mail, Shield, Calendar, Edit2, Key, Check, Award, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const Profile = () => {
  const { user, role } = useAuth();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.user_metadata?.full_name || 'Admin User');
  const [loading, setLoading] = useState(false);
  const [points, setPoints] = useState(0);

  useEffect(() => {
    const fetchPoints = async () => {
      if (!user?.id) return;
      const { data, error } = await supabase
        .from('user_points')
        .select('points')
        .eq('id', user.id)
        .maybeSingle();
      
      if (data) setPoints(data.points);
    };
    fetchPoints();
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      data: { full_name: displayName }
    });
    
    // Sync the display name to the gamification leaderboard
    if (user?.id) {
       await supabase.from('user_points').update({ display_name: displayName }).eq('id', user.id);
    }
    
    setLoading(false);
    if (error) {
      addNotification('Error', 'Failed to update profile.');
      return;
    }

    setIsEditing(false);
    addNotification('Success', 'Profile updated successfully.');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header Card */}
      <div className="bg-[rgb(var(--bg-card))] rounded-2xl border border-[rgb(var(--border))] overflow-hidden shadow-sm">
        <div className="h-32 bg-gradient-to-r from-emerald-500 to-blue-600"></div>
        <div className="px-6 sm:px-10 pb-8">
          <div className="relative flex justify-between items-end -mt-12 mb-6">
            <div className="w-24 h-24 rounded-full bg-[rgb(var(--bg-main))] p-2 flex-shrink-0">
              <div className="w-full h-full rounded-full bg-gradient-to-tr from-emerald-500 to-blue-500 flex items-center justify-center shadow-inner">
                <span className="text-3xl font-bold text-white">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
            </div>
            
              <button 
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              disabled={loading}
              className="px-4 py-2 rounded-lg text-sm font-medium border border-[rgb(var(--border))] hover:bg-[rgb(var(--bg-input))] transition-colors flex items-center space-x-2 text-[rgb(var(--text-main))] disabled:opacity-50"
            >
              {isEditing ? (
                  <>
                    <Check size={16} className="text-emerald-500" />
                    <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                  </>
              ) : (
                  <>
                    <Edit2 size={16} />
                    <span>Edit Profile</span>
                  </>
              )}
            </button>
          </div>

          <div className="space-y-1">
            {isEditing ? (
                <input 
                    type="text" 
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="text-2xl font-bold bg-[rgb(var(--bg-input))] border border-[rgb(var(--border))] rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-[rgb(var(--text-main))]"
                />
            ) : (
                <h2 className="text-3xl font-bold text-[rgb(var(--text-main))]">{displayName}</h2>
            )}
            <div className="flex items-center text-[rgb(var(--text-muted))] space-x-2">
              <Mail size={16} />
              <span>{user?.email || 'No email associated'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Gamification Card */}
      <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-6 shadow-sm relative overflow-hidden">
         <div className="absolute -right-6 -top-6 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
         
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
             <div>
                 <h3 className="text-xl font-bold text-[rgb(var(--text-main))] flex items-center gap-2 mb-1">
                     <Award className="text-emerald-500" />
                     Campus Eco-Warrior Status
                 </h3>
                 <p className="text-sm text-[rgb(var(--text-muted))]">Earn points by reporting energy wastage on campus!</p>
             </div>
             
             <div className="flex items-center gap-4 bg-[rgb(var(--bg-card))] p-4 rounded-xl border border-[rgb(var(--border))] shadow-inner">
                 <div className="text-center px-4 border-r border-[rgb(var(--border))]">
                     <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wider mb-1 font-semibold">Total Points</p>
                     <p className="text-3xl font-black text-emerald-500">{points.toLocaleString()}</p>
                 </div>
                 <div className="text-center px-4">
                     <p className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wider mb-1 font-semibold">Rank Status</p>
                     <p className="text-lg font-bold text-amber-500 flex items-center gap-1">
                         {points > 500 ? 'Elite Saver' : points > 100 ? 'Active Contributor' : 'Beginner'}
                         <TrendingUp size={16} />
                     </p>
                 </div>
             </div>
         </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Account Info */}
        <div className="bg-[rgb(var(--bg-card))] p-6 rounded-2xl border border-[rgb(var(--border))] shadow-sm space-y-6">
          <h3 className="text-lg font-semibold text-[rgb(var(--text-main))] flex items-center gap-2">
            <User size={20} className="text-emerald-400" />
            Account Information
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-[rgb(var(--border))]/50">
              <span className="text-[rgb(var(--text-muted))]">Role</span>
              <span className={clsx(
                  "flex items-center gap-1 font-medium px-2 py-1 rounded capitalize",
                  role === 'admin' ? "bg-purple-500/10 text-purple-400" :
                  role === 'teacher' ? "bg-blue-500/10 text-blue-400" :
                  "bg-emerald-500/10 text-emerald-400"
              )}>
                <Shield size={14} /> {role || 'Student'}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-[rgb(var(--border))]/50">
              <span className="text-[rgb(var(--text-muted))]">Member Since</span>
              <span className="flex items-center gap-1 text-[rgb(var(--text-main))] font-medium">
                <Calendar size={14} className="text-[rgb(var(--text-muted))]" /> 
                {new Date(user?.created_at || Date.now()).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-[rgb(var(--border))]/50">
                <span className="text-[rgb(var(--text-muted))]">User ID</span>
                <span className="text-[rgb(var(--text-main))] font-mono text-xs text-slate-400">
                    {user?.id?.substring(0, 13)}...
                </span>
            </div>
          </div>
        </div>

        {/* Security Summary (Mocked for dashboard realism) */}
        <div className="bg-[rgb(var(--bg-card))] p-6 rounded-2xl border border-[rgb(var(--border))] shadow-sm space-y-6">
          <h3 className="text-lg font-semibold text-[rgb(var(--text-main))] flex items-center gap-2">
            <Key size={20} className="text-blue-400" />
            Security Overview
          </h3>
          
          <div className="space-y-4">
              <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 shrink-0">
                      <Check className="text-emerald-500" size={20} />
                  </div>
                  <div>
                      <p className="text-sm text-[rgb(var(--text-muted))]">Encrypted by Supabase Auth</p>
                  </div>
              </div>

              <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 shrink-0">
                      <Check className="text-emerald-500" size={20} />
                  </div>
                  <div>
                      <h4 className="text-[rgb(var(--text-main))] font-medium">Authentication</h4>
                      <p className="text-sm text-[rgb(var(--text-muted))]">Account is verified and secure</p>
                  </div>
              </div>

              <button 
                  onClick={() => navigate('/settings')}
                  className="w-full mt-4 py-2 rounded-lg text-sm font-medium border border-[rgb(var(--border))] hover:bg-[rgb(var(--bg-input))] transition-colors text-[rgb(var(--text-main))]"
              >
                  Manage Security Settings
              </button>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default Profile;
