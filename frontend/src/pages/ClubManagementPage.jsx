import React, { useState, useEffect } from 'react';
import {
  Compass,
  Plus,
  Edit2,
  Trash2,
  Power,
  X,
  Save,
  CheckCircle2,
  Search,
  ArrowLeft
} from 'lucide-react';
import { clubsApi } from '../api/clubs';
import { adminApi } from '../api/admin';

export default function ClubManagementPage({ onNavigate }) {
  const [clubs, setClubs] = useState([]);
  const [availableInterests, setAvailableInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editModalClub, setEditModalClub] = useState(null);
  const [isNewClub, setIsNewClub] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Technology',
    description: '',
    meeting_info: 'Every Wednesday at 5:00 PM',
    location: 'Student Center, Hall A',
    schedule: 'Weekly workshops',
    contact_email: 'club@university.edu',
    leader_name: 'Faculty Advisor',
    banner_image: '',
    skills_required: '',
    preferred_activities: '',
    interest_names: [],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [clubList, intList] = await Promise.all([
        clubsApi.getClubs({ limit: 100 }),
        clubsApi.getAllInterests(),
      ]);
      setClubs(clubList || []);
      setAvailableInterests(intList || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setIsNewClub(true);
    setFormData({
      name: '',
      category: 'Technology',
      description: '',
      meeting_info: 'Every Wednesday at 5:00 PM',
      location: 'Student Center, Hall A',
      schedule: 'Weekly workshops',
      contact_email: 'club@university.edu',
      leader_name: 'Faculty Advisor',
      banner_image: '',
      skills_required: '',
      preferred_activities: '',
      interest_names: ['Coding', 'Web Development'],
    });
    setEditModalClub({});
  };

  const openEditModal = (club) => {
    setIsNewClub(false);
    setFormData({
      id: club.id,
      name: club.name,
      category: club.category,
      description: club.description,
      meeting_info: club.meeting_info || '',
      location: club.location || '',
      schedule: club.schedule || '',
      contact_email: club.contact_email || '',
      leader_name: club.leader_name || '',
      banner_image: club.banner_image || '',
      skills_required: club.skills_required ? club.skills_required.join(', ') : '',
      preferred_activities: club.preferred_activities ? club.preferred_activities.join(', ') : '',
      interest_names: club.interests ? club.interests.map((i) => i.name) : [],
    });
    setEditModalClub(club);
  };

  const handleSaveClub = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const skillsArray = formData.skills_required
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const actArray = formData.preferred_activities
      .split(',')
      .map((a) => a.trim())
      .filter((a) => a.length > 0);

    const payload = {
      name: formData.name,
      category: formData.category,
      description: formData.description,
      meeting_info: formData.meeting_info,
      location: formData.location,
      schedule: formData.schedule,
      contact_email: formData.contact_email,
      leader_name: formData.leader_name,
      banner_image: formData.banner_image,
      skills_required: skillsArray,
      preferred_activities: actArray,
      interest_names: formData.interest_names,
    };

    try {
      if (isNewClub) {
        await adminApi.createClub(payload);
      } else {
        await adminApi.updateClub(formData.id, payload);
      }
      setEditModalClub(null);
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to save club');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (club) => {
    try {
      await adminApi.updateClub(club.id, { is_active: !club.is_active });
      setClubs((prev) =>
        prev.map((c) => (c.id === club.id ? { ...c, is_active: !c.is_active } : c))
      );
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleDeleteClub = async (clubId) => {
    if (!window.confirm('Are you sure you want to delete or deactivate this club?')) return;
    try {
      await adminApi.deleteClub(clubId, false);
      setClubs((prev) => prev.filter((c) => c.id !== clubId));
    } catch (err) {
      alert(err.message || 'Failed to delete club');
    }
  };

  const categories = ['Technology', 'Arts', 'Sports', 'Communication', 'Entrepreneurship', 'Culture & Community'];

  const filteredClubs = clubs.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <button
            onClick={() => onNavigate('/admin')}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-purple-700 hover:text-purple-800 mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Intelligence Hub</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
            Campus Club Administration
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Create, edit, classify, and safely activate or deactivate college clubs.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-sm transition-smooth flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Club</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by club name or category..."
          className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-smooth"
        />
      </div>

      {/* Clubs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Club Name</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Location</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredClubs.map((club) => (
                <tr key={club.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-3.5">
                    <p className="font-bold text-slate-900">{club.name}</p>
                    <p className="text-[11px] text-slate-400 truncate max-w-xs">{club.description}</p>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700">
                      {club.category}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-slate-600">{club.location || 'Campus Center'}</td>
                  <td className="px-6 py-3.5">
                    <button
                      onClick={() => handleToggleActive(club)}
                      className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-smooth ${
                        club.is_active
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}
                    >
                      <Power className="w-3 h-3" />
                      <span>{club.is_active ? 'Active' : 'Inactive'}</span>
                    </button>
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => openEditModal(club)}
                        className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-smooth"
                        title="Edit Club"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClub(club.id)}
                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-smooth"
                        title="Deactivate / Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {editModalClub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-900 font-heading text-base">
                {isNewClub ? 'Add New College Club' : `Edit: ${editModalClub.name}`}
              </h3>
              <button
                onClick={() => setEditModalClub(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClub} className="p-6 overflow-y-auto space-y-4 flex-1">
              {error && (
                <div className="p-3 text-xs bg-red-50 text-red-700 border border-red-200 rounded-xl">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Club Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Meeting Time</label>
                  <input
                    type="text"
                    value={formData.meeting_info}
                    onChange={(e) => setFormData({ ...formData, meeting_info: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Leader / Advisor Name</label>
                  <input
                    type="text"
                    value={formData.leader_name}
                    onChange={(e) => setFormData({ ...formData, leader_name: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Banner Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={formData.banner_image}
                  onChange={(e) => setFormData({ ...formData, banner_image: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Skills (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="Python, C++, ROS, Deep Learning..."
                  value={formData.skills_required}
                  onChange={(e) => setFormData({ ...formData, skills_required: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Associated Interest Tags</label>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1 border border-slate-200 rounded-xl">
                  {availableInterests.map((interest) => {
                    const isSelected = formData.interest_names.includes(interest.name);
                    return (
                      <button
                        key={interest.id}
                        type="button"
                        onClick={() => {
                          const updated = isSelected
                            ? formData.interest_names.filter((n) => n !== interest.name)
                            : [...formData.interest_names, interest.name];
                          setFormData({ ...formData, interest_names: updated });
                        }}
                        className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-smooth ${
                          isSelected
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-purple-50'
                        }`}
                      >
                        {interest.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditModalClub(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-sm transition-smooth disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Club'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
