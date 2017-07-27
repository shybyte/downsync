import {SyncedState} from './synced-state';
import {Delta} from 'jsondiffpatch';

interface SyncCompleteStateCommand {
  commandName: 'SyncCompleteState';
  state: SyncedState;
}

interface SyncStatePatchCommand {
  commandName: 'SyncStatePatch';
  statePatch: Delta;
}

export type ClientCommand = SyncCompleteStateCommand | SyncStatePatchCommand;