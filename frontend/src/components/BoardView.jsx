import { useState, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import {
  getLists,
  createList,
  updateList,
  deleteList,
  reorderLists,
  reorderCards,
  updateCard,
} from '../services/api';
import KanbanList from './KanbanList';
import CardItem from './CardItem';
import CardDetailModal from './CardDetailModal';
import SearchBar from './SearchBar';

export default function BoardView({ board, onBoardUpdate }) {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCard, setActiveCard] = useState(null);
  const [activeList, setActiveList] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [newListTitle, setNewListTitle] = useState('');
  const [showAddList, setShowAddList] = useState(false);
  const [searchResults, setSearchResults] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  useEffect(() => {
    fetchLists();
  }, [board.id]);

  const fetchLists = async () => {
    try {
      setLoading(true);
      const res = await getLists(board.id);
      setLists(res.data);
    } catch (err) {
      console.error('Failed to fetch lists', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddList = async (e) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;
    const res = await createList(board.id, { title: newListTitle.trim() });
    setLists((prev) => [...prev, res.data]);
    setNewListTitle('');
    setShowAddList(false);
  };

  const handleUpdateList = async (id, title) => {
    await updateList(id, { title });
    setLists((prev) => prev.map((l) => (l.id === id ? { ...l, title } : l)));
  };

  const handleDeleteList = async (id) => {
    if (!confirm('Delete this list and all its cards?')) return;
    await deleteList(id);
    setLists((prev) => prev.filter((l) => l.id !== id));
  };

  const handleCardCreate = (listId, newCard) => {
    setLists((prev) =>
      prev.map((l) => (l.id === listId ? { ...l, cards: [...(l.cards || []), newCard] } : l))
    );
  };

  const handleCardUpdate = (updatedCard) => {
    setLists((prev) =>
      prev.map((l) => ({
        ...l,
        cards: (l.cards || []).map((c) => (c.id === updatedCard.id ? updatedCard : c)),
      }))
    );
    if (selectedCard?.id === updatedCard.id) {
      setSelectedCard(updatedCard);
    }
  };

  const handleCardDelete = (cardId) => {
    setLists((prev) =>
      prev.map((l) => ({
        ...l,
        cards: (l.cards || []).filter((c) => c.id !== cardId),
      }))
    );
    setSelectedCard(null);
  };

  const findListForCard = (cardId) => {
    return lists.find((l) => l.cards?.some((c) => c.id === cardId));
  };

  const handleDragStart = ({ active }) => {
    const { type, card, list } = active.data.current || {};
    if (type === 'card') setActiveCard(card);
    if (type === 'list') setActiveList(list);
  };

  const handleDragOver = ({ active, over }) => {
    if (!over) return;
    const activeData = active.data.current;
    const overData = over.data.current;
    if (!activeData || activeData.type !== 'card') return;

    const activeListId = findListForCard(active.id)?.id;
    const overListId =
      overData?.type === 'card' ? findListForCard(over.id)?.id : over.id;

    if (!activeListId || !overListId || activeListId === overListId) return;

    setLists((prev) => {
      const sourceList = prev.find((l) => l.id === activeListId);
      const destList = prev.find((l) => l.id === overListId);
      if (!sourceList || !destList) return prev;

      const card = sourceList.cards.find((c) => c.id === active.id);
      if (!card) return prev;

      return prev.map((l) => {
        if (l.id === activeListId) {
          return { ...l, cards: l.cards.filter((c) => c.id !== active.id) };
        }
        if (l.id === overListId) {
          return { ...l, cards: [...l.cards, { ...card, listId: overListId }] };
        }
        return l;
      });
    });
  };

  const handleDragEnd = async ({ active, over }) => {
    setActiveCard(null);
    setActiveList(null);
    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (activeData?.type === 'list') {
      const oldIndex = lists.findIndex((l) => l.id === active.id);
      const newIndex = lists.findIndex((l) => l.id === over.id);
      if (oldIndex !== newIndex) {
        const newLists = arrayMove(lists, oldIndex, newIndex).map((l, i) => ({
          ...l,
          order: i,
        }));
        setLists(newLists);
        await reorderLists(newLists.map(({ id, order }) => ({ id, order })));
      }
      return;
    }

    if (activeData?.type === 'card') {
      const sourceList = findListForCard(active.id);
      if (!sourceList) return;

      const destListId =
        overData?.type === 'card'
          ? findListForCard(over.id)?.id
          : over.id;

      if (!destListId) return;
      const destList = lists.find((l) => l.id === destListId);
      if (!destList) return;

      if (sourceList.id === destList.id) {
        const oldIndex = sourceList.cards.findIndex((c) => c.id === active.id);
        const newIndex = destList.cards.findIndex((c) => c.id === over.id);
        if (oldIndex !== newIndex && newIndex !== -1) {
          const newCards = arrayMove(sourceList.cards, oldIndex, newIndex).map((c, i) => ({
            ...c,
            order: i,
          }));
          setLists((prev) =>
            prev.map((l) => (l.id === sourceList.id ? { ...l, cards: newCards } : l))
          );
          await reorderCards(newCards.map(({ id, order }) => ({ id, order, listId: sourceList.id })));
        }
      } else {
        const card = sourceList.cards.find((c) => c.id === active.id);
        if (!card) return;
        const updatedCard = { ...card, listId: destList.id };
        await updateCard(card.id, { listId: destList.id });
        const updatedLists = lists.map((l) => {
          if (l.id === sourceList.id) {
            return {
              ...l,
              cards: l.cards.filter((c) => c.id !== active.id).map((c, i) => ({ ...c, order: i })),
            };
          }
          if (l.id === destList.id) {
            const newCards = l.cards.filter((c) => c.id !== active.id);
            newCards.push({ ...updatedCard, order: newCards.length });
            return { ...l, cards: newCards };
          }
          return l;
        });
        setLists(updatedLists);
      }
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full text-white">Loading board...</div>;
  }

  const boardStyle = {
    backgroundColor: board.color,
    backgroundImage: `linear-gradient(135deg, ${board.color}cc 0%, ${board.color}88 100%)`,
  };

  return (
    <div className="flex flex-col h-full" style={boardStyle}>
      <div className="flex items-center gap-4 px-4 py-2 bg-black/20 backdrop-blur-sm">
        <h1 className="text-white font-bold text-lg">{board.title}</h1>
        <div className="ml-auto">
          <SearchBar boardId={board.id} onResults={setSearchResults} onClear={() => setSearchResults(null)} />
        </div>
      </div>

      {searchResults && (
        <div className="mx-4 my-2 bg-[#282E33] rounded-lg p-4 max-h-64 overflow-y-auto shadow-xl">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white text-sm font-semibold">{searchResults.length} result(s)</span>
            <button onClick={() => setSearchResults(null)} className="text-[#9FADBC] hover:text-white text-sm">Clear</button>
          </div>
          {searchResults.length === 0 ? (
            <p className="text-[#9FADBC] text-sm">No cards found</p>
          ) : (
            searchResults.map((card) => (
              <div
                key={card.id}
                onClick={() => { setSelectedCard(card); setSearchResults(null); }}
                className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-[#A6C5E229] cursor-pointer"
              >
                <span className="text-white text-sm">{card.title}</span>
                <span className="text-xs text-[#9FADBC] ml-auto">{card.list?.title}</span>
              </div>
            ))
          )}
        </div>
      )}

      <div className="flex-1 overflow-x-auto overflow-y-hidden p-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={lists.map((l) => l.id)}
            strategy={horizontalListSortingStrategy}
          >
            <div className="flex gap-3 h-full items-start">
              {lists.map((list) => (
                <KanbanList
                  key={list.id}
                  list={list}
                  onUpdateTitle={handleUpdateList}
                  onDelete={handleDeleteList}
                  onCardCreate={handleCardCreate}
                  onCardClick={setSelectedCard}
                />
              ))}

              <div className="shrink-0 w-64">
                {showAddList ? (
                  <form onSubmit={handleAddList} className="bg-[#282E33] rounded-xl p-2">
                    <input
                      type="text"
                      value={newListTitle}
                      onChange={(e) => setNewListTitle(e.target.value)}
                      placeholder="Enter list title..."
                      className="w-full bg-[#22272B] border border-[#579DFF] rounded px-2 py-1.5 text-white text-sm focus:outline-none mb-2"
                      autoFocus
                    />
                    <div className="flex gap-1">
                      <button
                        type="submit"
                        className="bg-[#579DFF] hover:bg-[#4C8FE8] text-[#1D2125] text-sm font-semibold px-3 py-1 rounded transition-colors"
                      >
                        Add list
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowAddList(false); setNewListTitle(''); }}
                        className="text-[#9FADBC] hover:text-white px-2 py-1 text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => setShowAddList(true)}
                    className="w-full bg-white/10 hover:bg-white/20 text-white text-sm font-medium px-3 py-2 rounded-xl transition-colors text-left"
                  >
                    + Add a list
                  </button>
                )}
              </div>
            </div>
          </SortableContext>

          <DragOverlay>
            {activeCard && (
              <div className="rotate-3 opacity-90 scale-105">
                <CardItem card={activeCard} onClick={() => {}} isDragging />
              </div>
            )}
            {activeList && (
              <div className="opacity-90 scale-105">
                <KanbanList list={activeList} onUpdateTitle={() => {}} onDelete={() => {}} onCardCreate={() => {}} onCardClick={() => {}} isDragging />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {selectedCard && (
        <CardDetailModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          onUpdate={handleCardUpdate}
          onDelete={handleCardDelete}
        />
      )}
    </div>
  );
}
