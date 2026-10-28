import React, { useState } from 'react';
import { Search, Check, Sparkles, X, Plus } from 'lucide-react';

export const STANDARD_INTERESTS = [
  { name: 'Artificial Intelligence', category: 'Technology' },
  { name: 'Machine Learning', category: 'Technology' },
  { name: 'Coding', category: 'Technology' },
  { name: 'Web Development', category: 'Technology' },
  { name: 'Robotics', category: 'Technology' },
  { name: 'Data Science', category: 'Technology' },
  { name: 'Cybersecurity', category: 'Technology' },
  { name: 'Photography', category: 'Arts' },
  { name: 'Music', category: 'Arts' },
  { name: 'Dance', category: 'Arts' },
  { name: 'Design', category: 'Arts' },
  { name: 'Film Making', category: 'Arts' },
  { name: 'Sports', category: 'Sports' },
  { name: 'Gaming', category: 'Sports' },
  { name: 'Debate', category: 'Communication' },
  { name: 'Public Speaking', category: 'Communication' },
  { name: 'Entrepreneurship', category: 'Business' },
  { name: 'Finance & Trading', category: 'Business' },
  { name: 'Environmental Action', category: 'Community' },
  { name: 'Creative Writing', category: 'Community' },
];

export default function InterestSelector({
  selectedInterests = [],
  onChange,
  availableInterests = null,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const interestsList = availableInterests && availableInterests.length > 0
    ? availableInterests.map(i => ({ name: typeof i === 'string' ? i : i.name, category: i.category || 'General' }))
    : STANDARD_INTERESTS;

  const categories = ['All', ...new Set(interestsList.map((i) => i.category))];

  const filtered = interestsList.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const toggleInterest = (interestName) => {
    if (selectedInterests.includes(interestName)) {
      onChange(selectedInterests.filter((i) => i !== interestName));
    } else {
      onChange([...selectedInterests, interestName]);
    }
  };

  const handleSelectAllInView = () => {
    const newItems = filtered.map((i) => i.name).filter((n) => !selectedInterests.includes(n));
    onChange([...selectedInterests, ...newItems]);
  };

  const handleClearAll = () => {
    onChange([]);
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search interests (e.g. AI, Robotics, Music)..."
            className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white transition-smooth"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Counter and bulk controls */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 font-bold border border-brand-200">
            {selectedInterests.length} selected
          </span>
          <button
            type="button"
            onClick={handleSelectAllInView}
            className="px-2.5 py-1 text-slate-600 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition-smooth font-medium"
          >
            Select Filtered
          </button>
          {selectedInterests.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="px-2.5 py-1 text-red-600 hover:bg-red-50 rounded-lg transition-smooth font-medium"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-smooth ${
              selectedCategory === cat
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Selected Interest Pills Summary */}
      {selectedInterests.length > 0 && (
        <div className="p-3 bg-brand-50/50 rounded-2xl border border-brand-100 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-brand-900 flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              <span>Active Recommendations Filter:</span>
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {selectedInterests.map((interest) => (
              <span
                key={interest}
                className="inline-flex items-center space-x-1 pl-2.5 pr-1.5 py-1 rounded-lg text-xs font-semibold bg-white text-brand-700 border border-brand-200 shadow-xs"
              >
                <span>{interest}</span>
                <button
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className="p-0.5 hover:bg-brand-50 rounded text-brand-400 hover:text-brand-700"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Chips Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-72 overflow-y-auto p-1">
        {filtered.map((item) => {
          const isSelected = selectedInterests.includes(item.name);
          return (
            <button
              key={item.name}
              type="button"
              onClick={() => toggleInterest(item.name)}
              className={`p-3 rounded-xl border text-left transition-smooth flex items-center justify-between gap-2 group ${
                isSelected
                  ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white border-brand-600 shadow-md shadow-brand-500/20'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-brand-300 hover:bg-slate-50/80 shadow-2xs'
              }`}
            >
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate leading-tight">{item.name}</p>
                <p
                  className={`text-[10px] mt-0.5 truncate ${
                    isSelected ? 'text-indigo-100' : 'text-slate-400'
                  }`}
                >
                  {item.category}
                </p>
              </div>
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                  isSelected
                    ? 'bg-white text-brand-600 shadow-xs'
                    : 'bg-slate-100 text-slate-400 group-hover:bg-brand-50 group-hover:text-brand-600'
                }`}
              >
                {isSelected ? <Check className="w-3 h-3 stroke-[3]" /> : <Plus className="w-3 h-3" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
