import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import Boards from './pages/Boards';
import { useBoardStore } from './stores/boardsStore';
import Board from './pages/Board';
import { useEffect } from 'react';

function App() {
  const user = useBoardStore(state => state.user);
  const boards = useBoardStore(state => state.boards);
  const currentBoardId = useBoardStore(state => state.currentBoardId);
  const setBoards = useBoardStore(state => state.setBoards);
  const setDrawings = useBoardStore(state => state.setDrawings);

  useEffect(() => {
    setBoards();
    setDrawings();
  }, []);

  useEffect(() => {
    setBoards();
    setDrawings();
  }, [user]);

  let currentBoardIdPath = currentBoardId || '';
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/boards' element={<Boards />} />
        {boards.length > 0 && boards.map(board => <Route key={board.id} path={'/boards/' + board.id} element={<Board />} />)}
        <Route path='*' element={<Navigate to={'/boards/' + currentBoardIdPath} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
