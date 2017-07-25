import { SyncedState } from './synced-state';

interface SyncCompleteStateCommand {
  commandName: 'SyncCompleteState';
  state: SyncedState;
}

export type ClientCommand = SyncCompleteStateCommand;