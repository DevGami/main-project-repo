import React, { useState, useEffect } from 'react';

const PasswordGenerator = ({ onSelectPassword }) => {
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });
  const [generatedPassword, setGeneratedPassword] = useState('');

  const generatePassword = () => {
    const chars = {
      uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      lowercase: 'abcdefghijklmnopqrstuvwxyz',
      numbers: '0123456789',
      symbols: '!@#$%^&*()_+~`|}{[]:;?><,./-=',
    };

    let charset = '';
    if (options.uppercase) charset += chars.uppercase;
    if (options.lowercase) charset += chars.lowercase;
    if (options.numbers) charset += chars.numbers;
    if (options.symbols) charset += chars.symbols;

    // Fallback to lowercase if everything is unchecked
    if (charset === '') charset = chars.lowercase;

    let password = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    setGeneratedPassword(password);
  };

  useEffect(() => {
    generatePassword();
  }, [length, options]);

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    // Prevent unchecking the last option
    if (!checked && Object.values({ ...options, [name]: checked }).filter(Boolean).length === 0) {
      return;
    }
    setOptions((prev) => ({ ...prev, [name]: checked }));
  };

  const handleUsePassword = (e) => {
    e.preventDefault();
    if (onSelectPassword) {
      onSelectPassword(generatedPassword);
    }
  };

  return (
    <div className="bg-slate-900/50 border border-white/10 rounded-xl p-4 mt-2">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-emerald-400 font-semibold text-sm">Password Generator</h3>
        <button
          type="button"
          onClick={(e) => {
             e.preventDefault();
             generatePassword();
          }}
          className="p-1 text-slate-400 hover:text-white transition-colors"
          title="Regenerate"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 bg-white/5 border border-white/10 rounded-lg p-3 overflow-hidden">
          <code className="text-white font-mono break-all">{generatedPassword}</code>
        </div>
        <button
          type="button"
          onClick={handleUsePassword}
          className="bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-3 rounded-lg font-medium transition-colors text-sm whitespace-nowrap"
        >
          Use
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm text-slate-300">Length: {length}</label>
          </div>
          <input
            type="range"
            min="8"
            max="64"
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-full accent-emerald-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm text-slate-300">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="uppercase"
              checked={options.uppercase}
              onChange={handleCheckboxChange}
              className="accent-emerald-500 w-4 h-4 rounded border-white/10 bg-white/5"
            />
            Uppercase
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="lowercase"
              checked={options.lowercase}
              onChange={handleCheckboxChange}
              className="accent-emerald-500 w-4 h-4 rounded border-white/10 bg-white/5"
            />
            Lowercase
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="numbers"
              checked={options.numbers}
              onChange={handleCheckboxChange}
              className="accent-emerald-500 w-4 h-4 rounded border-white/10 bg-white/5"
            />
            Numbers
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="symbols"
              checked={options.symbols}
              onChange={handleCheckboxChange}
              className="accent-emerald-500 w-4 h-4 rounded border-white/10 bg-white/5"
            />
            Symbols
          </label>
        </div>
      </div>
    </div>
  );
};

export default PasswordGenerator;
