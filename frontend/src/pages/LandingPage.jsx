import React from 'react';
import {
  Sparkles,
  Compass,
  GraduationCap,
  Cpu,
  Network,
  Database,
  ArrowRight,
  CheckCircle,
  Users,
  ShieldCheck,
  Star
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LandingPage({ onNavigate }) {
  const { isAuthenticated, login } = useAuth();

  const handleDemoStudent = async () => {
    try {
      await login('student@university.edu', 'Student@College2026');
      onNavigate('/dashboard');
    } catch (err) {
      console.error(err);
      onNavigate('/login');
    }
  };

  const handleDemoAdmin = async () => {
    try {
      await login('admin@university.edu', 'Admin@College2026');
      onNavigate('/admin');
    } catch (err) {
      console.error(err);
      onNavigate('/login');
    }
  };

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 bg-gradient-to-b from-indigo-50/70 via-purple-50/30 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white border border-indigo-200/80 shadow-xs text-xs font-semibold text-brand-700">
              <Sparkles className="w-4 h-4 text-brand-600 animate-pulse" />
              <span>AI & Graph-Powered Student Experience</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight font-heading leading-tight">
              Discover Campus Clubs that Match Your{' '}
              <span className="bg-gradient-to-r from-brand-600 to-accent-600 bg-clip-text text-transparent">
                True Passions
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              CampusConnect matches your unique skills, interests, and hobbies to active university organizations using TF-IDF text mining, Set theory, and Breadth-First Search (BFS) graph discovery.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <button
                onClick={() => onNavigate(isAuthenticated ? '/recommendations' : '/register')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-sm text-white bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 transition-smooth flex items-center justify-center space-x-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Get My Recommendations</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('/clubs')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-sm text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-xs transition-smooth flex items-center justify-center space-x-2"
              >
                <Compass className="w-4 h-4 text-brand-600" />
                <span>Explore 18+ Active Clubs</span>
              </button>
            </div>

            {/* Quick Demo Logins Bar */}
            {!isAuthenticated && (
              <div className="pt-6">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Instant Test Login
                </p>
                <div className="inline-flex flex-wrap items-center justify-center gap-2 p-1.5 bg-white/90 rounded-2xl border border-slate-200 shadow-xs backdrop-blur-sm">
                  <button
                    onClick={handleDemoStudent}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 transition-smooth flex items-center space-x-1.5"
                  >
                    <span>🎓 Login Demo Student (Alex)</span>
                  </button>
                  <button
                    onClick={handleDemoAdmin}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 transition-smooth flex items-center space-x-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                    <span>👑 Login Demo Admin</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Highlights & Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-heading">
            How The Intelligent Engine Works
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Combining state-of-the-art Machine Learning vector models with core Data Structures & Algorithms.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Machine Learning */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4 hover:shadow-md transition-smooth">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-brand-600 flex items-center justify-center">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-heading">
              1. TF-IDF & Cosine Similarity
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Converts club mission statements, required skills, and student interest profiles into sparse numerical vectors, computing cosine distances to quantify semantic relevance.
            </p>
            <div className="text-[11px] font-mono text-brand-700 bg-brand-50 px-2.5 py-1 rounded-lg">
              Similarity = cos(θ) = (A · B) / (||A|| ||B||)
            </div>
          </div>

          {/* Card 2: Graph Engine */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4 hover:shadow-md transition-smooth">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Network className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-heading">
              2. NetworkX BFS Graph Discovery
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Models clubs, categories, and interest tags as an interconnected bipartite knowledge graph. Breadth-First Search traverses 1-hop and 2-hop neighbor communities to recommend hidden gems.
            </p>
            <div className="text-[11px] font-mono text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg">
              BFS Queue: O(V + E) Subgraph Traversal
            </div>
          </div>

          {/* Card 3: Sets & Fast HashMaps */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4 hover:shadow-md transition-smooth">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-heading">
              3. HashMaps & Jaccard Overlap
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Employs inverted index HashMaps for O(1) candidate lookup, Set intersection for deterministic interest overlap, and multi-key tie breaking for reliable ranking.
            </p>
            <div className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
              Jaccard = |S ∩ C| / |S ∪ C| (O(|A|+|B|))
            </div>
          </div>
        </div>
      </section>

      {/* Featured Clubs Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-heading">
              Campus Club Spotlight
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Active student organizations welcoming applications for this semester.
            </p>
          </div>
          <button
            onClick={() => onNavigate('/clubs')}
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center space-x-1"
          >
            <span>View All Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              id: 1,
              name: 'Artificial Intelligence & Robotics Society (AIRS)',
              category: 'Technology',
              description: 'Premier research and hardware builds in deep learning, autonomous rovers, and computer vision.',
              meeting: 'Tue & Thu 6:00 PM',
              location: 'Turing Lab 304',
              tags: ['AI', 'Robotics', 'Python']
            },
            {
              id: 2,
              name: 'DesignCraft UI/UX & Creative Media',
              category: 'Arts',
              description: 'Master user experience design, Figma prototyping, mobile wireframing, and design sprint hacks.',
              meeting: 'Wednesdays 6:00 PM',
              location: 'Design Lab 204',
              tags: ['Design', 'UI/UX', 'Figma']
            },
            {
              id: 3,
              name: 'VentureLaunch Student Startup Incubator',
              category: 'Entrepreneurship',
              description: 'Turn ideas into thriving startups with angel investor mentorship, pitch nights, and seed micro-grants.',
              meeting: 'Tuesdays 6:00 PM',
              location: 'Venture Suite 4th Fl',
              tags: ['Entrepreneurship', 'Pitching', 'Finance']
            }
          ].map(club => (
            <div key={club.id} className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4 hover:shadow-md transition-smooth card-hover">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700">
                  {club.category}
                </span>
                <span className="text-xs text-slate-400">Weekly Activity</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 font-heading">
                {club.name}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                {club.description}
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {club.tags.map(t => (
                  <span key={t} className="px-2 py-0.5 text-[11px] bg-slate-100 text-slate-700 rounded-md">
                    {t}
                  </span>
                ))}
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">{club.location}</span>
                <button
                  onClick={() => onNavigate(`/clubs/${club.id}`)}
                  className="font-semibold text-brand-600 hover:text-brand-700"
                >
                  View Profile →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
