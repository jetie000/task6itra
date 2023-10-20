import { create } from 'zustand';
import { variables } from '../Variables';
import { IBoard } from '../interfaces/board.interface';
import { IDrawing } from '../interfaces/drawing.interface';

interface BoardState {
    user: string
    setUser: (user: string) => void
    currentBoard: IBoard
    setCurrentBoard: (board: IBoard) => void
    users: string[]
    boards: IBoard[]
    setBoards: () => void
    addBoard: (boardName: string) => void
    drawings: IDrawing[]
    setDrawings: () => void
    width: number
    setWidth: (width: number) => void
    strokeColor: string
    setStrokeColor: (color: string) => void 
    fillColor: string
    setFillColor: (color: string) => void 
}

export const useBoardStore = create<BoardState>((set, get) => ({
    user: localStorage.getItem(variables.$USER)!,
    setUser: (user: string) => {
        localStorage.setItem(variables.$USER, user);
        set({
            user: user
        })
        get().setDrawings();
        get().setBoards()
    },
    currentBoard: JSON.parse(localStorage.getItem(variables.$CURRENT_BOARD)!),
    setCurrentBoard: (board: IBoard) => {
        localStorage.setItem(variables.$CURRENT_BOARD, JSON.stringify(board));
        set({
            currentBoard: board
        })
    },
    boards: [],
    setBoards: async () => {
        if (get().user) {
            let response = await fetch(variables.API_URL + '/Board/getboards');
            let data = await response.json();
            set({
                boards: data
            })
        }
    },
    addBoard: async (boardName: string) => {
        await fetch(variables.API_URL + '/Board/postboard', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "id": 0,
                "name": boardName,
                "creator": get().user,
                "drawings": []
              })
        })
        get().setBoards();
    },
    users: [],
    drawings: [],
    setDrawings: async () => {
        if (get().user) {
            let response = await fetch(variables.API_URL + '/Board/getdraws?username=' + get().user);
            let data = await response.json();
            set({
                drawings: data
            })
        }
    },
    width: Number(localStorage.getItem(variables.$WIDTH)) || 1,
    setWidth: (width: number) => {
        localStorage.setItem(variables.$WIDTH, String(width));
        set({
            width: width
        })
    },
    strokeColor: localStorage.getItem(variables.$STROKE_COLOR) || '#fff',
    setStrokeColor: (color: string) => {
        localStorage.setItem(variables.$STROKE_COLOR, color);
        set({
            strokeColor: color
        })
    },
    fillColor: localStorage.getItem(variables.$FILL_COLOR) || '#fff',
    setFillColor: (color: string) => {
        localStorage.setItem(variables.$FILL_COLOR, color);
        set({
            fillColor: color
        })
    }
}))