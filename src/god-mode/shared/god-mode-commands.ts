import {GodState, StateChange} from "./god-state";

interface SubscribeToGodStateCommand {
  commandName: 'subscribeToGodState';
}

export type GodModeServerCommand = SubscribeToGodStateCommand ;

interface SyncGodStateCommand {
  commandName: 'SyncCompleteGodState';
  state: GodState;
}

interface SyncChangeCommand {
  commandName: 'SyncChange';
  stateChange: StateChange;
}

export type GodModeClientCommand = SyncGodStateCommand | SyncChangeCommand;

export const GOD_COMMAND_EVENT_NAME = 'godCommand';
