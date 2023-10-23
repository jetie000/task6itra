import React, { useRef, useEffect, useState } from 'react';
import { useBoardStore } from '../stores/boardsStore';

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
    const connection = useBoardStore(state => state.connection);
    const drawDrawings = useBoardStore(state => state.drawDrawings);
    const setCtx = useBoardStore(state => state.setCtx);
    const setCanvasRef = useBoardStore(state => state.setCanvasRef);

    useEffect(() => {
        if (canvasRef.current) {
            canvasRef.current.width = document.getElementById('canvas')?.clientWidth!;
            canvasRef.current.height = document.getElementById('canvas')?.clientHeight!;
            canvasCtxRef.current = canvasRef.current.getContext('2d');
            let ctx = canvasCtxRef.current;
            setCtx(ctx!);
            setCanvasRef(canvasRef.current);
            drawDrawings(ctx!);
        }
        joinRoom(user);
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
    }, [scale]);

    const joinRoom = async (UserName: string) => {
        try {
            await connection.start();
            let RoomIdCon = String(currentBoardId);
            await connection.invoke("JoinRoom", { UserName, RoomIdCon });
        }
        catch (e) {
            console.log(e);
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
                console.log('start drawing ' + Math.round(e.pageX / scale) + ' ' + Math.round(e.pageY / scale));
                break;
            case 'eraser':
                canvasCtxRef.current!.strokeStyle = '#ffffff';
                canvasCtxRef.current?.beginPath();
                console.log('start erasing ' + Math.round(e.pageX / scale) + ' ' + Math.round(e.pageY / scale));
                break;
            case 'rectangle': case 'circle': case 'triangle':
                canvasCtxRef.current?.beginPath();
                snapshot = canvasCtxRef.current?.getImageData(0, 0, document.getElementById('canvas')?.clientWidth!, document.getElementById('canvas')?.clientHeight!)!;
                posX.push(Math.round(e.pageX / scale));
                posY.push(Math.round(e.pageY / scale));
                break;
            case 'move':
                posXmove = Math.round(e.pageX / scale);
                posYmove = Math.round(e.pageY / scale);
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
                posX.push(Math.round(e.pageX / scale));
                posY.push(Math.round(e.pageY / scale));
                canvasCtxRef.current?.lineTo(Math.round(e.pageX / scale), Math.round(e.pageY / scale));
                canvasCtxRef.current?.stroke();
                break;
            case 'rectangle':
                canvasCtxRef.current?.putImageData(snapshot, 0, 0);
                isFill
                    ? canvasCtxRef.current?.fillRect(Math.round(e.pageX / scale), Math.round(e.pageY / scale), posX[0] - Math.round(e.pageX / scale), posY[0] - Math.round(e.pageY / scale))
                    : canvasCtxRef.current?.strokeRect(e.pageX, Math.round(e.pageY / scale), posX[0] - Math.round(e.pageX / scale), posY[0] - Math.round(e.pageY / scale));
                break;
            case 'circle':
                canvasCtxRef.current?.putImageData(snapshot, 0, 0);
                canvasCtxRef.current?.beginPath();
                let radius = Math.sqrt(Math.pow(posX[0] - Math.round(e.pageX / scale), 2) + Math.pow(posY[0] - Math.round(e.pageY / scale), 2));
                canvasCtxRef.current?.arc(posX[0], posY[0], radius, 0, 2 * Math.PI);
                isFill
                    ? canvasCtxRef.current?.fill()
                    : canvasCtxRef.current?.stroke();
                break;
            case 'triangle':
                canvasCtxRef.current?.putImageData(snapshot, 0, 0);
                canvasCtxRef.current?.beginPath();
                canvasCtxRef.current?.moveTo(posX[0], posY[0]);
                canvasCtxRef.current?.lineTo(Math.round(e.pageX / scale), Math.round(e.pageY / scale));
                canvasCtxRef.current?.lineTo(posX[0] * 2 - Math.round(e.pageX / scale), Math.round(e.pageY / scale));
                canvasCtxRef.current?.closePath();
                isFill 
                    ? canvasCtxRef.current?.fill()
                    : canvasCtxRef.current?.stroke();
                break;
            case 'move':
                window.scrollBy(posXmove - Math.round(e.pageX / scale), posYmove - Math.round(e.pageY / scale));
        }
    }

    const stopDrawing = (e: React.MouseEvent) => {
        if (isDrawing == true) {
            isDrawing = false;
            let strokeColorTemp = currentTool == 'eraser' ? '#ffffff' : strokeColor;
            if (currentTool == 'rectangle' || currentTool == 'circle' || currentTool == 'triangle') {
                posX.push(Math.round(e.pageX / scale));
                posY.push(Math.round(e.pageY / scale));
                if (isFill) {
                    posX.push(Math.round(e.pageX / scale));
                    posY.push(Math.round(e.pageY / scale));
                }
            }
            if (posX.length > 0 && posY.length > 0) {
                addMyDrawing({
                    id: boards.find(board => board.id == currentBoardId)!.drawings.length > 0
                        ? boards.find(board => board.id == currentBoardId)!
                            .drawings[boards.find(board => board.id == currentBoardId)?.drawings.length! - 1]
                            .id + 1
                        : 0,
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
                        id: boards.find(board => board.id == currentBoardId)!.drawings.length > 0
                            ? boards.find(board => board.id == currentBoardId)!
                                .drawings[boards.find(board => board.id == currentBoardId)?.drawings.length! - 1]
                                .id + 1
                            : 0,
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
            console.log(isFill);
        }

    }

    return <canvas id='canvas'
        onMouseDown={e => startDraw(e)}
        onMouseMove={e => drawingEvent(e)}
        onMouseUp={e => stopDrawing(e)}
        onMouseOut={e => stopDrawing(e)}
        onMouseLeave={e => stopDrawing(e)}
        ref={canvasRef} />

};

export default Canvas;