import React, { useRef, useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as api from '../services/api';
import PasswordGenerator from './PasswordGenerator';

const Manager = () => {
  const passwordRef = useRef();
  const [form, setForm] = useState({ site: '', username: '', password: '' });
  const [editingId, setEditingId] = useState(null);
  const [passwordArray, setPasswordArray] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [revealedPasswords, setRevealedPasswords] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Fetch passwords on mount
  useEffect(() => {
    fetchPasswords();
  }, []);

  const fetchPasswords = async () => {
    setIsLoading(true);
    try {
      const data = await api.getPasswords();
      if (data.success) {
        setPasswordArray(data.passwords);
      } else {
        if (data.message?.includes('not authorized') || data.message?.includes('no token')) {
          toast.error('Session expired. Please login again.');
        } else {
          toast.error(data.message || 'Failed to fetch passwords');
        }
      }
    } catch (error) {
      toast.error('Network error. Is the backend running?');
    } finally {
      setIsLoading(false);
    }
  };

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!', { autoClose: 2000 });
  };

  const toggleInputPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSelectGeneratedPassword = (pwd) => {
    setForm({ ...form, password: pwd });
    setShowGenerator(false);
    setShowPassword(true); // Show the generated password briefly
  };

  const toggleRevealPassword = (id) => {
    setRevealedPasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSave = async () => {
    if (form.site.length < 3 || form.username.length < 1 || form.password.length < 1) {
      toast.error('Please fill in all fields properly');
      return;
    }

    setIsSaving(true);
    try {
      let data;
      if (editingId) {
        // Update existing password
        data = await api.updatePassword(editingId, form.site, form.username, form.password);
        if (data.success) {
          setPasswordArray((prev) =>
            prev.map((p) => (p.id === editingId ? { ...data.password } : p))
          );
          toast.success('Password updated!');
        }
      } else {
        // Create new password
        data = await api.savePassword(form.site, form.username, form.password);
        if (data.success) {
          setPasswordArray((prev) => [data.password, ...prev]);
          toast.success('Password saved!');
        }
      }

      if (!data.success) {
        toast.error(data.message || 'Operation failed');
        return;
      }

      setForm({ site: '', username: '', password: '' });
      setEditingId(null);
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const data = await api.deletePassword(id);
      if (data.success) {
        setPasswordArray((prev) => prev.filter((p) => p.id !== id));
        toast.success('Password deleted!');
      } else {
        toast.error(data.message || 'Failed to delete');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    }
    setDeleteConfirm(null);
  };

  const handleEdit = (item) => {
    setForm({ site: item.site, username: item.username, password: item.password });
    setEditingId(item.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setForm({ site: '', username: '', password: '' });
    setEditingId(null);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Filtered passwords based on search
  const filteredPasswords = passwordArray.filter(
    (item) =>
      item.site?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <ToastContainer position="top-right" theme="dark" autoClose={3000} />

      <div className="min-h-[calc(100vh-120px)] relative">
        {/* Background effects */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/4 w-64 h-64 bg-emerald-500/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-teal-500/8 rounded-full blur-[150px]"></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold">
              <span className="text-emerald-400">&lt;</span>
              <span className="text-white">Pass</span>
              <span className="text-emerald-400">OP/&gt;</span>
            </h1>
            <p className="text-slate-400 mt-1 text-sm">Your secure password vault</p>
          </div>

          {/* Add/Edit Form */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 shadow-xl">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                {editingId ? 'Edit Password' : 'Add New Password'}
              </div>
              <button
                type="button"
                onClick={() => setShowGenerator(!showGenerator)}
                className="text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-500/20 transition-colors flex items-center gap-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                {showGenerator ? 'Hide Generator' : 'Generate'}
              </button>
            </h2>

            <div className="space-y-4">
              <input
                value={form.site}
                onChange={handleChange}
                placeholder="Enter website URL (e.g., https://example.com)"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200"
                type="text"
                name="site"
                id="form-site"
              />
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Username or email"
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200"
                  type="text"
                  name="username"
                  id="form-username"
                />
                <div className="relative flex-1">
                  <input
                    ref={passwordRef}
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Password"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200 pr-12"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    id="form-password"
                  />
                  <button
                    type="button"
                    onClick={toggleInputPassword}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-400 transition-colors"
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {showGenerator && (
                <PasswordGenerator onSelectPassword={handleSelectGeneratedPassword} />
              )}

              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/25"
                >
                  {isSaving ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                      <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                    </svg>
                  )}
                  {editingId ? 'Update' : 'Save'}
                </button>
                {editingId && (
                  <button
                    onClick={cancelEdit}
                    className="flex items-center gap-2 px-6 py-2.5 bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 font-medium rounded-xl transition-all duration-200"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search passwords..."
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200"
              />
            </div>
          </div>

          {/* Passwords List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Your Passwords
              </h2>
              <span className="text-sm text-slate-400">
                {filteredPasswords.length} {filteredPasswords.length === 1 ? 'entry' : 'entries'}
              </span>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-slate-400 text-sm">Loading your vault...</p>
              </div>
            ) : filteredPasswords.length === 0 ? (
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <p className="text-slate-400 text-lg font-medium">
                  {searchQuery ? 'No matching passwords found' : 'No passwords saved yet'}
                </p>
                <p className="text-slate-500 text-sm mt-1">
                  {searchQuery ? 'Try a different search term' : 'Add your first password using the form above'}
                </p>
              </div>
            ) : (
              filteredPasswords.map((item) => (
                <div
                  key={item.id}
                  className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/8 transition-all duration-200 group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    {/* Site icon and info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-emerald-400 text-sm font-bold">
                            {item.site ? item.site.replace(/https?:\/\//, '').charAt(0).toUpperCase() : '?'}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <a
                            href={item.site?.startsWith('http') ? item.site : `https://${item.site}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white font-medium text-sm hover:text-emerald-400 transition-colors truncate block"
                          >
                            {item.site}
                          </a>
                          <p className="text-slate-400 text-xs truncate">{item.username}</p>
                        </div>
                      </div>
                    </div>

                    {/* Password display */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <code className="text-sm text-slate-300 bg-white/5 px-3 py-1.5 rounded-lg font-mono min-w-[100px] text-center">
                        {revealedPasswords[item.id]
                          ? (item.decryptionFailed ? '⚠ Decryption failed' : item.password)
                          : '••••••••'}
                      </code>
                      <button
                        onClick={() => toggleRevealPassword(item.id)}
                        className="p-1.5 text-slate-400 hover:text-emerald-400 transition-colors rounded-lg hover:bg-white/5"
                        title={revealedPasswords[item.id] ? 'Hide password' : 'Show password'}
                      >
                        {revealedPasswords[item.id] ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                            <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1 flex-shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={() => copyText(item.username)}
                        className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-white/5 rounded-lg transition-all"
                        title="Copy username"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M16 1H4a1 1 0 00-1 1v14h2V3h11V1zM15 5H8a1 1 0 00-1 1v12a1 1 0 001 1h7a1 1 0 001-1V6a1 1 0 00-1-1z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => copyText(item.password)}
                        className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-white/5 rounded-lg transition-all"
                        title="Copy password"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 text-slate-400 hover:text-blue-400 hover:bg-white/5 rounded-lg transition-all"
                        title="Edit"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                          <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(item.id)}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition-all"
                        title="Delete"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Delete confirmation inline */}
                  {deleteConfirm === item.id && (
                    <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                      <p className="text-sm text-red-400">Delete this password?</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-3 py-1 text-sm text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="px-3 py-1 text-sm text-white bg-red-500/80 hover:bg-red-500 rounded-lg transition-all"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Manager;
