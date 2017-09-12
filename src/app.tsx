import xs, { Stream } from "xstream";
import { VNode, DOMSource } from "@cycle/dom";
import { StateSource } from "cycle-onionify";

import { Sources, Sinks } from "./interfaces";

export type AppSources = Sources & { onion: StateSource<AppState> };
export type AppSinks = Sinks & { onion: Stream<Reducer> };
export type Reducer = (prev: AppState) => AppState;

type Player = "X" | "O";
type SquareState = Player | undefined;
type Board = SquareState[];

export type AppState = {
    board: Board;
    turn: Player;
    winner: Player | undefined;
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

export type Action = { clickSquare$: xs<number> };

function intent(DOM: DOMSource): Action {
    const clickSquare$ = DOM.select(".square")
        .events("click")
        .map(ev => (ev.target as HTMLElement).getAttribute("name"))
        .map(n => Number(n));

    return { clickSquare$: clickSquare$ };
}

function model(action: Action): Stream<Reducer> {
    const clickSquare$ = action.clickSquare$
        .debug("clickSquare")
        .map(squareNum => (state: AppState) => {
            const newBoard = state.board.slice();
            if (!state.winner && !newBoard[squareNum]) {
                newBoard[squareNum] = state.turn;
            }
            return {
                ...state,
                turn: state.turn === "X" ? "O" : "X",
                board: newBoard,
                winner: calculateWinner(newBoard)
            } as AppState;
        });

    const initialState$ = xs.of(
        (prev: AppState) =>
            ({
                turn: "X",
                board: new Array(9).fill(undefined),
                winner: undefined
            } as AppState)
    );

    return xs.merge(initialState$, clickSquare$);
}

function makeSquareRenderer(board: Board): (n: number) => JSX.Element {
    return (n: number) => (
        <button className="square" name={n}>
            {board[n]}
        </button>
    );
}

function view(state$: Stream<AppState>): Stream<VNode> {
    return state$.map(state => {
        const renderSquare = makeSquareRenderer(state.board);
        let winner;
        if (state.winner) {
            winner = <span>Winner: {state.winner}</span>;
        }
        return (
            <div>
                <h2>tictactoe built with cycle.js</h2>
                {winner}
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

function calculateWinner(board: SquareState[]): string | undefined {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    return undefined;
}
