import React, { useRef, useEffect } from 'react';
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
    const setCurrentTool = useBoardStore(state => state.setCurrentTool);
    const addMyDrawing = useBoardStore(state => state.addMyDrawing);

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

    const drawDrawings = (ctx: CanvasRenderingContext2D) => {
        let currentBoard = boards.find(board => board.id == currentBoardId);
        for (let drawing of currentBoard?.drawings!) {
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
    }

    let isDrawing = false;
    let posX: number[] = [], posY: number[] = [];
    let snapshot: ImageData;

    const startDraw = (e: React.MouseEvent) => {
        isDrawing = true;
        posX = [];
        posY = [];
        switch (currentTool) {
            case 'line':
                canvasCtxRef.current?.beginPath();
                console.log('start drawing ' + e.clientX + ' ' + e.clientY);
                break;
            case 'eraser':
                canvasCtxRef.current!.strokeStyle = '#ffffff';
                canvasCtxRef.current?.beginPath();
                console.log('start erasing ' + e.clientX + ' ' + e.clientY);
                break;
            case 'rectangle': case 'circle': case 'triangle':
                canvasCtxRef.current?.beginPath();
                snapshot = canvasCtxRef.current?.getImageData(0, 0, document.getElementById('canvas')?.clientWidth!, document.getElementById('canvas')?.clientHeight!)!;
                posX.push(e.clientX);
                posY.push(e.clientY);
                break;
        }
    }

    var scheduled = false;
    const drawingEvent = (e: React.MouseEvent) => {
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
                posX.push(e.clientX);
                posY.push(e.clientY);
                canvasCtxRef.current?.lineTo(e.clientX, e.clientY);
                canvasCtxRef.current?.stroke();
                break;
            case 'rectangle':
                canvasCtxRef.current?.putImageData(snapshot, 0, 0);
                isFill
                    ? canvasCtxRef.current?.fillRect(e.clientX, e.clientY, posX[0] - e.clientX, posY[0] - e.clientY)
                    : canvasCtxRef.current?.strokeRect(e.clientX, e.clientY, posX[0] - e.clientX, posY[0] - e.clientY);
                break;
            case 'circle':
                canvasCtxRef.current?.putImageData(snapshot, 0, 0);
                canvasCtxRef.current?.beginPath();
                let radius = Math.sqrt(Math.pow(posX[0] - e.clientX, 2) + Math.pow(posY[0] - e.clientY, 2));
                canvasCtxRef.current?.arc(posX[0], posY[0], radius, 0, 2 * Math.PI);
                isFill
                    ? canvasCtxRef.current?.fill()
                    : canvasCtxRef.current?.stroke();
                break;
            case 'triangle':
                canvasCtxRef.current?.putImageData(snapshot, 0, 0);
                canvasCtxRef.current?.beginPath();
                canvasCtxRef.current?.moveTo(posX[0], posY[0]);
                canvasCtxRef.current?.lineTo(e.clientX, e.clientY);
                canvasCtxRef.current?.lineTo(posX[0] * 2 - e.clientX, e.clientY);
                canvasCtxRef.current?.closePath();
                canvasCtxRef.current?.stroke();
        }
    }

    const stopDrawing = (e: React.MouseEvent) => {
        isDrawing = false;
        let strokeColorTemp = currentTool == 'eraser' ? '#ffffff' : strokeColor;
        console.log('stop drawing ' + e.clientX + ' ' + e.clientY);
        if (currentTool == 'rectangle' || currentTool == 'circle' || currentTool == 'triangle') {
            posX.push(e.clientX);
            posY.push(e.clientY);
            if (isFill) {
                posX.push(e.clientX);
                posY.push(e.clientY);
            }
        }
        if (posX.length > 0 && posY.length > 0)
            addMyDrawing({
                id: 0,
                type: currentTool,
                lineWidth: width,
                strokeColor: strokeColorTemp,
                fillColor: fillColor,
                posX: posX,
                posY: posY,
                username: user
            });
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