import { useState } from 'react';
import { searchCards, getLabels, getMembers } from '../services/api';

export default function SearchBar({ boardId, onResults, onClear }) {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLabels, setSelectedLabels] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [dueDateFilter, setDueDateFilter] = useState('');
  const [labels, setLabels] = useState([]);
  const [members, setMembers] = useState([]);

  const loadFilters = async () => {
    if (labels.length === 0) {
      const [lr, mr] = await Promise.all([getLabels(), getMembers()]);
      setLabels(lr.data);
      setMembers(mr.data);
    }
    setShowFilters(!showFilters);
  };

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!query.trim() && selectedLabels.length === 0 && selectedMembers.length === 0 && !dueDateFilter) {
      onClear();
      return;
    }
    const params = {
      boardId,
      ...(query.trim() && { q: query.trim() }),
      ...(selectedLabels.length > 0 && { labels: selectedLabels.join(',') }),
      ...(selectedMembers.length > 0 && { members: selectedMembers.join(',') }),
      ...(dueDateFilter && { dueDate: dueDateFilter }),
    };
    const res = await searchCards(params);
    onResults(res.data);
  };

  const handleClear = () => {
    setQuery('');
    setSelectedLabels([]);
    setSelectedMembers([]);
    setDueDateFilter('');
    setShowFilters(false);
    onClear();
  };

  return (
    <div className="relative">
      <form onSubmit={handleSearch} className="flex items-center gap-2">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search cards..."
            className="bg-white/10 hover:bg-white/20 focus:bg-white/20 border border-transparent focus:border-white/30 rounded px-3 py-1 text-white text-sm placeholder-white/60 focus:outline-none w-48 transition-all"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={loadFilters}
          className={`text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded px-2 py-1 text-sm transition-colors ${showFilters ? 'bg-white/20' : ''}`}
          title="Filters"
        >
          ⚙
        </button>
        <button
          type="submit"
          className="bg-white/20 hover:bg-white/30 text-white rounded px-3 py-1 text-sm transition-colors"
        >
          Search
        </button>
      </form>

      {showFilters && (
        <div className="absolute right-0 top-9 bg-[#282E33] border border-[#3B4045] rounded-lg shadow-xl z-20 w-72 p-4">
          <h3 className="text-white font-semibold text-sm mb-3">Filters</h3>

          <div className="mb-3">
            <h4 className="text-xs text-[#9FADBC] font-semibold uppercase mb-1.5">Labels</h4>
            <div className="flex flex-wrap gap-1.5">
              {labels.map((label) => (
                <button
                  key={label.id}
                  type="button"
                  onClick={() =>
                    setSelectedLabels((prev) =>
                      prev.includes(label.id) ? prev.filter((id) => id !== label.id) : [...prev, label.id]
                    )
                  }
                  className={`px-2 py-0.5 rounded text-xs font-semibold text-white transition-opacity ${
                    selectedLabels.includes(label.id) ? 'opacity-100 ring-2 ring-white' : 'opacity-60 hover:opacity-80'
                  }`}
                  style={{ backgroundColor: label.color }}
                >
                  {label.name}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-3">
            <h4 className="text-xs text-[#9FADBC] font-semibold uppercase mb-1.5">Members</h4>
            <div className="flex flex-wrap gap-1.5">
              {members.map((member) => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() =>
                    setSelectedMembers((prev) =>
                      prev.includes(member.id) ? prev.filter((id) => id !== member.id) : [...prev, member.id]
                    )
                  }
                  className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs text-[#B6C2CF] bg-[#A6C5E229] transition-colors ${
                    selectedMembers.includes(member.id) ? 'ring-1 ring-[#579DFF] text-white' : 'hover:bg-[#A6C5E244]'
                  }`}
                >
                  <div
                    className="w-4 h-4 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: member.avatar }}
                  >
                    {member.name[0]}
                  </div>
                  {member.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-3">
            <h4 className="text-xs text-[#9FADBC] font-semibold uppercase mb-1.5">Due Before</h4>
            <input
              type="date"
              value={dueDateFilter}
              onChange={(e) => setDueDateFilter(e.target.value)}
              className="w-full bg-[#22272B] border border-[#3B4045] rounded px-2 py-1.5 text-[#B6C2CF] text-xs focus:outline-none focus:border-[#579DFF]"
            />
          </div>

          <button
            onClick={handleSearch}
            className="w-full bg-[#579DFF] hover:bg-[#4C8FE8] text-[#1D2125] font-semibold text-sm py-1.5 rounded transition-colors"
          >
            Apply Filters
          </button>
        </div>
      )}
    </div>
  );
}
