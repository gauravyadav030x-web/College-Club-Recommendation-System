import React from 'react';
import { Compass, ArrowLeft } from 'lucide-react';

export default function NotFoundPage({ onNavigate }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-xs">
          <Compass className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 font-heading">404</h1>
        <h2 className="text-lg font-bold text-slate-800">Page Not Found</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
          The page or club resource you were looking for doesn't exist or has moved.
        </p>
        <button
          onClick={() => onNavigate('/')}
          className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition-smooth inline-flex items-center space-x-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return Home</span>
        </button>
      </div>
    </div>
  );
}
