import {GodState} from "./god-state";

interface SubscribeToGodStateCommand {
  commandName: 'subscribeToGodState';
}

export type GodModeServerCommand = SubscribeToGodStateCommand ;

interface SyncGodStateCommand {
  commandName: 'SyncGodState';
  state: GodState;
}

export type GodModeClientCommand = SyncGodStateCommand;

export const GOD_COMMAND_EVENT_NAME = 'godCommand';
