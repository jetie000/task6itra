import React, { useRef, useEffect, useState } from 'react';
import { useBoardStore } from '../stores/boardsStore';
import { HttpTransportType, HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { IDrawing } from '../interfaces/drawing.interface';
import { variables } from '../Variables';

const Canvas = () => {
    let canvasRef = useRef<HTMLCanvasElement | null>(null);
    let canvasCtxRef = React.useRef<CanvasRenderingContext2D | null>(null);
    const user = useBoardStore(state => state.user);
    const boards = useBoardStore(state => state.boards);
    const currentBoardId = useBoardStore(state => state.currentBoardId);
    const width = useBoardStore(state => state.width);
    const strokeColor = useBoardStore(state => state.strokeColor);
    const fillColor = useBoardStore(state => state.fillColor);
    const currentTool = useBoardStore(state => state.currentTool);
    const isFill = useBoardStore(state => state.isFill);
    const scale = useBoardStore(state => state.scale);
    const addMyDrawing = useBoardStore(state => state.addMyDrawing);
    const addDrawing = useBoardStore(state => state.addDrawing);

    useEffect(() => {
        if (canvasRef.current) {
            canvasRef.current.width = document.getElementById('canvas')?.clientWidth!;
            canvasRef.current.height = document.getElementById('canvas')?.clientHeight!;
            canvasCtxRef.current = canvasRef.current.getContext('2d');
            let ctx = canvasCtxRef.current;
            drawDrawings(ctx!);
            ctx!.lineWidth = width;
            ctx!.strokeStyle = strokeColor;
            ctx!.fillStyle = fillColor;
            ctx!.lineCap = 'round';
            ctx!.lineJoin = 'round';
            if (isFill) {
                const link = document.createElement('a');
                link.download = `${Date.now()}.jpg`;
                console.log(canvasRef.current)
                link.href = canvasRef.current.toDataURL();
                link.click();
            }
            joinRoom(user);
        }
    }, []);

    useEffect(() => {
        if (canvasRef.current) {
            let ctx = canvasCtxRef.current;
            ctx!.lineWidth = width;
            ctx!.strokeStyle = strokeColor;
            ctx!.fillStyle = fillColor;
            ctx!.lineCap = 'round';
            ctx!.lineJoin = 'round';
        }
    }, [width, strokeColor, fillColor]);

    useEffect(() => {
        document.getElementById('canvas')?.style.setProperty('--scale', String(scale));
    }, [scale])

    const [connection, setConnection] = useState<HubConnection>();

    const joinRoom = async (UserName: string) => {
        try {
            const connection = new HubConnectionBuilder()
                .withUrl(variables.SOCKET_URL, {
                    skipNegotiation: true,
                    transport: HttpTransportType.WebSockets
                }
                )
                .withAutomaticReconnect()
                .configureLogging(LogLevel.Information)
                .build();
            connection.on("JoinMessage", (message: string) => {
                console.log('message: ' + message);
                
            });
            connection.on("ReceiveMessage", (drawing: IDrawing) => {
                if(drawing.username != user){
                    addDrawing(drawing);
                    drawDrawing(canvasCtxRef.current!, drawing);
                }
                console.log(drawing);
            });
            await connection.start();
            let RoomIdCon = String(currentBoardId);
            await connection.invoke("JoinRoom", { UserName, RoomIdCon });
            setConnection(connection);
        }
        catch (e) {
            console.log(e);
        }
    }

    const drawDrawings = (ctx: CanvasRenderingContext2D) => {
        let currentBoard = boards.find(board => board.id == currentBoardId);
        for (let drawing of currentBoard?.drawings!) {
            drawDrawing(ctx, drawing);
        }
    }

    const drawDrawing = (ctx: CanvasRenderingContext2D, drawing: IDrawing) => {
        ctx!.lineWidth = drawing.lineWidth;
        ctx!.strokeStyle = drawing.strokeColor;
        ctx!.fillStyle = drawing.fillColor;
        ctx!.lineCap = 'round';
        ctx!.lineJoin = 'round';
        ctx.beginPath();
        switch (drawing.type) {
            case 'line': case 'eraser':
                for (let i = 0; i < drawing.posX.length; i++) {
                    canvasCtxRef.current?.lineTo(drawing.posX[i], drawing.posY[i]);
                    canvasCtxRef.current?.stroke();
                }
                break;
            case 'rectangle':
                drawing.posX[2] ? canvasCtxRef.current?.fillRect(drawing.posX[1], drawing.posY[1], drawing.posX[0] - drawing.posX[1], drawing.posY[0] - drawing.posY[1])
                    : canvasCtxRef.current?.strokeRect(drawing.posX[1], drawing.posY[1], drawing.posX[0] - drawing.posX[1], drawing.posY[0] - drawing.posY[1]);
                break;
            case 'circle':
                let radius = Math.sqrt(Math.pow(drawing.posX[0] - drawing.posX[1], 2) + Math.pow(drawing.posY[0] - drawing.posY[1], 2));
                canvasCtxRef.current?.arc(drawing.posX[0], drawing.posY[0], radius, 0, 2 * Math.PI);
                drawing.posX[2]
                    ? canvasCtxRef.current?.fill()
                    : canvasCtxRef.current?.stroke();
                break;
            case 'triangle':
                ctx.moveTo(drawing.posX[0], drawing.posY[0]);
                ctx.lineTo(drawing.posX[1], drawing.posY[1]);
                ctx.lineTo(drawing.posX[0] * 2 - drawing.posX[1], drawing.posY[1]);
                ctx.closePath();
                drawing.posX[2]
                    ? canvasCtxRef.current?.fill()
                    : canvasCtxRef.current?.stroke();
                break;
        }
    }

    let isDrawing = false;
    let posX: number[] = [], posY: number[] = [];
    let posXmove: number = 0, posYmove: number = 0;
    let snapshot: ImageData;

    const startDraw = (e: React.MouseEvent) => {
        isDrawing = true;
        posX = [];
        posY = [];
        switch (currentTool) {
            case 'line':
                canvasCtxRef.current?.beginPath();
                console.log('start drawing ' + e.pageX + ' ' + e.pageY);
                break;
            case 'eraser':
                canvasCtxRef.current!.strokeStyle = '#ffffff';
                canvasCtxRef.current?.beginPath();
                console.log('start erasing ' + e.pageX + ' ' + e.pageY);
                break;
            case 'rectangle': case 'circle': case 'triangle':
                canvasCtxRef.current?.beginPath();
                snapshot = canvasCtxRef.current?.getImageData(0, 0, document.getElementById('canvas')?.clientWidth!, document.getElementById('canvas')?.clientHeight!)!;
                posX.push(e.pageX);
                posY.push(e.pageY);
                break;
            case 'move':
                posXmove = e.pageX;
                posYmove = e.pageY;
        }
    }

    var scheduled = false;
    const drawingEvent = (e: React.MouseEvent) => {
        if (currentTool == 'move') {
            drawing(e);
            return;
        }
        if (!scheduled) {
            scheduled = true;
            setTimeout(function () {
                scheduled = false;
                drawing(e);
            }, 15);
        }
    };

    const drawing = (e: React.MouseEvent) => {
        if (!isDrawing)
            return;
        switch (currentTool) {
            case 'line': case 'eraser':
                posX.push(e.pageX);
                posY.push(e.pageY);
                canvasCtxRef.current?.lineTo(e.pageX, e.pageY);
                canvasCtxRef.current?.stroke();
                break;
            case 'rectangle':
                canvasCtxRef.current?.putImageData(snapshot, 0, 0);
                isFill
                    ? canvasCtxRef.current?.fillRect(e.pageX, e.clientY, posX[0] - e.pageX, posY[0] - e.pageY)
                    : canvasCtxRef.current?.strokeRect(e.pageX, e.clientY, posX[0] - e.pageX, posY[0] - e.pageY);
                break;
            case 'circle':
                canvasCtxRef.current?.putImageData(snapshot, 0, 0);
                canvasCtxRef.current?.beginPath();
                let radius = Math.sqrt(Math.pow(posX[0] - e.pageX, 2) + Math.pow(posY[0] - e.pageY, 2));
                canvasCtxRef.current?.arc(posX[0], posY[0], radius, 0, 2 * Math.PI);
                isFill
                    ? canvasCtxRef.current?.fill()
                    : canvasCtxRef.current?.stroke();
                break;
            case 'triangle':
                canvasCtxRef.current?.putImageData(snapshot, 0, 0);
                canvasCtxRef.current?.beginPath();
                canvasCtxRef.current?.moveTo(posX[0], posY[0]);
                canvasCtxRef.current?.lineTo(e.pageX, e.pageY);
                canvasCtxRef.current?.lineTo(posX[0] * 2 - e.pageX, e.pageY);
                canvasCtxRef.current?.closePath();
                canvasCtxRef.current?.stroke();
                break;
            case 'move':
                window.scrollBy(posXmove - e.pageX, posYmove - e.pageY);
        }
    }

    const stopDrawing = (e: React.MouseEvent) => {
        isDrawing = false;
        let strokeColorTemp = currentTool == 'eraser' ? '#ffffff' : strokeColor;
        console.log('stop drawing ' + e.pageX + ' ' + e.pageY);
        if (currentTool == 'rectangle' || currentTool == 'circle' || currentTool == 'triangle') {
            posX.push(e.pageX);
            posY.push(e.pageY);
            if (isFill) {
                posX.push(e.pageX);
                posY.push(e.pageY);
            }
        }
        if (posX.length > 0 && posY.length > 0) {
            addMyDrawing({
                id: boards.find(board => board.id == currentBoardId)!
                    .drawings[boards.find(board => board.id == currentBoardId)?.drawings.length! - 1]
                    .id + 1,
                type: currentTool,
                lineWidth: width,
                strokeColor: strokeColorTemp,
                fillColor: fillColor,
                posX: posX,
                posY: posY,
                username: user
            });
            connection!.invoke("SendMessage", {
                UserName: user,
                RoomIdCon: String(currentBoardId),
                DrawingCon: {
                    id: boards.find(board => board.id == currentBoardId)!
                        .drawings[boards.find(board => board.id == currentBoardId)?.drawings.length! - 1]
                        .id + 1,
                    type: currentTool,
                    lineWidth: width,
                    strokeColor: strokeColorTemp,
                    fillColor: fillColor,
                    posX: posX,
                    posY: posY,
                    username: user
                }
            })
        }
        if (currentTool == 'eraser') {
            canvasCtxRef.current!.strokeStyle = strokeColor;
        }
    }

    return <canvas id='canvas'
        onMouseDown={e => startDraw(e)}
        onMouseMove={e => drawingEvent(e)}
        onMouseUp={e => stopDrawing(e)}
        ref={canvasRef} />

};

export default Canvas;