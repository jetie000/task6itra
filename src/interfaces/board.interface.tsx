import { IDrawing } from "./drawing.interface";

export interface IBoard{
    id: number,
    name: string,
    creator: string,
    drawings: IDrawing[]
}