import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Boards from './pages/Boards';
import { useBoardStore } from './stores/boardsStore';
import Board from './pages/Board';
import { useEffect } from 'react';

function App() {
const user = useBoardStore(state => state.user);
const boards = useBoardStore(state => state.boards);
const currentBoard = useBoardStore(state => state.currentBoard);
const setBoards = useBoardStore(state => state.setBoards);
const setDrawings = useBoardStore(state => state.setDrawings);

useEffect(() => {
    setBoards();
    setDrawings();
}, [])

useEffect(() => {
    setBoards();
    setDrawings();
}, [user])


useEffect(()=>{
  console.log(boards);
},[boards]);

  let currentBoardId = currentBoard?.id || '';
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/boards' element={<Boards />} />
        {boards.length > 0 && boards.map(board => <Route key={board.id} path={'/boards/'+board.id} element={<Board board={board}/>} />)}
        <Route path='*' element={<Navigate to={'/boards/'+ currentBoardId} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
