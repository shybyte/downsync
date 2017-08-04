import {GodState, RevisionId, StateChange} from "./god-state";

interface SubscribeToGodStateCommand {
  commandName: 'subscribeToGodState';
}

interface RevertToRevision {
  commandName: 'revertToRevision';
  revisionId: RevisionId;
}

export type GodModeServerCommand = SubscribeToGodStateCommand | RevertToRevision ;

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
