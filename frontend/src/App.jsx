import { useState, useEffect } from 'react';
import { getBoards, createBoard } from './services/api';
import BoardList from './components/BoardList';
import BoardView from './components/BoardView';
import CreateBoardModal from './components/CreateBoardModal';

function App() {
  const [boards, setBoards] = useState([]);
  const [selectedBoardId, setSelectedBoardId] = useState(null);
  const [showCreateBoard, setShowCreateBoard] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      const res = await getBoards();
      setBoards(res.data);
      if (res.data.length > 0 && !selectedBoardId) {
        setSelectedBoardId(res.data[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch boards', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBoard = async (data) => {
    const res = await createBoard(data);
    setBoards((prev) => [res.data, ...prev]);
    setSelectedBoardId(res.data.id);
    setShowCreateBoard(false);
  };

  const selectedBoard = boards.find((b) => b.id === selectedBoardId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#1D2125]">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#1D2125]">
      <header className="flex items-center px-4 h-12 bg-[#1D2125] border-b border-[#2C333A] shrink-0">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setSelectedBoardId(null)}>
          <div className="w-6 h-6 bg-[#0079BF] rounded flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="3" width="7" height="11" rx="1"/>
              <rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
          </div>
          <span className="text-white font-bold text-lg">KanbanApp</span>
        </div>
        <div className="ml-auto">
          <button
            onClick={() => setShowCreateBoard(true)}
            className="bg-[#579DFF] hover:bg-[#4C8FE8] text-[#1D2125] font-semibold text-sm px-3 py-1.5 rounded transition-colors"
          >
            + Create
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 bg-[#161A1D] border-r border-[#2C333A] flex flex-col shrink-0">
          <div className="p-3">
            <div className="text-xs font-semibold text-[#9FADBC] uppercase tracking-wider mb-2 px-2">
              Your Boards
            </div>
            <BoardList
              boards={boards}
              selectedBoardId={selectedBoardId}
              onSelectBoard={setSelectedBoardId}
              onBoardsChange={setBoards}
            />
          </div>
        </aside>

        <main className="flex-1 overflow-hidden">
          {selectedBoard ? (
            <BoardView
              key={selectedBoard.id}
              board={selectedBoard}
              onBoardUpdate={(updated) =>
                setBoards((prev) => prev.map((b) => (b.id === updated.id ? updated : b)))
              }
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-[#9FADBC]">
              <div className="text-5xl mb-4">📋</div>
              <h2 className="text-xl font-semibold text-white mb-2">Welcome to KanbanApp</h2>
              <p className="text-sm mb-4">Select a board or create a new one to get started</p>
              <button
                onClick={() => setShowCreateBoard(true)}
                className="bg-[#579DFF] hover:bg-[#4C8FE8] text-[#1D2125] font-semibold px-4 py-2 rounded transition-colors"
              >
                Create your first board
              </button>
            </div>
          )}
        </main>
      </div>

      {showCreateBoard && (
        <CreateBoardModal
          onClose={() => setShowCreateBoard(false)}
          onCreate={handleCreateBoard}
        />
      )}
    </div>
  );
}

export default App;
