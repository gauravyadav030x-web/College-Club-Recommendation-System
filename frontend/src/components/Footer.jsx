import React from 'react';
import { GraduationCap, Code, Cpu, Network, Sparkles, BookOpen } from 'lucide-react';

export default function Footer({ onNavigate }) {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-2 text-white font-bold text-lg">
              <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="font-heading">CampusConnect</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              An advanced Content-Based and Graph-driven recommendation platform matching students to extracurricular university clubs based on interests, skills, and activities.
            </p>
            <div className="flex items-center space-x-2 text-xs text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>FastAPI Backend & ML Engine Online</span>
            </div>
          </div>

          {/* Core Algorithms */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>ML & DSA Engine</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center space-x-1.5">
                <Cpu className="w-3 h-3 text-indigo-400" />
                <span>TF-IDF & Cosine Similarity</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <Network className="w-3 h-3 text-purple-400" />
                <span>NetworkX BFS Graph Proximity</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <Code className="w-3 h-3 text-emerald-400" />
                <span>HashMap Inverted Indices</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <BookOpen className="w-3 h-3 text-amber-400" />
                <span>Deterministic Tie-breaking</span>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate && onNavigate('/clubs')} className="hover:text-white transition-colors">
                  Explore All Clubs
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate && onNavigate('/recommendations')} className="hover:text-white transition-colors">
                  Recommendation Engine
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate && onNavigate('/interests')} className="hover:text-white transition-colors">
                  Interest Catalog
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate && onNavigate('/admin')} className="hover:text-white transition-colors">
                  Admin Analytics Hub
                </button>
              </li>
            </ul>
          </div>

          {/* Tech Stack */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">
              Architecture Stack
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {['FastAPI', 'Python 3.14', 'Scikit-Learn', 'NetworkX', 'React 19', 'Vite', 'Tailwind CSS', 'SQLAlchemy', 'PostgreSQL / SQLite', 'JWT Auth'].map(tech => (
                <span key={tech} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] border border-slate-700">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500">
          <p>© 2026 CampusConnect. Advanced College Project. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 sm:mt-0">
            <span>REST API: <code className="text-indigo-400 font-mono">/docs</code></span>
            <span>Relevance Metric: <code className="text-emerald-400 font-mono">TF-IDF + Jaccard + BFS</code></span>
          </div>
        </div>
      </div>
    </footer>
  );
}
