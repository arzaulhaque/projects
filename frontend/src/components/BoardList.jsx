import { deleteBoard } from '../services/api';

export default function BoardList({ boards, selectedBoardId, onSelectBoard, onBoardsChange }) {
  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!confirm('Delete this board?')) return;
    await deleteBoard(id);
    onBoardsChange((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <div className="space-y-0.5">
      {boards.map((board) => (
        <div
          key={board.id}
          onClick={() => onSelectBoard(board.id)}
          className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer group transition-colors ${
            selectedBoardId === board.id
              ? 'bg-[#579DFF22] text-white'
              : 'hover:bg-[#A6C5E229] text-[#B6C2CF]'
          }`}
        >
          <div
            className="w-5 h-5 rounded shrink-0"
            style={{ backgroundColor: board.color || '#0079BF' }}
          />
          <span className="text-sm font-medium truncate flex-1">{board.title}</span>
          <button
            onClick={(e) => handleDelete(e, board.id)}
            className="opacity-0 group-hover:opacity-100 text-[#9FADBC] hover:text-red-400 text-xs px-1 transition-opacity"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
