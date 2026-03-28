import { useState } from 'react';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { createCard } from '../services/api';
import CardItem from './CardItem';

export default function KanbanList({
  list,
  onUpdateTitle,
  onDelete,
  onCardCreate,
  onCardClick,
  // eslint-disable-next-line no-unused-vars
  isDragging = false,
}) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(list.title);
  const [showAddCard, setShowAddCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  const { setNodeRef, attributes, listeners, transform, transition, isDragging: isSorting } =
    useSortable({
      id: list.id,
      data: { type: 'list', list },
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSorting ? 0.4 : 1,
  };

  const handleTitleBlur = () => {
    if (titleValue.trim() && titleValue !== list.title) {
      onUpdateTitle(list.id, titleValue.trim());
    } else {
      setTitleValue(list.title);
    }
    setIsEditingTitle(false);
  };

  const handleAddCard = async (e) => {
    e.preventDefault();
    if (!newCardTitle.trim()) return;
    const res = await createCard(list.id, { title: newCardTitle.trim() });
    onCardCreate(list.id, res.data);
    setNewCardTitle('');
    setShowAddCard(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex flex-col w-64 shrink-0 max-h-full ${isSorting ? 'cursor-grabbing' : ''}`}
    >
      <div className="bg-[#282E33] rounded-xl flex flex-col max-h-[calc(100vh-220px)]">
        <div
          className="flex items-center justify-between px-3 py-2.5 cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          {isEditingTitle ? (
            <input
              type="text"
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={(e) => { if (e.key === 'Enter') handleTitleBlur(); if (e.key === 'Escape') { setTitleValue(list.title); setIsEditingTitle(false); } }}
              className="flex-1 bg-[#22272B] border border-[#579DFF] rounded px-2 py-0.5 text-white text-sm font-semibold focus:outline-none"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <h3
              className="text-[#B6C2CF] font-semibold text-sm flex-1"
              onDoubleClick={() => setIsEditingTitle(true)}
            >
              {list.title}
            </h3>
          )}
          <div className="flex items-center gap-1 ml-1">
            <span className="text-xs text-[#9FADBC] bg-[#A6C5E229] rounded px-1.5 py-0.5">
              {list.cards?.length || 0}
            </span>
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="text-[#9FADBC] hover:text-white hover:bg-[#A6C5E229] rounded p-0.5 transition-colors"
              >
                ···
              </button>
              {showMenu && (
                <div className="absolute right-0 top-6 bg-[#282E33] border border-[#3B4045] rounded-lg shadow-xl z-10 w-40">
                  <button
                    onClick={() => { setIsEditingTitle(true); setShowMenu(false); }}
                    className="w-full text-left px-3 py-2 text-sm text-[#B6C2CF] hover:bg-[#A6C5E229] hover:text-white"
                  >
                    Rename list
                  </button>
                  <button
                    onClick={() => { onDelete(list.id); setShowMenu(false); }}
                    className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-[#A6C5E229]"
                  >
                    Delete list
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-y-auto px-2 pb-1 flex-1">
          <SortableContext
            items={(list.cards || []).map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-2">
              {(list.cards || []).map((card) => (
                <CardItem key={card.id} card={card} onClick={onCardClick} />
              ))}
            </div>
          </SortableContext>
        </div>

        <div className="px-2 pb-2">
          {showAddCard ? (
            <form onSubmit={handleAddCard}>
              <textarea
                value={newCardTitle}
                onChange={(e) => setNewCardTitle(e.target.value)}
                placeholder="Enter a title for this card..."
                rows={2}
                className="w-full bg-[#22272B] border border-[#579DFF] rounded px-2 py-1.5 text-white text-sm focus:outline-none resize-none mb-1"
                autoFocus
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { handleAddCard(e); } }}
              />
              <div className="flex gap-1">
                <button
                  type="submit"
                  className="bg-[#579DFF] hover:bg-[#4C8FE8] text-[#1D2125] text-sm font-semibold px-3 py-1 rounded transition-colors"
                >
                  Add card
                </button>
                <button
                  type="button"
                  onClick={() => { setShowAddCard(false); setNewCardTitle(''); }}
                  className="text-[#9FADBC] hover:text-white px-2 text-sm"
                >
                  ✕
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowAddCard(true)}
              className="w-full text-[#9FADBC] hover:text-white hover:bg-[#A6C5E229] text-sm px-2 py-1 rounded transition-colors text-left"
            >
              + Add a card
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
