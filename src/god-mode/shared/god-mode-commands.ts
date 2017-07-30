import {GodState} from "./god-state";

interface UndoCommand {
  commandName: 'undo';
}

interface SubscribeToGodStateCommand {
  commandName: 'subscribeToGodState';
}

export interface SelectStateRevisionCommand {
  commandName: 'selectStateRevision';
  revision: number;
}

export type GodModeServerCommand = UndoCommand | SubscribeToGodStateCommand | SelectStateRevisionCommand;


interface SyncGodStateCommand {
  commandName: 'SyncGodState';
  state: GodState;
}

export type GodModeClientCommand = SyncGodStateCommand;

export const GOD_COMMAND_EVENT_NAME = 'godCommand';