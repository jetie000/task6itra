import { useBoardStore } from "../stores/boardsStore";
import {Modal} from 'bootstrap'

function UsernameModal() {
    const setUser = useBoardStore(state => state.setUser);
    const setUserHandler = () => {
        let value = (document.getElementById('input-username') as HTMLInputElement).value;
        if (value === '') {
            return;
        }
        else{
            setUser(value);
            (document.getElementById('input-username') as HTMLInputElement).value = '';
            validateHandler();
            const myModal = Modal.getOrCreateInstance(document.querySelector('#modal')!);
            myModal.toggle();
        }
    }
    const validateHandler = () => {
        let value = (document.getElementById('input-username') as HTMLInputElement).value;
        if (value === '') {
            document.getElementById('input-username')?.classList.add('is-invalid');
            document.getElementById('input-username')?.classList.remove('is-valid');
        }
        else{
            document.getElementById('input-username')?.classList.remove('is-invalid');
            document.getElementById('input-username')?.classList.add('is-valid');
        }
    }

    return (
        <div className="modal fade" id='modal' tabIndex={-1} role="dialog" aria-hidden="true" aria-labelledby="modalLabel">
            <div className="modal-dialog modal-sm modal-dialog-centered" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="modalLabel">
                            Set username
                        </h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body d-flex flex-column">
                        <input id="input-username" type="text" className="form-control is-invalid" onChange={validateHandler} required />
                        <div id="input-usernameFeedback" className="invalid-feedback">
                            Please choose a username.
                        </div>
                        <div id="input-usernameFeedback" className="valid-feedback">
                            Nice username!
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

export default UsernameModal;