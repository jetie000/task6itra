import { create } from 'zustand';
import { variables } from '../Variables';
import { IBoard } from '../interfaces/board.interface';
import { IDrawing } from '../interfaces/drawing.interface';

interface BoardState {
    user: string
    setUser: (user: string) => void
    currentBoardId: number
    setCurrentBoardId: (boardId: number) => void
    leaveBoard: () => void
    users: string[]
    boards: IBoard[]
    setBoards: () => void
    addBoard: (boardName: string) => void
    drawings: IDrawing[]
    setDrawings: () => void
    addDrawing: (drawing: IDrawing) => void
    addMyDrawing: (drawing: IDrawing) => void
    width: number
    setWidth: (width: number) => void
    strokeColor: string
    setStrokeColor: (color: string) => void
    fillColor: string
    setFillColor: (color: string) => void
    isFill: boolean
    setIsFill: (isFill: boolean) => void
    currentTool: string
    setCurrentTool: (tool: string) => void
    scale: number
    setScale: (isUp: boolean) => void
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
    currentBoardId: Number(localStorage.getItem(variables.$CURRENT_BOARD))!,
    setCurrentBoardId: (boardId: number) => {
        localStorage.setItem(variables.$CURRENT_BOARD, String(boardId));
        set({
            currentBoardId: boardId
        })
    },
    leaveBoard: () => {
        localStorage.removeItem(variables.$CURRENT_BOARD);
        set({
            currentBoardId: undefined
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
    addMyDrawing: async (drawing: IDrawing) => {
        await fetch(variables.API_URL + '/Board/postdraw?boardId=' + get().currentBoardId, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: 0,
                type: drawing.type,
                lineWidth: drawing.lineWidth,
                strokeColor: drawing.strokeColor,
                fillColor: drawing.fillColor,
                posX: drawing.posX,
                posY: drawing.posY,
                username: drawing.username
            })
        })
        get().boards.find(board => board.id == get().currentBoardId)?.drawings.push(drawing);
        set((state) => ({
            drawings: [...state.drawings, drawing],
        }))
    },
    addDrawing: (drawing: IDrawing) => {
        get().boards.find(board => board.id == get().currentBoardId)?.drawings.push(drawing);
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
    },
    isFill: localStorage.getItem(variables.$IS_FILL) === 'true' || false,
    setIsFill: (isFill: boolean) => {
        localStorage.setItem(variables.$IS_FILL, String(isFill));
        set({
            isFill: isFill
        })
    },
    currentTool: 'line',
    setCurrentTool: (tool: string) => {
        set({
            currentTool: tool
        })
    },
    scale: 1,
    setScale: (isUp: Boolean) => {
        if (isUp)
            set({
                scale: get().scale + 0.3 < 5 ? get().scale + 0.3 : get().scale
            })
        else
            set({
                scale: get().scale - 0.3 >= 1 ? get().scale - 0.3 : get().scale
            })
    },
}))