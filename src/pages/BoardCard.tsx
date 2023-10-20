import { useNavigate } from "react-router-dom";
import { IBoard } from "../interfaces/board.interface";
import './Boards.css';
import { useBoardStore } from "../stores/boardsStore";

function BoardCard({ board }: { board: IBoard }) {
    const setCurrentBoard = useBoardStore(state => state.setCurrentBoard);
    const navigate = useNavigate();
    const clickNavigateHandler = () =>{
        navigate('/boards/'+board.id);
        setCurrentBoard(board);
    }

    return (
        <div id={"card-board"+board.id} className="card card-board me-3 ms-3 mb-5">
            <img src="..." className="card-img-top" alt="..." />
            <div className="card-body d-flex flex-column">
                <h5 className="card-title">{board.name}</h5>
                <p className="card-text">Creator: {board.creator}</p>
                <button onClick={clickNavigateHandler} className="btn btn-primary">Enter</button>
            </div>
        </div>
    );
}

export default BoardCard;