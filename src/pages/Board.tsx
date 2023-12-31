import { useNavigate } from "react-router-dom";
import { IBoard } from "../interfaces/board.interface";
import { useBoardStore } from "../stores/boardsStore";
import Canvas from "./Canvas";
import { useEffect, useRef, useState } from "react";
import { variables } from "../Variables";
import { HttpTransportType, HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { IDrawing } from "../interfaces/drawing.interface";

function Board() {
    const user = useBoardStore(state => state.user);
    const boards = useBoardStore(state => state.boards);
    const setBoards = useBoardStore(state => state.setBoards);
    const setDrawings = useBoardStore(state => state.setDrawings);
    const currentBoardId = useBoardStore(state => state.currentBoardId);
    const currentBoardUsers = useBoardStore(state => state.currentBoardUsers);
    const leaveBoard = useBoardStore(state => state.leaveBoard);
    const width = useBoardStore(state => state.width);
    const setWidth = useBoardStore(state => state.setWidth);
    const strokeColor = useBoardStore(state => state.strokeColor);
    const setStrokeColor = useBoardStore(state => state.setStrokeColor);
    const fillColor = useBoardStore(state => state.fillColor);
    const setFillColor = useBoardStore(state => state.setFillColor);
    const isFill = useBoardStore(state => state.isFill);
    const setIsFill = useBoardStore(state => state.setIsFill);
    const setCurrentTool = useBoardStore(state => state.setCurrentTool);
    const setScale = useBoardStore(state => state.setScale);
    const connection = useBoardStore(state => state.connection);
    const drawDrawings = useBoardStore(state => state.drawDrawings);
    const removeDrawing = useBoardStore(state => state.removeDrawing);
    const getCtx = useBoardStore(state => state.getCtx);
    const savePhoto = useBoardStore(state => state.savePhoto);
    const navigate = useNavigate();

    useEffect(() => {
        setBoards();
        setDrawings();
    }, []);

    const toogleOptions = () => {
        const options = document.getElementById('options')!;
        if (options.classList.contains('d-none'))
            options.classList.replace('d-none', 'd-flex');
        else
            options.classList.replace('d-flex', 'd-none');
    }

    const leaveRoom = async () => {
        let RoomIdCon = String(currentBoardId);
        let UserName = user;
        leaveBoard();
        navigate('/boards');
        await connection.invoke("LeaveRoom", { UserName, RoomIdCon });
        connection.stop();
    }

    return (
        <>
            <div id="board" className="main-window d-flex">
                <Canvas />
            </div>
            <div id="info" className="position-fixed border d-flex flex-column bg-white">
                <div className="fs-4 m-2 p-2">
                    {boards.find(board => board.id == currentBoardId)?.name}
                </div>
            </div>
            <div id="info-users" className="position-fixed border d-flex flex-column bg-white">
                <div className="fs-4 m-2 p-2">
                    Users:
                </div>
                {currentBoardUsers && currentBoardUsers.map(user => <div key={user} className="fs-4 m-2 p-2">
                    {user}
                </div>)}
            </div>
            <div id="moves" className="position-fixed border d-flex bg-white">
                <div onClick={() => { removeDrawing(); drawDrawings(getCtx()!); }} className="rounded-circle tool-icon m-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-90deg-left fs-3" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M1.146 4.854a.5.5 0 0 1 0-.708l4-4a.5.5 0 1 1 .708.708L2.707 4H12.5A2.5 2.5 0 0 1 15 6.5v8a.5.5 0 0 1-1 0v-8A1.5 1.5 0 0 0 12.5 5H2.707l3.147 3.146a.5.5 0 1 1-.708.708l-4-4z" />
                    </svg>
                </div>
            </div>
            <div id="zooms" className="position-fixed border d-flex bg-white">
                <div onClick={() => setScale(true)} className="rounded-circle tool-icon m-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-plus-lg" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2Z" />
                    </svg>
                </div>
                <div onClick={() => setScale(false)} className="rounded-circle tool-icon m-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-dash-lg" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M2 8a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11A.5.5 0 0 1 2 8Z" />
                    </svg>
                </div>
            </div>
            <div id="tools" className="position-fixed border d-flex flex-column bg-white">
                <label className="input-label rounded-circle">
                    <input onClick={e => setCurrentTool(e.currentTarget.value)} type="radio" name="tools" value="line" defaultChecked />
                    <div className="rounded-circle p-3 tool-icon m-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-brush-fill fs-3" viewBox="0 0 16 16">
                            <path d="M15.825.12a.5.5 0 0 1 .132.584c-1.53 3.43-4.743 8.17-7.095 10.64a6.067 6.067 0 0 1-2.373 1.534c-.018.227-.06.538-.16.868-.201.659-.667 1.479-1.708 1.74a8.118 8.118 0 0 1-3.078.132 3.659 3.659 0 0 1-.562-.135 1.382 1.382 0 0 1-.466-.247.714.714 0 0 1-.204-.288.622.622 0 0 1 .004-.443c.095-.245.316-.38.461-.452.394-.197.625-.453.867-.826.095-.144.184-.297.287-.472l.117-.198c.151-.255.326-.54.546-.848.528-.739 1.201-.925 1.746-.896.126.007.243.025.348.048.062-.172.142-.38.238-.608.261-.619.658-1.419 1.187-2.069 2.176-2.67 6.18-6.206 9.117-8.104a.5.5 0 0 1 .596.04z" />
                        </svg>
                    </div>
                </label>
                <label className="input-label rounded-circle">
                    <input onClick={e => setCurrentTool(e.currentTarget.value)} type="radio" name="tools" value="eraser" />
                    <div className="rounded-circle p-3 tool-icon m-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-eraser-fill fs-3" viewBox="0 0 16 16">
                            <path d="M8.086 2.207a2 2 0 0 1 2.828 0l3.879 3.879a2 2 0 0 1 0 2.828l-5.5 5.5A2 2 0 0 1 7.879 15H5.12a2 2 0 0 1-1.414-.586l-2.5-2.5a2 2 0 0 1 0-2.828l6.879-6.879zm.66 11.34L3.453 8.254 1.914 9.793a1 1 0 0 0 0 1.414l2.5 2.5a1 1 0 0 0 .707.293H7.88a1 1 0 0 0 .707-.293l.16-.16z" />
                        </svg>
                    </div>
                </label>
                <label className="input-label rounded-circle">
                    <input onClick={e => setCurrentTool(e.currentTarget.value)} type="radio" name="tools" value="circle" />
                    <div className="rounded-circle p-3 tool-icon m-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-circle fs-3" viewBox="0 0 16 16">
                            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                        </svg>
                    </div>
                </label>
                <label className="input-label rounded-circle">
                    <input onClick={e => setCurrentTool(e.currentTarget.value)} type="radio" name="tools" value="rectangle" />
                    <div className="rounded-circle p-3 tool-icon m-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-square fs-3" viewBox="0 0 16 16">
                            <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z" />
                        </svg>
                    </div>
                </label>
                <label className="input-label rounded-circle">
                    <input onClick={e => setCurrentTool(e.currentTarget.value)} type="radio" name="tools" value="triangle" />
                    <div className="rounded-circle p-3 tool-icon m-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-triangle fs-3" viewBox="0 0 16 16">
                            <path d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.146.146 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.163.163 0 0 1-.054.06.116.116 0 0 1-.066.017H1.146a.115.115 0 0 1-.066-.017.163.163 0 0 1-.054-.06.176.176 0 0 1 .002-.183L7.884 2.073a.147.147 0 0 1 .054-.057zm1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566z" />
                        </svg>
                    </div>
                </label>
                <label className="input-label rounded-circle">
                    <input onClick={e => setCurrentTool(e.currentTarget.value)} type="radio" name="tools" value="move" />
                    <div className="rounded-circle p-3 tool-icon m-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrows-move" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M7.646.146a.5.5 0 0 1 .708 0l2 2a.5.5 0 0 1-.708.708L8.5 1.707V5.5a.5.5 0 0 1-1 0V1.707L6.354 2.854a.5.5 0 1 1-.708-.708l2-2zM8 10a.5.5 0 0 1 .5.5v3.793l1.146-1.147a.5.5 0 0 1 .708.708l-2 2a.5.5 0 0 1-.708 0l-2-2a.5.5 0 0 1 .708-.708L7.5 14.293V10.5A.5.5 0 0 1 8 10zM.146 8.354a.5.5 0 0 1 0-.708l2-2a.5.5 0 1 1 .708.708L1.707 7.5H5.5a.5.5 0 0 1 0 1H1.707l1.147 1.146a.5.5 0 0 1-.708.708l-2-2zM10 8a.5.5 0 0 1 .5-.5h3.793l-1.147-1.146a.5.5 0 0 1 .708-.708l2 2a.5.5 0 0 1 0 .708l-2 2a.5.5 0 0 1-.708-.708L14.293 8.5H10.5A.5.5 0 0 1 10 8z" />
                        </svg>
                    </div>
                </label>
                <div onClick={toogleOptions} className="rounded-circle p-3 tool-icon m-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-three-dots fs-3" viewBox="0 0 16 16">
                        <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
                    </svg>
                </div>
            </div>
            <div id="options" className="position-fixed d-none flex-column border p-2 bg-white">
                <div className="d-flex flex-wrap align-items-center mb-2">
                    <label htmlFor="isFillCheckBox" className="form-label fs-5 mb-0 me-2">Fill:</label>
                    <input onChange={e => setIsFill(e.target.checked)} checked={isFill} type="checkbox" className="form-check-input" id="isFillCheckBox" />
                </div>
                <label htmlFor="strokeColor" className="form-label fs-5">Stroke color: {strokeColor}</label>
                <input onChange={e => setStrokeColor(e.target.value)} type="color" id="strokeColor" name="head" defaultValue={strokeColor} />
                <label htmlFor="fillColor" className="form-label fs-5">Fill color: {fillColor}</label>
                <input onChange={e => setFillColor(e.target.value)} type="color" id="fillColor" name="head" defaultValue={fillColor} />
                <label htmlFor="widthRange" className="form-label fs-5">Width: {width}</label>
                <input onChange={e => setWidth(Number(e.target.value))} type="range" defaultValue={width} min={1} max={50} step={1} className="form-range" id="widthRange" />
            </div>
            <div id="leave" className="position-fixed border bg-white">
                <div onClick={leaveRoom} className="rounded-circle tool-icon m-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-box-arrow-left fs-3" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M6 12.5a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-8a.5.5 0 0 0-.5.5v2a.5.5 0 0 1-1 0v-2A1.5 1.5 0 0 1 6.5 2h8A1.5 1.5 0 0 1 16 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 5 12.5v-2a.5.5 0 0 1 1 0v2z" />
                        <path fillRule="evenodd" d="M.146 8.354a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L1.707 7.5H10.5a.5.5 0 0 1 0 1H1.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3z" />
                    </svg>
                </div>
            </div>
            <div id="save" className="position-fixed border bg-white">
                <div onClick={savePhoto} className="rounded-circle tool-icon m-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-image-fill" viewBox="0 0 16 16">
                        <path d="M.002 3a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-12a2 2 0 0 1-2-2V3zm1 9v1a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12zm5-6.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0z" />
                    </svg>
                </div>
            </div>
        </>
    );
}

export default Board;