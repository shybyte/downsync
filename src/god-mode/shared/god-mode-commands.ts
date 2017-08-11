import {GodState, RevisionId, StateChange} from "./god-state";

interface SubscribeToGodStateCommand {
  commandName: 'subscribeToGodState';
}

interface RevertToRevision {
  commandName: 'revertToRevision';
  revisionId: RevisionId;
}

export interface RevertToChangedStateCommand<S= any> {
  commandName: 'revertToChangedState';
  revisionId: RevisionId;
  changedState: S;
}

export type GodModeServerCommand = SubscribeToGodStateCommand | RevertToRevision | RevertToChangedStateCommand ;

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
