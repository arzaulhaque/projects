import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  updateCard,
  deleteCard,
  addLabel,
  removeLabel,
  addMember,
  removeMember,
  addChecklistItem,
  updateChecklistItem,
  deleteChecklistItem,
  getCard,
  getLabels,
  getMembers,
} from '../services/api';

export default function CardDetailModal({ card, onClose, onUpdate, onDelete }) {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || '');
  const [dueDate, setDueDate] = useState(
    card.dueDate ? format(new Date(card.dueDate), 'yyyy-MM-dd') : ''
  );
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [availableLabels, setAvailableLabels] = useState([]);
  const [availableMembers, setAvailableMembers] = useState([]);
  const [showLabelPicker, setShowLabelPicker] = useState(false);
  const [showMemberPicker, setShowMemberPicker] = useState(false);

  useEffect(() => {
    getLabels().then((r) => setAvailableLabels(r.data));
    getMembers().then((r) => setAvailableMembers(r.data));
  }, []);

  const handleTitleSave = async () => {
    if (title.trim() && title !== card.title) {
      const res = await updateCard(card.id, { title: title.trim() });
      onUpdate(res.data);
    }
    setIsEditingTitle(false);
  };

  const handleDescSave = async () => {
    const res = await updateCard(card.id, { description: description.trim() });
    onUpdate(res.data);
    setIsEditingDesc(false);
  };

  const handleDueDateChange = async (e) => {
    const val = e.target.value;
    setDueDate(val);
    const res = await updateCard(card.id, { dueDate: val || null });
    onUpdate(res.data);
  };

  const handleToggleLabel = async (labelId) => {
    const has = card.labels?.some((cl) => cl.labelId === labelId || cl.label?.id === labelId);
    let res;
    if (has) {
      res = await removeLabel(card.id, labelId);
    } else {
      res = await addLabel(card.id, labelId);
    }
    onUpdate(res.data);
  };

  const handleToggleMember = async (memberId) => {
    const has = card.members?.some((cm) => cm.memberId === memberId || cm.member?.id === memberId);
    let res;
    if (has) {
      res = await removeMember(card.id, memberId);
    } else {
      res = await addMember(card.id, memberId);
    }
    onUpdate(res.data);
  };

  const handleAddChecklist = async (e) => {
    e.preventDefault();
    if (!newChecklistItem.trim()) return;
    await addChecklistItem(card.id, newChecklistItem.trim());
    const res = await getCard(card.id);
    onUpdate(res.data);
    setNewChecklistItem('');
  };

  const handleToggleChecklist = async (itemId, completed) => {
    await updateChecklistItem(card.id, itemId, { completed });
    const res = await getCard(card.id);
    onUpdate(res.data);
  };

  const handleDeleteChecklist = async (itemId) => {
    await deleteChecklistItem(card.id, itemId);
    const res = await getCard(card.id);
    onUpdate(res.data);
  };

  const handleDelete = async () => {
    if (!confirm('Delete this card?')) return;
    await deleteCard(card.id);
    onDelete(card.id);
  };

  const completedCount = card.checklistItems?.filter((i) => i.completed).length || 0;
  const totalCount = card.checklistItems?.length || 0;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 overflow-y-auto py-8"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[#282E33] rounded-xl w-full max-w-2xl mx-4 shadow-2xl relative">
        <div className="p-5 pb-0">
          {card.labels && card.labels.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {card.labels.map(({ label }) => (
                <span
                  key={label.id}
                  className="px-3 py-1 rounded text-white text-xs font-semibold"
                  style={{ backgroundColor: label.color }}
                >
                  {label.name}
                </span>
              ))}
            </div>
          )}

          {isEditingTitle ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={(e) => { if (e.key === 'Enter') handleTitleSave(); }}
              className="w-full bg-[#22272B] border border-[#579DFF] rounded px-3 py-2 text-white text-lg font-semibold focus:outline-none mb-3"
              autoFocus
            />
          ) : (
            <h2
              className="text-white text-lg font-semibold cursor-pointer hover:bg-[#A6C5E229] rounded px-1 -ml-1 mb-3"
              onClick={() => setIsEditingTitle(true)}
            >
              {card.title}
            </h2>
          )}
        </div>

        <div className="flex gap-4 p-5 pt-2">
          <div className="flex-1 min-w-0">
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[#9FADBC]">📝</span>
                <h3 className="text-[#B6C2CF] font-semibold text-sm">Description</h3>
              </div>
              {isEditingDesc ? (
                <div>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-[#22272B] border border-[#579DFF] rounded px-3 py-2 text-white text-sm focus:outline-none resize-none min-h-[100px]"
                    autoFocus
                  />
                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={handleDescSave}
                      className="bg-[#579DFF] hover:bg-[#4C8FE8] text-[#1D2125] text-sm font-semibold px-3 py-1 rounded"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => { setDescription(card.description || ''); setIsEditingDesc(false); }}
                      className="text-[#9FADBC] hover:text-white text-sm px-2"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => setIsEditingDesc(true)}
                  className="bg-[#22272B] hover:bg-[#2C333A] rounded px-3 py-2 text-sm cursor-pointer min-h-[60px] transition-colors"
                >
                  {card.description ? (
                    <p className="text-[#B6C2CF] whitespace-pre-wrap">{card.description}</p>
                  ) : (
                    <p className="text-[#9FADBC]">Add a more detailed description...</p>
                  )}
                </div>
              )}
            </div>

            <div className="mb-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[#9FADBC]">☑</span>
                <h3 className="text-[#B6C2CF] font-semibold text-sm">Checklist</h3>
                {totalCount > 0 && (
                  <span className="text-xs text-[#9FADBC] ml-auto">{completedCount}/{totalCount}</span>
                )}
              </div>

              {totalCount > 0 && (
                <div className="mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#9FADBC] w-8">{Math.round(progress)}%</span>
                    <div className="flex-1 h-2 bg-[#3B4045] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${progress}%`,
                          backgroundColor: progress === 100 ? '#61BD4F' : '#579DFF',
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-1 mb-2">
                {card.checklistItems?.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 py-1 group">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={(e) => handleToggleChecklist(item.id, e.target.checked)}
                      className="w-4 h-4 rounded accent-[#579DFF] cursor-pointer"
                    />
                    <span className={`flex-1 text-sm ${item.completed ? 'line-through text-[#9FADBC]' : 'text-[#B6C2CF]'}`}>
                      {item.content}
                    </span>
                    <button
                      onClick={() => handleDeleteChecklist(item.id)}
                      className="opacity-0 group-hover:opacity-100 text-[#9FADBC] hover:text-red-400 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddChecklist} className="flex gap-2">
                <input
                  type="text"
                  value={newChecklistItem}
                  onChange={(e) => setNewChecklistItem(e.target.value)}
                  placeholder="Add an item..."
                  className="flex-1 bg-[#22272B] border border-[#3B4045] rounded px-2 py-1.5 text-white text-sm focus:outline-none focus:border-[#579DFF]"
                />
                <button
                  type="submit"
                  className="bg-[#579DFF] hover:bg-[#4C8FE8] text-[#1D2125] text-sm font-semibold px-3 rounded transition-colors"
                >
                  Add
                </button>
              </form>
            </div>
          </div>

          <div className="w-40 shrink-0">
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-[#9FADBC] uppercase tracking-wider mb-1.5">Due Date</h4>
              <input
                type="date"
                value={dueDate}
                onChange={handleDueDateChange}
                className="w-full bg-[#22272B] border border-[#3B4045] rounded px-2 py-1.5 text-[#B6C2CF] text-xs focus:outline-none focus:border-[#579DFF]"
              />
            </div>

            <div className="mb-4">
              <h4 className="text-xs font-semibold text-[#9FADBC] uppercase tracking-wider mb-1.5">Members</h4>
              <div className="flex flex-wrap gap-1 mb-2">
                {card.members?.map(({ member }) => (
                  <div
                    key={member.id}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: member.avatar }}
                    title={member.name}
                  >
                    {member.name[0]}
                  </div>
                ))}
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowMemberPicker(!showMemberPicker)}
                  className="w-full text-xs bg-[#A6C5E229] hover:bg-[#A6C5E244] text-[#B6C2CF] rounded px-2 py-1.5 text-left transition-colors"
                >
                  + Assign member
                </button>
                {showMemberPicker && (
                  <div className="absolute right-0 top-8 bg-[#282E33] border border-[#3B4045] rounded-lg shadow-xl z-10 w-48">
                    {availableMembers.map((member) => {
                      const isAssigned = card.members?.some((cm) => cm.member?.id === member.id);
                      return (
                        <button
                          key={member.id}
                          onClick={() => handleToggleMember(member.id)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#B6C2CF] hover:bg-[#A6C5E229] hover:text-white"
                        >
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                            style={{ backgroundColor: member.avatar }}
                          >
                            {member.name[0]}
                          </div>
                          <span className="flex-1">{member.name}</span>
                          {isAssigned && <span className="text-[#579DFF]">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-xs font-semibold text-[#9FADBC] uppercase tracking-wider mb-1.5">Labels</h4>
              <div className="relative">
                <button
                  onClick={() => setShowLabelPicker(!showLabelPicker)}
                  className="w-full text-xs bg-[#A6C5E229] hover:bg-[#A6C5E244] text-[#B6C2CF] rounded px-2 py-1.5 text-left transition-colors"
                >
                  + Add label
                </button>
                {showLabelPicker && (
                  <div className="absolute right-0 top-8 bg-[#282E33] border border-[#3B4045] rounded-lg shadow-xl z-10 w-48">
                    {availableLabels.map((label) => {
                      const isAdded = card.labels?.some((cl) => cl.label?.id === label.id);
                      return (
                        <button
                          key={label.id}
                          onClick={() => handleToggleLabel(label.id)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#B6C2CF] hover:bg-[#A6C5E229] hover:text-white"
                        >
                          <span
                            className="w-8 h-3 rounded"
                            style={{ backgroundColor: label.color }}
                          />
                          <span className="flex-1">{label.name}</span>
                          {isAdded && <span className="text-[#579DFF]">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-[#9FADBC] uppercase tracking-wider mb-1.5">Actions</h4>
              <button
                onClick={handleDelete}
                className="w-full text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded px-2 py-1.5 text-left transition-colors"
              >
                🗑 Delete card
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#9FADBC] hover:text-white hover:bg-[#A6C5E229] rounded p-1 transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
