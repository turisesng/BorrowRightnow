import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { UserProfile } from '../types';
import { getSupabase } from '../lib/supabase';
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Briefcase,
  DollarSign,
  Target,
  Shield,
  Save,
  Upload,
  Lock,
  Settings,
  RefreshCw,
  Moon,
  Sun,
  X,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  UserCheck
} from 'lucide-react';

export const ProfileScreen: React.FC = () => {
  const {
    profile,
    setProfile,
    supabaseUser,
    theme,
    toggleTheme,
    addNotification,
    updatePasswordWithSupabase,
    auditLogs
  } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserProfile>({ ...profile });
  const [newGoal, setNewGoal] = useState('');
  
  // Security settings
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: ''
  });

  // Avatar states
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync formData with profile when loaded
  useEffect(() => {
    setFormData({ ...profile });
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'monthlyIncome' ? Number(value) : value
    }));
  };

  const handleGoalAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGoal.trim()) {
      setFormData(prev => ({
        ...prev,
        financialGoals: [...(prev.financialGoals || []), newGoal.trim()]
      }));
      setNewGoal('');
    }
  };

  const handleGoalRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      financialGoals: (prev.financialGoals || []).filter((_, i) => i !== index)
    }));
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setProfile(formData);
      setIsEditing(false);
      addNotification('Your profile changes have been successfully saved and synced to Supabase.');
    } catch (err: any) {
      console.error('Error saving profile:', err);
      addNotification('Failed to sync profile updates to Supabase. Check your connection.');
    }
  };

  // Dual-mode image uploader (Supabase Storage with automatic small-canvas Base64 fallback)
  const processImageFile = async (file: File) => {
    if (!supabaseUser) return;
    setAvatarLoading(true);

    const supabase = getSupabase();
    const userId = supabaseUser.id;

    try {
      // 1. Attempt to upload to Supabase Storage bucket 'avatars'
      if (supabase) {
        const fileExt = file.name.split('.').pop() || 'png';
        const filePath = `${userId}/avatar-${Date.now()}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true
          });

        if (!uploadError && uploadData) {
          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

          if (publicUrl) {
            const updatedProfile = { ...profile, avatarUrl: publicUrl };
            await setProfile(updatedProfile);
            addNotification('Profile picture uploaded successfully to Supabase Storage!');
            setAvatarLoading(false);
            return;
          }
        }
      }
    } catch (err) {
      console.warn('Supabase storage upload failed or unconfigured, falling back to canvas compression...', err);
    }

    // 2. Fallback: Compress and convert to Base64 to store in the 'profiles' database row
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = async () => {
        // Create canvas to downscale/compress image to keep DB row size extremely tiny (around 150x150px)
        const canvas = document.createElement('canvas');
        const maxDim = 150;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6); // 60% quality jpeg
          
          try {
            const updatedProfile = { ...profile, avatarUrl: compressedBase64 };
            await setProfile(updatedProfile);
            addNotification('Profile picture compressed and synced to your profile table!');
          } catch (dbErr) {
            console.error('Database write error during avatar sync:', dbErr);
            addNotification('Failed to save avatar image.');
          }
        }
        setAvatarLoading(false);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'Passwords do not match.' });
      return;
    }
    if (password.length < 6) {
      setPasswordStatus({ type: 'error', message: 'Password must be at least 6 characters long.' });
      return;
    }

    setPasswordLoading(true);
    setPasswordStatus({ type: null, message: '' });

    try {
      const { error } = await updatePasswordWithSupabase(password);
      if (error) {
        setPasswordStatus({ type: 'error', message: error.message || 'Failed to update password.' });
      } else {
        setPasswordStatus({ type: 'success', message: 'Password updated successfully inside Supabase!' });
        setPassword('');
        setConfirmPassword('');
        addNotification('Your password has been changed successfully in Supabase auth.');
      }
    } catch (err: any) {
      setPasswordStatus({ type: 'error', message: err.message || 'An unexpected error occurred.' });
    } finally {
      setPasswordLoading(false);
    }
  };

  // Helper to render field value or fallback
  const displayField = (val: any) => val || <span className="text-slate-350 dark:text-slate-650 italic font-medium">Not specified</span>;

  return (
    <div className="space-y-8 animate-fadeIn" id="profile-settings-page">
      {/* Page Title & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 dark:border-slate-850 pb-5">
        <div>
          <h1 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Your Profile & Settings</h1>
          <p className="text-xs text-slate-400 font-semibold mt-1">Manage credentials, details, and live synchronization with your database.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 px-3.5 py-1.5 rounded-xl border border-emerald-100 dark:border-emerald-900/30 text-[10px] font-bold flex items-center gap-1.5 shadow-xs">
            <UserCheck className="h-3.5 w-3.5" />
            LIVE SYNCHRONIZED
          </div>
          <button
            id="toggle-edit-mode-btn"
            onClick={() => {
              if (isEditing) {
                setFormData({ ...profile });
              }
              setIsEditing(!isEditing);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${isEditing ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300' : 'bg-emerald-600 hover:bg-emerald-500 text-white'}`}
          >
            {isEditing ? 'Cancel Edit' : 'Edit Profile'}
          </button>
        </div>
      </div>

      {/* Grid: Left Column: Avatar & Quick Info | Right Column: Details Form / View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Avatar Card & Security Summary */}
        <div className="space-y-6 lg:col-span-1">
          {/* Avatar Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center space-y-4">
            
            {/* Avatar Image Uploader */}
            <div 
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative h-28 w-28 rounded-full border-2 group overflow-hidden flex items-center justify-center transition-all ${dragActive ? 'border-emerald-500 bg-emerald-50/20' : 'border-slate-150 dark:border-slate-800'}`}
            >
              {profile.avatarUrl ? (
                <img 
                  src={profile.avatarUrl} 
                  alt="Avatar" 
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover rounded-full" 
                />
              ) : (
                <div className="h-full w-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-extrabold text-3xl uppercase">
                  {profile.fullName ? profile.fullName.slice(0, 2) : 'U'}
                </div>
              )}

              {/* Upload Overlay */}
              <button
                id="trigger-avatar-upload"
                type="button"
                disabled={avatarLoading}
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-slate-900/60 text-white opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center cursor-pointer text-[10px] font-bold gap-1"
              >
                {avatarLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    <span>Change Image</span>
                  </>
                )}
              </button>
              
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                onChange={handleFileChange}
                className="hidden" 
              />
            </div>

            {/* Quick Details */}
            <div className="space-y-1">
              <h2 className="font-extrabold text-base text-slate-800 dark:text-slate-100 tracking-tight">
                {profile.fullName || 'No Name Set'}
              </h2>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 px-2.5 py-1 rounded-full uppercase tracking-wider block">
                {profile.employmentStatus || 'General User'}
              </span>
            </div>

            {/* Drag & Drop Hint */}
            <p className="text-[10px] text-slate-400 font-semibold max-w-[200px]">
              Drag and drop an image here or click the profile picture to change. Supports cloud storage and offline compression fallbacks.
            </p>
          </div>

          {/* Connected Session Info Settings */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-50 dark:border-slate-850 pb-2">Database & Security</h3>
            
            <div className="space-y-3.5">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                <span>Account Email</span>
                <span className="text-slate-800 dark:text-slate-200 select-all font-mono text-[10px]">{profile.email}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                <span>Provider Connection</span>
                <span className="text-slate-800 dark:text-slate-200 font-bold uppercase tracking-wider text-[10px] bg-slate-50 dark:bg-slate-950 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-850">
                  {supabaseUser?.app_metadata?.provider || 'Email / Password'}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                <span>Supabase ID</span>
                <span className="text-slate-400 select-all font-mono text-[9px] max-w-[150px] truncate">{supabaseUser?.id}</span>
              </div>
            </div>

            {/* Dark Mode Theme Settings Card */}
            <div className="pt-3 border-t border-slate-50 dark:border-slate-850 flex items-center justify-between">
              <div>
                <h4 className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300">Workspace Accent</h4>
                <p className="text-[9px] text-slate-400 font-medium">Switch dashboard brightness.</p>
              </div>
              <button
                id="toggle-profile-theme"
                onClick={toggleTheme}
                className="p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-850 border border-slate-100 dark:border-slate-850 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer transition-all"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-indigo-500" />}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: View or Edit Profiles */}
        <div className="lg:col-span-2 space-y-6">
          {isEditing ? (
            /* Editing Form */
            <form onSubmit={handleProfileSave} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex justify-between items-center border-b border-slate-50 dark:border-slate-850 pb-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <User className="h-4 w-4 text-emerald-600" />
                  Personal Information
                </h3>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-900/30">Edit Mode</span>
              </div>

              {/* Grid Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-emerald-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-emerald-500 font-bold"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-emerald-500 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+234 800 000 0000"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-emerald-500 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="Lagos"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-emerald-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Ikeja"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-emerald-500 font-bold"
                  />
                </div>
              </div>

              {/* Employment and Income */}
              <div className="space-y-4 pt-4 border-t border-slate-50 dark:border-slate-850">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Briefcase className="h-4 w-4 text-emerald-600" />
                  Employment & Underwriting Metrics
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Employment Status</label>
                    <select
                      name="employmentStatus"
                      value={formData.employmentStatus}
                      onChange={handleChange}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-emerald-500 font-bold"
                    >
                      <option value="Employed">Salary Earner</option>
                      <option value="Self-Employed">Business Owner</option>
                      <option value="Student">Student</option>
                      <option value="Unemployed">Unemployed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Employer Name</label>
                    <input
                      type="text"
                      name="employer"
                      value={formData.employer}
                      onChange={handleChange}
                      placeholder="E.g. Interswitch, Flutterwave, Self"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-emerald-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Occupation</label>
                    <input
                      type="text"
                      name="occupation"
                      value={formData.occupation}
                      onChange={handleChange}
                      placeholder="E.g. Senior Software QA, Trader"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-emerald-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Monthly Income (₦)</label>
                    <input
                      type="number"
                      name="monthlyIncome"
                      value={formData.monthlyIncome}
                      onChange={handleChange}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-emerald-500 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Income Frequency</label>
                    <select
                      name="incomeFrequency"
                      value={formData.incomeFrequency}
                      onChange={handleChange}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-emerald-500 font-bold"
                    >
                      <option value="Monthly">Monthly</option>
                      <option value="Weekly">Weekly</option>
                      <option value="Bi-Weekly">Bi-Weekly</option>
                      <option value="Irregular">Irregular</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Government Identifiers (Encrypted in production) */}
              <div className="space-y-4 pt-4 border-t border-slate-50 dark:border-slate-850">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-emerald-600" />
                  Government Verification Identifiers
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Bank Verification Number (BVN)</label>
                    <input
                      type="text"
                      name="bvn"
                      value={formData.bvn}
                      onChange={handleChange}
                      maxLength={11}
                      placeholder="11-Digit BVN"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-emerald-500 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">National Identification Number (NIN)</label>
                    <input
                      type="text"
                      name="nin"
                      value={formData.nin}
                      onChange={handleChange}
                      maxLength={11}
                      placeholder="11-Digit NIN"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-emerald-500 font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="space-y-4 pt-4 border-t border-slate-50 dark:border-slate-850">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Phone className="h-4 w-4 text-emerald-600" />
                  Emergency Contact Details
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Contact Name</label>
                    <input
                      type="text"
                      name="emergencyContactName"
                      value={formData.emergencyContactName}
                      onChange={handleChange}
                      placeholder="Emergency contact full name"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-emerald-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Contact Phone</label>
                    <input
                      type="tel"
                      name="emergencyContactPhone"
                      value={formData.emergencyContactPhone}
                      onChange={handleChange}
                      placeholder="Emergency contact phone number"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-emerald-500 font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Financial Goals Builder */}
              <div className="space-y-4 pt-4 border-t border-slate-50 dark:border-slate-850">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Target className="h-4 w-4 text-emerald-600" />
                  Your Credit & Financial Goals
                </h3>
                
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newGoal}
                      onChange={(e) => setNewGoal(e.target.value)}
                      placeholder="E.g. Pay off outstanding credit card debt"
                      className="flex-grow bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-emerald-500 font-bold"
                    />
                    <button
                      type="button"
                      onClick={handleGoalAdd}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl p-2 cursor-pointer flex items-center justify-center transition-all shadow-xs"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {(formData.financialGoals || []).length > 0 ? (
                      (formData.financialGoals || []).map((goal, index) => (
                        <span key={index} className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 px-3 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1.5 text-slate-600 dark:text-slate-350">
                          {goal}
                          <button
                            type="button"
                            onClick={() => handleGoalRemove(index)}
                            className="text-rose-500 hover:text-rose-700 cursor-pointer"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))
                    ) : (
                      <p className="text-[10px] text-slate-400 italic">No financial goals added yet.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-50 dark:border-slate-850 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...profile });
                    setIsEditing(false);
                  }}
                  className="bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-850 border border-slate-100 dark:border-slate-850 text-slate-500 hover:text-slate-750 font-bold py-2 px-4 rounded-xl text-xs cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-5 rounded-xl text-xs cursor-pointer transition-all flex items-center gap-1.5 shadow-sm shadow-emerald-600/10"
                >
                  <Save className="h-3.5 w-3.5" />
                  Save and Sync
                </button>
              </div>
            </form>
          ) : (
            /* View Details Mode */
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl p-6 shadow-sm space-y-6">
              
              {/* Personal Section */}
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-50 dark:border-slate-850 pb-2 flex items-center gap-1.5">
                  <User className="h-4 w-4 text-emerald-600" />
                  Personal Profile
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100/40 dark:border-slate-850/40 rounded-xl">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Full Name</span>
                    <span className="text-xs font-bold text-slate-750 dark:text-slate-200">{displayField(profile.fullName)}</span>
                  </div>
                  <div className="p-3 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100/40 dark:border-slate-850/40 rounded-xl">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Gender</span>
                    <span className="text-xs font-bold text-slate-750 dark:text-slate-200">{displayField(profile.gender)}</span>
                  </div>
                  <div className="p-3 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100/40 dark:border-slate-850/40 rounded-xl">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Date of Birth</span>
                    <span className="text-xs font-bold text-slate-750 dark:text-slate-200 font-mono">{displayField(profile.dateOfBirth)}</span>
                  </div>
                  <div className="p-3 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100/40 dark:border-slate-850/40 rounded-xl">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Contact Phone</span>
                    <span className="text-xs font-bold text-slate-750 dark:text-slate-200 font-mono">{displayField(profile.phone)}</span>
                  </div>
                  <div className="p-3 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100/40 dark:border-slate-850/40 rounded-xl">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">State Residence</span>
                    <span className="text-xs font-bold text-slate-750 dark:text-slate-200">{displayField(profile.state)}</span>
                  </div>
                  <div className="p-3 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100/40 dark:border-slate-850/40 rounded-xl">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">City Residence</span>
                    <span className="text-xs font-bold text-slate-750 dark:text-slate-200">{displayField(profile.city)}</span>
                  </div>
                </div>
              </div>

              {/* Employment Section */}
              <div className="space-y-4 pt-4 border-t border-slate-50 dark:border-slate-850">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-50 dark:border-slate-850 pb-2 flex items-center gap-1.5">
                  <Briefcase className="h-4 w-4 text-emerald-600" />
                  Employment & Income Underwriting
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100/40 dark:border-slate-850/40 rounded-xl">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Employment Status</span>
                    <span className="text-xs font-bold text-slate-750 dark:text-slate-200">
                      {profile.employmentStatus === 'Employed' ? 'Salary Earner' : profile.employmentStatus || 'Not specified'}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100/40 dark:border-slate-850/40 rounded-xl">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Employer / Company</span>
                    <span className="text-xs font-bold text-slate-750 dark:text-slate-200">{displayField(profile.employer)}</span>
                  </div>
                  <div className="p-3 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100/40 dark:border-slate-850/40 rounded-xl">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Occupation Title</span>
                    <span className="text-xs font-bold text-slate-750 dark:text-slate-200">{displayField(profile.occupation)}</span>
                  </div>
                  <div className="p-3 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100/40 dark:border-slate-850/40 rounded-xl">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Monthly Income (₦)</span>
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono">
                      ₦{profile.monthlyIncome ? profile.monthlyIncome.toLocaleString() : '0.00'}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100/40 dark:border-slate-850/40 rounded-xl">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Income Pay Frequency</span>
                    <span className="text-xs font-bold text-slate-750 dark:text-slate-200">{displayField(profile.incomeFrequency)}</span>
                  </div>
                </div>
              </div>

              {/* KYC and Emergency Contact Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-50 dark:border-slate-850">
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-50 dark:border-slate-850 pb-2 flex items-center gap-1.5">
                    <Shield className="h-4 w-4 text-emerald-600" />
                    KYC Verification Flags
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-400">BVN Status</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${profile.bvn ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                        {profile.bvn ? 'VERIFIED (ENCRYPTED)' : 'PENDING'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-400">NIN Status</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${profile.nin ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                        {profile.nin ? 'VERIFIED (ENCRYPTED)' : 'PENDING'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-50 dark:border-slate-850 pb-2 flex items-center gap-1.5">
                    <Phone className="h-4 w-4 text-emerald-600" />
                    Emergency Contact
                  </h3>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-350">
                      <span className="text-slate-400 block text-[9px] uppercase tracking-wider mb-0.5">Contact Person</span>
                      {displayField(profile.emergencyContactName)}
                    </p>
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-350">
                      <span className="text-slate-400 block text-[9px] uppercase tracking-wider mb-0.5">Contact Mobile</span>
                      <span className="font-mono">{displayField(profile.emergencyContactPhone)}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Goals list */}
              <div className="space-y-3 pt-4 border-t border-slate-50 dark:border-slate-850">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Target className="h-4 w-4 text-emerald-600" />
                  Selected Credit Goals
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.financialGoals && profile.financialGoals.length > 0 ? (
                    profile.financialGoals.map((goal, idx) => (
                      <span key={idx} className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 px-3 py-1.5 rounded-xl text-[10px] font-extrabold text-slate-600 dark:text-slate-300">
                        {goal}
                      </span>
                    ))
                  ) : (
                    <p className="text-xs font-semibold text-slate-400 italic">No credit goals configured yet. Select edit to map goals.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Change Password Form inside Settings Screen */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="border-b border-slate-50 dark:border-slate-850 pb-3 flex justify-between items-center">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Lock className="h-4 w-4 text-emerald-600" />
                Change Password
              </h3>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 px-2 py-0.5 rounded">Supabase Auth</span>
            </div>

            <form onSubmit={handlePasswordUpdate} className="space-y-4 max-w-md">
              {passwordStatus.type && (
                <div className={`p-3 rounded-xl border flex items-start gap-2.5 text-[11px] font-bold ${passwordStatus.type === 'success' ? 'bg-emerald-50/50 border-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-950' : 'bg-rose-50/50 border-rose-100 text-rose-700 dark:bg-rose-950/20 dark:border-rose-950'}`}>
                  {passwordStatus.type === 'success' ? <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" /> : <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />}
                  <span>{passwordStatus.message}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">New Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-emerald-500 font-mono font-bold pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 bottom-2.5 text-slate-450 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Confirm Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-emerald-500 font-mono font-bold"
                  />
                </div>
              </div>

              <button
                id="update-password-btn"
                type="submit"
                disabled={passwordLoading}
                className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 text-white font-bold py-2 px-5 rounded-xl text-xs cursor-pointer transition-all flex items-center gap-1.5 shadow-xs"
              >
                {passwordLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Lock className="h-3.5 w-3.5" />}
                Update Password
              </button>
            </form>
          </div>

          {/* Audit Logs / Activity Logs Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-50 dark:border-slate-850 pb-2">Recent Security & Activity Audit Log</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px]">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-100 dark:border-slate-850 uppercase tracking-wider font-bold">
                    <th className="pb-2 text-[10px]">Action</th>
                    <th className="pb-2 text-[10px]">Details</th>
                    <th className="pb-2 text-[10px] text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-850/50">
                  {auditLogs.length > 0 ? (
                    auditLogs
                      .filter(log => log.adminEmail === profile.email || log.id.startsWith('profile-') || true) // Show relevant
                      .slice(0, 5)
                      .map((log) => (
                        <tr key={log.id} className="text-slate-600 dark:text-slate-350 font-semibold">
                          <td className="py-2.5 font-bold uppercase tracking-wider text-[10px] text-slate-700 dark:text-slate-200">{log.action}</td>
                          <td className="py-2.5">{log.details}</td>
                          <td className="py-2.5 text-right font-mono text-[10px] text-slate-400">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="py-4 text-center text-slate-400 italic">No activity logs recorded yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
