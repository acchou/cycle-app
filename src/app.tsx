import xs, { Stream } from "xstream";
import { VNode, DOMSource } from "@cycle/dom";
import { StateSource } from "cycle-onionify";

import { Sources, Sinks } from "./interfaces";

export type AppSources = Sources & { onion: StateSource<AppState> };
export type AppSinks = Sinks & { onion: Stream<Reducer> };
export type Reducer = (prev: AppState) => AppState;

type SquareState = "X" | "O" | undefined;

type Board = SquareState[];

export type AppState = {
    board: Board;
};

export function App(sources: AppSources): AppSinks {
    const actions: Action = intent(sources.DOM);
    const state$: Stream<Reducer> = model(actions);
    const vdom$: Stream<VNode> = view(sources.onion.state$);

    return {
        DOM: vdom$,
        onion: state$
    };
}

type Turn = "X" | "O";

export type Action = { clickSquare$: xs<number> };

function intent(DOM: DOMSource): Action {
    const clickSquare$ = DOM.select(".square")
        .events("click")
        .map(ev => (ev.target as HTMLElement).dataset.squareNum)
        .map(n => Number(n));

    return { clickSquare$: clickSquare$ };
}

function model(action: Action): xs<Reducer> {
    const clickSquare$ = action.clickSquare$.map(squareNum => (state: AppState) => {
        const newBoard = state.board.slice();
        newBoard[squareNum] = "X";
        return { ...state, board: newBoard } as AppState;
    });

    const initialState$ = xs.of((prev: AppState) => ({
        board: new Array(9).fill(undefined)
    }));

    return xs.merge(initialState$, clickSquare$);
}

function makeSquareRenderer(board: Board): (n: number) => JSX.Element {
    return (n: number) => (
        <button className="square" data-squareNum={n}>
            {board[n]}
        </button>
    );
}

function view(state$: Stream<AppState>): Stream<VNode> {
    return state$.map(s => s.board).map(board => {
        const renderSquare = makeSquareRenderer(board);
        return (
            <div>
                <h2>tictactoe built with cycle.js</h2>
                <div>
                    <div className="board-row">
                        {renderSquare(0)}
                        {renderSquare(1)}
                        {renderSquare(2)}
                    </div>
                    <div className="board-row">
                        {renderSquare(3)}
                        {renderSquare(4)}
                        {renderSquare(5)}
                    </div>
                    <div className="board-row">
                        {renderSquare(6)}
                        {renderSquare(7)}
                        {renderSquare(8)}
                    </div>
                </div>
            </div>
        );
    });
}
