import { useState } from 'react';

const COLORS = [
  '#0079BF', '#61BD4F', '#FF9F1A', '#EB5A46',
  '#C377E0', '#FF78CB', '#00C2E0', '#51E898',
];

export default function CreateBoardModal({ onClose, onCreate }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#0079BF');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      await onCreate({ title: title.trim(), description: description.trim(), color });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#282E33] rounded-lg p-6 w-96 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white font-semibold text-lg">Create Board</h2>
          <button onClick={onClose} className="text-[#9FADBC] hover:text-white text-xl">✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-[#9FADBC] mb-1 uppercase tracking-wider">
              Board Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter board title..."
              className="w-full bg-[#22272B] border border-[#738496] rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#579DFF]"
              autoFocus
            />
          </div>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-[#9FADBC] mb-1 uppercase tracking-wider">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Board description..."
              rows={2}
              className="w-full bg-[#22272B] border border-[#738496] rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#579DFF] resize-none"
            />
          </div>
          <div className="mb-6">
            <label className="block text-xs font-semibold text-[#9FADBC] mb-2 uppercase tracking-wider">
              Color
            </label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${color === c ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-[#282E33]' : 'hover:scale-110'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={!title.trim() || loading}
              className="flex-1 bg-[#579DFF] hover:bg-[#4C8FE8] disabled:opacity-50 text-[#1D2125] font-semibold py-2 rounded transition-colors text-sm"
            >
              {loading ? 'Creating...' : 'Create Board'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#A6C5E229] hover:bg-[#A6C5E244] text-[#B6C2CF] rounded transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
