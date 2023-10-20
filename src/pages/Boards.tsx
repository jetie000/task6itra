import { useEffect } from "react";
import { useBoardStore } from "../stores/boardsStore";
import BoardCard from "./BoardCard";
import './Boards.css';
import UsernameModal from "./UsernameModal";
import AddBoardModal from "./AddBoardModal";
import { Modal } from "bootstrap";

function Boards() {
    const user = useBoardStore(state => state.user);
    const boards = useBoardStore(state => state.boards);

    const showAddModal = () => {
        const myModal = Modal.getOrCreateInstance(document.querySelector('#add-board-modal')!);
        myModal.toggle();
    }

    const showUsernameModal = () => {
        const myModal = Modal.getOrCreateInstance(document.querySelector('#modal')!);
        myModal.toggle();
    }

    return (
        <div className="position-absolute d-flex flex-column main-window">
            <div className="position-fixed start-0 end-0 d-flex flex-row justify-content-end align-items-center boards-header p-3">

                {
                    user ?
                        <>
                            <h4 className="mb-0 me-4">
                                Hi, {user}!
                            </h4>
                            <button className="btn btn-main fs-5" onClick={showUsernameModal}>
                                Set username
                            </button>
                        </> :
                        <button className="btn btn-main" onClick={showUsernameModal}>
                            Set username
                        </button>
                }
            </div>
            <div id='boards-list' className='row row-cols-auto'>
                {boards.length > 0 ?
                    <>
                        {boards.map(board => <BoardCard key={board.id} board={board} />)}
                        <div id="card-add col"
                            className="card card-board ms-3"
                            onClick={showAddModal}
                            >
                            <div className="card-body d-flex">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-plus-circle m-auto fs-1" viewBox="0 0 16 16">
                                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                                    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
                                </svg>
                            </div>
                        </div>
                    </>
                    :
                    <h3>Enter username to see boards</h3>
                }

            </div>
            <UsernameModal />
            <AddBoardModal />
        </div>
    );
}

export default Boards;