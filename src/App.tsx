import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import Boards from './pages/Boards';
import { useBoardStore } from './stores/boardsStore';
import Board from './pages/Board';
import { useEffect } from 'react';
import { IDrawing } from './interfaces/drawing.interface';

function App() {
  const user = useBoardStore(state => state.user);
  const boards = useBoardStore(state => state.boards);
  const currentBoardId = useBoardStore(state => state.currentBoardId);
  const getCurrentBoardId = useBoardStore(state => state.getCurrentBoardId);
  const setBoards = useBoardStore(state => state.setBoards);
  const setDrawings = useBoardStore(state => state.setDrawings);
  const connection = useBoardStore(state => state.connection);
  const setConnection = useBoardStore(state => state.setConnection);
  const setCurrentBoardUsers = useBoardStore(state => state.setCurrentBoardUsers);
  const deleteCurrentBoardUser = useBoardStore(state => state.deleteCurrentBoardUser);
  const addDrawing = useBoardStore(state => state.addDrawing);
  const drawDrawing = useBoardStore(state => state.drawDrawing);
  const removeOthDrawing = useBoardStore(state => state.removeOthDrawing);
  const drawDrawings = useBoardStore(state => state.drawDrawings);
  const ctx = useBoardStore(state => state.ctx);
  const getCtx = useBoardStore(state => state.getCtx);

  useEffect(() => {
    setBoards();
    setDrawings();
    connection.on("JoinMessage", async (message: string) => {
      console.log('message: ' + message);
      let RoomIdCon = String(getCurrentBoardId());
      console.log('current board id: '+ String(getCurrentBoardId()));
      let UserName = user;
      await connection.invoke("SendUsername", { UserName, RoomIdCon })
    });
    connection.on("ReceiveMessage", (drawing: IDrawing) => {
      if (drawing.username != user) {
        addDrawing(drawing);
        drawDrawing(getCtx()!, drawing);
      }
    });
    connection.on("ReceiveUsernameMessage", (userName: string) => {
      setCurrentBoardUsers(userName);
    });
    connection.on("LeaveMessage", (userName: string) => {
      deleteCurrentBoardUser(userName);
    })
    connection.on("CancelDrawingMessage", (drawing: IDrawing) => {
      if(drawing.username != user){
        removeOthDrawing(drawing.username);
        drawDrawings(getCtx()!);
      }
    })
    setConnection(connection);
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
