import { Modal } from "bootstrap";
import { useBoardStore } from "../stores/boardsStore";

function AddModalModal() {

    const addBoard = useBoardStore(state => state.addBoard);
    const setUserHandler = () => {
        let value = (document.getElementById('input-board-name') as HTMLInputElement).value;
        if (value === '') {
            return;
        }
        else{
            addBoard(value);
            (document.getElementById('input-board-name') as HTMLInputElement).value = '';
            validateHandler();
            const myModal = Modal.getOrCreateInstance(document.querySelector('#add-board-modal')!);
            myModal.toggle();
        }
    }
    const validateHandler = () => {
        let value = (document.getElementById('input-board-name') as HTMLInputElement).value;
        if (value === '') {
            document.getElementById('input-board-name')?.classList.add('is-invalid');
            document.getElementById('input-board-name')?.classList.remove('is-valid');
        }
        else{
            document.getElementById('input-board-name')?.classList.remove('is-invalid');
            document.getElementById('input-board-name')?.classList.add('is-valid');
        }
    }
    
    return (
        <div className="modal fade" id='add-board-modal' tabIndex={-1} role="dialog" aria-hidden="true" aria-labelledby="modalLabel">
            <div className="modal-dialog modal-sm modal-dialog-centered" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="modalLabel">
                            Create board
                        </h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body d-flex flex-column">
                        <input id="input-board-name" type="text" className="form-control is-invalid" onChange={validateHandler} required />
                        <div id="input-board-nameFeedback" className="invalid-feedback">
                            Please choose a board name.
                        </div>
                        <div id="input-board-nameFeedback" className="valid-feedback">
                            Nice board name!
                        </div>
                        <button
                            onClick={setUserHandler}
                            className="btn btn-second mt-1">
                            Set
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AddModalModal;