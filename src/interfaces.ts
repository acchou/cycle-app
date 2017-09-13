import { Stream } from "xstream";
import { VNode, DOMSource } from "@cycle/dom";
import { HTTPSource, RequestOptions } from "@cycle/http";
import { TimeSource } from "@cycle/time";

export type Player = "X" | "O";
export type SquareState = Player | undefined;
export type Board = SquareState[];

export type GameState = {
    history: [Board];
    turn: Player;
    winner: Player | undefined;
};

export type Reducer = (state: GameState) => GameState;

export type Sources = {
    DOM: DOMSource;
    HTTP: HTTPSource;
    Time: TimeSource;
    State: GameState;
};

export type RootSinks = {
    DOM: Stream<VNode>;
    HTTP: Stream<RequestOptions>;
    State: GameState;
};

export type Action = {
    clickSquare$: Stream<number>;
    clickMove$: Stream<number>;
};

export type Sinks = Partial<RootSinks>;
export type Component = (s: Sources) => Sinks;
