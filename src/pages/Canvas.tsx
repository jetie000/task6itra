import React, { useRef, useEffect } from 'react';
import { useBoardStore } from '../stores/boardsStore';

const Canvas = () => {
    let canvasRef = useRef<HTMLCanvasElement | null>(null);
    let canvasCtxRef = React.useRef<CanvasRenderingContext2D | null>(null);
    const width = useBoardStore(state => state.width);
    const strokeColor = useBoardStore(state => state.strokeColor);
    const fillColor = useBoardStore(state => state.fillColor);
    const currentTool = useBoardStore(state => state.currentTool);

    useEffect(() => {
        if (canvasRef.current) {
            canvasRef.current.width = document.getElementById('canvas')?.clientWidth!;
            canvasRef.current.height = document.getElementById('canvas')?.clientHeight!;
            canvasCtxRef.current = canvasRef.current.getContext('2d');
            let ctx = canvasCtxRef.current;
            ctx!.lineWidth = width;
            ctx!.strokeStyle = strokeColor;
            ctx!.fillStyle = fillColor;
            ctx!.lineCap='round';
            ctx!.lineJoin='round';
        }
    }, []);

    useEffect(() => {
        if (canvasRef.current) {
            let ctx = canvasCtxRef.current;
            ctx!.lineWidth = width;
            ctx!.strokeStyle = strokeColor;
            ctx!.fillStyle = fillColor;

        }
    }, [width, strokeColor, fillColor]);

    let isDrawing = false;

    const startDraw = (e: React.MouseEvent) => {
        isDrawing = true;
        canvasCtxRef.current?.beginPath();
        console.log('start drawing ' + e.clientX + ' ' + e.clientY);
    }

    const drawing = (e: React.MouseEvent) => {
        if(!isDrawing)
            return;
        canvasCtxRef.current?.lineTo(e.clientX, e.clientY);
        canvasCtxRef.current?.stroke();
    }

    const stopDrawing = (e: React.MouseEvent) => {
        isDrawing = false;
        console.log('stop drawing ' + e.clientX + ' ' + e.clientY);

    }

    return <canvas id='canvas'
                height={document.getElementById('canvas')?.clientHeight}
                onMouseDown={e => startDraw(e)} 
                onMouseMove={e => drawing(e)}
                onMouseUp={e => stopDrawing(e)}
                ref={canvasRef}/>
                    
};

export default Canvas;