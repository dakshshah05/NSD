import React, { useState, useEffect } from 'react';
import { Bell, Shield, User, Smartphone, Save, X, AlertTriangle, Trash2, Key, Activity, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { useNotifications } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

const SettingSection = ({ title, icon: Icon, children, className = "" }) => (
  <div className={`bg-[rgb(var(--bg-card))] border border-[rgb(var(--border))] rounded-xl p-6 mb-6 ${className}`}>
    <div className="flex items-center space-x-3 mb-6">
      <div className="p-2 bg-[rgb(var(--bg-input))] rounded-lg">
        <Icon className="text-emerald-400" size={20} />
      </div>
      <h3 className="text-lg font-bold text-[rgb(var(--text-main))]">{title}</h3>
    </div>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

const ToggleRow = ({ label, desc, enabled, onToggle }) => {
   return (
      <div className="flex items-center justify-between py-2">
         <div>
            <p className="text-sm font-medium text-[rgb(var(--text-sec))]">{label}</p>
            <p className="text-xs text-[rgb(var(--text-muted))]">{desc}</p>
         </div>
         <button
            onClick={() => onToggle(!enabled)}
            className={clsx(
               "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
               enabled ? "bg-emerald-500" : "bg-slate-700"
            )}
         >
            <span className={clsx(
               "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
               enabled ? "translate-x-6" : "translate-x-1"
            )} />
         </button>
      </div>
   )
}

const Settings = () => {
  const { addNotification } = useNotifications();
  const { isDarkMode, toggleTheme } = useTheme();
  const { settings, updateSetting } = useSettings();
  const { user, signOut, role } = useAuth();

  // User Management State
  const [authorizedUsers, setAuthorizedUsers] = useState([]);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('student');
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Modal States
  const [showLogs, setShowLogs] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  
  // Loading states for actions
  const [isDeleting, setIsDeleting] = useState(false);

  // DB Data States
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  useEffect(() => {
     if (showLogs && user) {
         const fetchLogs = async () => {
             setLoadingLogs(true);
             const { data, error } = await supabase
                .from('api_logs')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(10);
            
             if (!error && data) {
                 setLogs(data);
             }
             setLoadingLogs(false);
         };
         fetchLogs();
     }
  }, [showLogs, user]);

  useEffect(() => {
    if (role === 'admin') {
      fetchAuthorizedUsers();
    }
  }, [role]);

  const fetchAuthorizedUsers = async () => {
    setLoadingUsers(true);
    const { data } = await supabase
      .from('user_roles')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setAuthorizedUsers(data);
    setLoadingUsers(false);
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newEmail || !newPassword) return;
    setIsAddingUser(true);
    
    try {
      // Direct User Creation via Edge Function
      const { data, error } = await supabase.functions.invoke('admin-create-user', {
        body: { email: newEmail.toLowerCase(), password: newPassword, role: newRole }
      });

      if (error) throw error;

      addNotification('Success', `${newEmail} created successfully as ${newRole}.`);
      setNewEmail('');
      setNewPassword('');
      fetchAuthorizedUsers();
    } catch (err) {
      console.error("Create User Error:", err);
      addNotification('Error', err.message || 'Failed to create user. Ensure Edge Function is deployed.');
    } finally {
      setIsAddingUser(false);
    }
  };

  const handleRemoveUser = async (email) => {
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('email', email);

    if (error) {
      addNotification('Error', 'Failed to remove user authorization.');
    } else {
      addNotification('Removed', `Access revoked for ${email}.`);
      fetchAuthorizedUsers();
    }
  };

  const handleSave = () => {
      addNotification('Success', 'System configuration saved successfully.');
  };

  const handleDeleteAccount = async () => {
      setIsDeleting(true);
      try {
          // Calls a secure Supabase RPC function to delete the user from auth.users
          const { error } = await supabase.rpc('delete_own_user');
          if (error) throw error;
          
          await signOut();
          addNotification("Success", "Account permanently deleted.");
      } catch (e) {
          console.error(e);
          addNotification("Error", "Could not delete account. Make sure RPC is created.");
      } finally {
          setIsDeleting(false);
      }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in relative pb-12">
      <h2 className="text-2xl font-bold text-[rgb(var(--text-main))] mb-6">System Configuration</h2>
      
      {/* Admin Only: User Management */}
      {role === 'admin' && (
        <SettingSection title="User Access Management" icon={User}>
          <p className="text-sm text-[rgb(var(--text-muted))] mb-6">
            Create new user accounts directly. They can log in immediately with the password you set.
          </p>
          
          <form onSubmit={handleAddUser} className="flex flex-col gap-3 mb-8">
            <div className="flex flex-col sm:flex-row gap-3">
              <input 
                type="email" 
                placeholder="User Email" 
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="flex-[2] bg-[rgb(var(--bg-input))] border border-[rgb(var(--border))] rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                required
              />
              <input 
                type="password" 
                placeholder="Set Password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="flex-1 bg-[rgb(var(--bg-input))] border border-[rgb(var(--border))] rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                required
              />
              <select 
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="bg-[rgb(var(--bg-input))] border border-[rgb(var(--border))] rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
            <button 
              type="submit"
              disabled={isAddingUser}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-lg text-sm font-bold transition-all disabled:opacity-50 shadow-lg shadow-emerald-900/20"
            >
              {isAddingUser ? 'Creating Account...' : 'Create Account Now'}
            </button>
          </form>


          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[rgb(var(--text-muted))] uppercase tracking-wider">Authorized Access List</h4>
            {loadingUsers ? (
              <div className="text-center py-4 text-slate-500 animate-pulse text-sm">Loading user list...</div>
            ) : authorizedUsers.length === 0 ? (
              <div className="text-center py-4 text-slate-500 italic text-sm border border-dashed border-[rgb(var(--border))] rounded-lg">No special authorizations found.</div>
            ) : (
              <div className="grid gap-2">
                {authorizedUsers.map(u => (
                  <div key={u.email} className="flex items-center justify-between p-3 bg-[rgb(var(--bg-input))] rounded-lg border border-[rgb(var(--border))] group">
                    <div className="flex items-center gap-3">
                      <div className={clsx(
                        "w-2 h-2 rounded-full",
                        u.role === 'admin' ? "bg-purple-500" : u.role === 'teacher' ? "bg-blue-500" : "bg-emerald-500"
                      )} />
                      <span className="text-sm font-medium text-white">{u.email}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-bold uppercase tracking-tighter ring-1 ring-slate-700">
                        {u.role}
                      </span>
                    </div>
                    <button 
                      onClick={() => handleRemoveUser(u.email)}
                      className="text-slate-500 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-all"
                      title="Revoke Access"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </SettingSection>
      )}

      <SettingSection title="Notifications" icon={Bell}>
         <ToggleRow 
            label="Push Notifications" 
            desc="Receive alerts on mobile app & desktop" 
            enabled={settings.pushNotifications} 
            onToggle={(val) => updateSetting('pushNotifications', val)}
         />
         <ToggleRow 
            label="Email Reports" 
            desc={`Weekly energy summary to ${user?.email || 'your email'}`} 
            enabled={settings.emailReports} 
             onToggle={(val) => updateSetting('emailReports', val)}
         />
         <ToggleRow 
            label="Critical Alerts" 
            desc="Immediate alert for power surges" 
            enabled={settings.criticalAlerts} 
            onToggle={(val) => updateSetting('criticalAlerts', val)}
         />
      </SettingSection>

      <SettingSection title="System Preferences" icon={Smartphone}>
         <ToggleRow 
            label="Dark Mode" 
            desc="System-wide dark interface" 
            enabled={isDarkMode} 
            onToggle={toggleTheme}
         />
         <ToggleRow 
            label="Auto-Refresh" 
            desc="Live data updates every 30s" 
            enabled={settings.autoRefresh} 
            onToggle={(val) => updateSetting('autoRefresh', val)}
         />
      </SettingSection>

      <SettingSection title="Account & Security" icon={Shield}>
         <div className="flex items-center justify-between py-2 border-b border-[rgb(var(--border))]/50">
            <div>
               <p className="text-sm font-medium text-[rgb(var(--text-sec))]">API Access Logs</p>
               <p className="text-xs text-[rgb(var(--text-muted))]">Monitor recent authentications</p>
            </div>
            <button 
                onClick={() => setShowLogs(true)}
                className="text-sm text-blue-400 hover:text-blue-300 font-medium"
            >
                View Logs
            </button>
         </div>
      </SettingSection>

      <SettingSection title="Danger Zone" icon={AlertTriangle} className="border-red-900/50 bg-red-950/10">
         <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 gap-4">
            <div>
               <p className="text-sm font-bold text-red-500">Delete Account</p>
               <p className="text-xs text-red-400/80">Permanently remove your account and all associated data.</p>
            </div>
            <button 
                onClick={() => setShowDelete(true)}
                className="text-sm bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white px-4 py-2 rounded border border-red-500/50 transition-colors font-medium whitespace-nowrap"
            >
                Delete Account
            </button>
         </div>
      </SettingSection>

      <div className="flex justify-end sticky bottom-6 z-10">
         <button onClick={handleSave} className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5">
            <Save size={18} />
            <span>Save Preferences</span>
         </button>
      </div>

      {/* API Logs Modal Dialog */}
      {showLogs && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
           <div className="bg-[rgb(var(--bg-card))] border border-[rgb(var(--border))] rounded-2xl p-6 w-full max-w-2xl shadow-2xl animate-scale-up">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-xl font-bold text-[rgb(var(--text-main))] flex items-center gap-2">
                     <Activity size={24} className="text-blue-400" />
                     Access History
                 </h3>
                 <button onClick={() => setShowLogs(false)} className="text-[rgb(var(--text-muted))] hover:text-white">
                     <X size={20} />
                 </button>
              </div>
              <p className="text-sm text-[rgb(var(--text-muted))] mb-6">
                  Recent sign-in attempts and API usage from your account.
              </p>
              
              <div className="overflow-x-auto border border-[rgb(var(--border))] rounded-xl">
                 <table className="w-full text-sm text-left">
                     <thead className="bg-[rgb(var(--bg-input))] text-[rgb(var(--text-sec))]">
                         <tr>
                             <th className="px-4 py-3 font-medium">Date & Time</th>
                             <th className="px-4 py-3 font-medium">IP Address</th>
                             <th className="px-4 py-3 font-medium">Location</th>
                             <th className="px-4 py-3 font-medium">Status</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-[rgb(var(--border))]">
                         {loadingLogs ? (
                             <tr><td colSpan="4" className="px-4 py-8 text-center text-slate-400">Loading logs from database...</td></tr>
                         ) : logs.length === 0 ? (
                             <tr><td colSpan="4" className="px-4 py-8 text-center text-slate-400">No recent activity logs found.</td></tr>
                         ) : logs.map((log) => (
                             <tr key={log.id} className="text-[rgb(var(--text-muted))]">
                                 <td className="px-4 py-3 font-mono text-xs">{new Date(log.created_at).toLocaleString()}</td>
                                 <td className="px-4 py-3 font-mono text-xs">{log.ip_address}</td>
                                 <td className="px-4 py-3">{log.location}</td>
                                 <td className={`px-4 py-3 font-medium ${log.status === 'Success' ? 'text-emerald-400' : 'text-emerald-400'}`}>{log.status}</td>
                             </tr>
                         ))}
                     </tbody>
                 </table>
              </div>
           </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
             <div className="bg-[rgb(var(--bg-card))] border border-red-900/50 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-scale-up">
                <div className="flex mb-4 gap-4 items-start">
                    <div className="p-3 bg-red-500/20 text-red-500 rounded-full">
                        <Trash2 size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white mb-2">Delete Account?</h3>
                        <p className="text-sm text-slate-400">
                            This action cannot be undone. All your monitoring data, configuration profiles, and historic stats will be permanently erased.
                        </p>
                    </div>
                </div>
  
                <div className="flex justify-end gap-3 mt-8">
                    <button 
                        disabled={isDeleting}
                        onClick={() => setShowDelete(false)}
                        className="px-4 py-2 rounded-lg font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button 
                        disabled={isDeleting}
                        onClick={handleDeleteAccount}
                        className="flex items-center gap-2 px-6 py-2 rounded-lg font-medium bg-red-600 hover:bg-red-500 text-white transition-colors disabled:opacity-50"
                    >
                        {isDeleting ? <Loader2 className="animate-spin" size={18} /> : 'Yes, Delete Everything'}
                    </button>
                </div>
             </div>
          </div>
      )}

    </div>
  );
};

export default Settings;
