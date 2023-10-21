import { useNavigate } from "react-router-dom";
import { IBoard } from "../interfaces/board.interface";
import './Boards.css';
import { useBoardStore } from "../stores/boardsStore";
import React, { useEffect, useState } from "react";

function BoardCard({ board }: { board: IBoard }) {
    const setCurrentBoardId = useBoardStore(state => state.setCurrentBoardId);

    const clickNavigateHandler = (e: React.MouseEvent<HTMLButtonElement>) =>{
        e.currentTarget.textContent = 'Loading...';
        setTimeout(function () {
            setCurrentBoardId(board.id);
        }, 15);
    }
    

    return (
        <div id={"card-board"+board.id} className="card card-board me-3 ms-3 mb-5">
            <img src="..." className="card-img-top" alt="..." />
            <div className="card-body d-flex flex-column">
                <h5 className="card-title">{board.name}</h5>
                <p className="card-text">Creator: {board.creator}</p>
                <button onClick={e => clickNavigateHandler(e)} className="btn btn-primary">Enter</button>
            </div>
        </div>
    );
}

export default BoardCard;