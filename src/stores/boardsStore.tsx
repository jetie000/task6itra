import { create } from 'zustand';
import { variables } from '../Variables';
import { IBoard } from '../interfaces/board.interface';
import { IDrawing } from '../interfaces/drawing.interface';
import { HttpTransportType, HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import React, { useRef } from 'react';

interface BoardState {
    user: string
    setUser: (user: string) => void
    currentBoardId: number
    setCurrentBoardId: (boardId: number) => void
    getCurrentBoardId: () => number
    currentBoardUsers: string[]
    setCurrentBoardUsers: (user: string) => void
    deleteCurrentBoardUser: (userName: string) => void
    leaveBoard: () => void
    boards: IBoard[]
    setBoards: () => void
    addBoard: (boardName: string) => void
    drawings: IDrawing[]
    setDrawings: () => void
    addDrawing: (drawing: IDrawing) => void
    removeDrawing: () => void
    removeOthDrawing: (username: string) => void
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
    ctx: CanvasRenderingContext2D | null
    setCtx: (ctx: CanvasRenderingContext2D) => void
    getCtx: () =>  CanvasRenderingContext2D | null
    connection: HubConnection
    setConnection: (conn: HubConnection) => void
    drawDrawing: (ctx: CanvasRenderingContext2D, drawing: IDrawing) => void
    drawDrawings: (ctx: CanvasRenderingContext2D) => void
    savePhoto: () => void
    canvasRef: HTMLCanvasElement | null,
    setCanvasRef: (canvasRef: HTMLCanvasElement) => void
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
    getCurrentBoardId: () => get().currentBoardId,
    currentBoardUsers: [],
    setCurrentBoardUsers: (user: string) => {
        if (get().currentBoardUsers.includes(user) == false)
            set((state) => ({
                currentBoardUsers: [...state.currentBoardUsers, user]
            }))
    },
    deleteCurrentBoardUser: (userName: string) => {
        set((state) => ({
            currentBoardUsers: [...state.currentBoardUsers.filter(user => user != userName)]
        }))
    },
    leaveBoard: () => {
        localStorage.removeItem(variables.$CURRENT_BOARD);
        set({
            currentBoardId: undefined,
            currentBoardUsers: []
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
    removeDrawing: async () => {
        set({
            boards: get().boards.map((board) => {
                if(board.id == get().currentBoardId){
                    let index = board.drawings.findLastIndex(drawingB => drawingB.username == get().user);
                    board.drawings = board.drawings.slice(0,index).concat(board.drawings.slice(index+1));
                }
                return board;
            })
        })
        await fetch(variables.API_URL + '/Board/deletedraw?boardId=' + get().currentBoardId+'&userName='+get().user, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
        let currRrawing = get().boards.find(board => board.id == get().currentBoardId)!.drawings.findLast(drawingB => drawingB.username == get().user);
        get().connection!.invoke("CancelDrawing", {
            UserName: get().user,
            RoomIdCon: String(get().currentBoardId),
            DrawingCon: {
                id: get().boards.find(board => board.id == get().currentBoardId)!.drawings.length > 0
                    ? get().boards.find(board => board.id == get().currentBoardId)!
                        .drawings[get().boards.find(board => board.id == get().currentBoardId)?.drawings.length! - 1]
                        .id + 1
                    : 0,
                type: currRrawing?.type,
                lineWidth: currRrawing?.lineWidth,
                strokeColor: currRrawing?.strokeColor,
                fillColor: currRrawing?.fillColor,
                posX: currRrawing?.posX,
                posY: currRrawing?.posY,
                username: currRrawing?.username
            }
        })
        console.log(currRrawing);
    },
    removeOthDrawing: (username: string) => {
        set({
            boards: get().boards.map((board) => {
                if(board.id == get().currentBoardId){
                    let index = board.drawings.findLastIndex(drawingB => drawingB.username == username);
                    board.drawings = board.drawings.slice(0,index).concat(board.drawings.slice(index+1));
                }
                return board;
            })
        })
    },
    width: Number(localStorage.getItem(variables.$WIDTH)) || 1,
    setWidth: (width: number) => {
        localStorage.setItem(variables.$WIDTH, String(width));
        set({
            width: width
        })
    },
    strokeColor: localStorage.getItem(variables.$STROKE_COLOR) || '#000',
    setStrokeColor: (color: string) => {
        localStorage.setItem(variables.$STROKE_COLOR, color);
        set({
            strokeColor: color
        })
    },
    fillColor: localStorage.getItem(variables.$FILL_COLOR) || '#000',
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
    connection: new HubConnectionBuilder()
        .withUrl(variables.SOCKET_URL, {
            skipNegotiation: true,
            transport: HttpTransportType.WebSockets
        }
        )
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Information)
        .build(),
    setConnection: (conn: HubConnection) => {
        set({
            connection: conn
        })
    },
    drawDrawing: (ctx: CanvasRenderingContext2D, drawing: IDrawing) => {
        ctx!.lineWidth = drawing.lineWidth;
        ctx!.strokeStyle = drawing.strokeColor;
        ctx!.fillStyle = drawing.fillColor;
        ctx!.lineCap = 'round';
        ctx!.lineJoin = 'round';
        ctx.beginPath();
        switch (drawing.type) {
            case 'line': case 'eraser':
                for (let i = 0; i < drawing.posX.length; i++) {
                    ctx.lineTo(drawing.posX[i], drawing.posY[i]);
                    ctx.stroke();
                }
                break;
            case 'rectangle':
                drawing.posX[2] ? ctx.fillRect(drawing.posX[1], drawing.posY[1], drawing.posX[0] - drawing.posX[1], drawing.posY[0] - drawing.posY[1])
                    : ctx.strokeRect(drawing.posX[1], drawing.posY[1], drawing.posX[0] - drawing.posX[1], drawing.posY[0] - drawing.posY[1]);
                break;
            case 'circle':
                let radius = Math.sqrt(Math.pow(drawing.posX[0] - drawing.posX[1], 2) + Math.pow(drawing.posY[0] - drawing.posY[1], 2));
                ctx.arc(drawing.posX[0], drawing.posY[0], radius, 0, 2 * Math.PI);
                drawing.posX[2]
                    ? ctx.fill()
                    : ctx.stroke();
                break;
            case 'triangle':
                ctx.moveTo(drawing.posX[0], drawing.posY[0]);
                ctx.lineTo(drawing.posX[1], drawing.posY[1]);
                ctx.lineTo(drawing.posX[0] * 2 - drawing.posX[1], drawing.posY[1]);
                ctx.closePath();
                drawing.posX[2]
                    ? ctx.fill()
                    : ctx.stroke();
                break;
        }
        ctx!.lineWidth = get().width;
        ctx!.strokeStyle = get().strokeColor;
        ctx!.fillStyle = get().fillColor;
    },
    ctx: null,
    setCtx: (ctx: CanvasRenderingContext2D) => {
        set({
            ctx: ctx
        })
    },
    getCtx: () => get().ctx,
    drawDrawings: (ctx: CanvasRenderingContext2D) => {
        ctx!.fillStyle = '#fff';
        ctx.beginPath();
        ctx.fillRect(0, 0, document.getElementById('canvas')?.clientWidth!, document.getElementById('canvas')?.clientHeight!)
        let currentBoard = get().boards.find(board => board.id == get().currentBoardId);
        for (let drawing of currentBoard?.drawings!) {
            get().drawDrawing(ctx, drawing);
        }
        ctx!.lineWidth = get().width;
        ctx!.strokeStyle = get().strokeColor;
        ctx!.fillStyle = get().fillColor;
        ctx!.lineCap = 'round';
        ctx!.lineJoin = 'round';
    },
    savePhoto: () => {
        const link = document.createElement('a');
        link.download = `${Date.now()}.jpg`;
        link.href = get().canvasRef!.toDataURL();
        link.click();
    },
    canvasRef: null,
    setCanvasRef: (canvasRef: HTMLCanvasElement) => {
        set({
            canvasRef: canvasRef
        })
    },
}))