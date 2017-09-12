import xs, { Stream } from "xstream";
import { VNode, DOMSource } from "@cycle/dom";
import { Sources, Sinks, GameState, Player, SquareState, Board } from "./interfaces";

export function App(sources: Sources): Sinks {
    const actions: Action = intent(sources.DOM);
    const state$: Stream<GameState> = model(actions);
    const vdom$: Stream<VNode> = view(state$);

    return {
        DOM: vdom$
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

function model(action: Action): Stream<GameState> {
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

    function step(state: GameState, squareNum: number): GameState {
        const newBoard = state.board.slice();
        if (!state.winner && !newBoard[squareNum]) {
            newBoard[squareNum] = state.turn;
        }
        return {
            ...state,
            turn: state.turn === "X" ? "O" : "X",
            board: newBoard,
            winner: calculateWinner(newBoard)
        } as GameState;
    }

    const initial = {
        turn: "X",
        board: new Array(9).fill(undefined),
        winner: undefined
    } as GameState;

    return action.clickSquare$.fold(step, initial);
}

function view(state$: Stream<GameState>): Stream<VNode> {
    return state$.map(state => {
        function renderSquare(n: number): JSX.Element {
            return (
                <button className="square" name={n}>
                    {state.board[n]}
                </button>
            );
        }

        let winner;
        if (state.winner) {
            winner = <span>Winner: {state.winner}</span>;
        }
        return (
            <div>
                <h2>tictactoe built with cycle.js</h2>
                <div className="game">
                    <div className="game-board">
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
                    <div className="game-info">
                        <div>{winner}</div>
                    </div>
                </div>
            </div>
        );
    });
}
