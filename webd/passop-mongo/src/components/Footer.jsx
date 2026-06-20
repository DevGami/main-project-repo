import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-slate-900/80 backdrop-blur-xl border-t border-white/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="font-bold text-xl">
            <span className="text-emerald-400">&lt;</span>
            <span className="text-white">Pass</span>
            <span className="text-emerald-400">OP/&gt;</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-slate-400">
            <span>Created with</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
            <span>for secure password management</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
