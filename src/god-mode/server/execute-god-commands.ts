import {GOD_COMMAND_EVENT_NAME, GodModeClientCommand, GodModeServerCommand} from "../shared/god-mode-commands";
import {SyncedState} from "../../shared/synced-state";
import {getStateOfRevision, unpatch} from "../../shared/json-diff-patch";
import * as R from "ramda";
import {assertUnreachable} from "../../shared/utils";
import {SocketSession} from "../../server/index";
import {GodState, RevisionId, StateChange} from "../shared/god-state";
import deepFreezeStrict = require("deep-freeze-strict");

interface GodCommandResult {
  syncedState: SyncedState;
}

export interface CurrentState {
  syncedState: SyncedState;
  patchHistory: StateChange[];
  selectedRevision: RevisionId;
  socketSessions: { [socketId: string]: SocketSession };
}

const GOD_STATE_ROOM = 'goodStateRoom';

export function executeGodCommand(io: SocketIO.Server,
                                  state: CurrentState,
                                  socket: SocketIO.Socket,
                                  godCommand: GodModeServerCommand): GodCommandResult | undefined {
  console.log('godCommand', godCommand);
  switch (godCommand.commandName) {
    case 'undo':
      if (state.patchHistory.length > 1) {
        const lastPatch = state.patchHistory.pop()!;
        console.log('undo', lastPatch);
        const stateClone = R.clone(state.syncedState);
        state.selectedRevision = state.patchHistory.length - 1;
        return {
          syncedState: deepFreezeStrict(unpatch(stateClone, lastPatch))
        };
      }
      break;
    case 'selectStateRevision':
      return selectStateRevision(state, godCommand.revision);
    case 'subscribeToGodState':
      console.log('subscribeToGodState', socket.id);
      state.socketSessions[socket.id].subscribedToGod = true;
      socket.join(GOD_STATE_ROOM);
      break;
    default:
      console.error('unknown godCommand', godCommand);
      assertUnreachable(godCommand);
  }
  return undefined;
}

function selectStateRevision(state: CurrentState, revision: number) {
  console.log(`selectStateRevision ${state.selectedRevision} => ${revision}`);
  const restoredState = getStateOfRevision(
    state.syncedState, state.patchHistory.map(x => x.delta),
    state.selectedRevision, revision);
  state.selectedRevision = revision;
  return {
    syncedState: deepFreezeStrict(restoredState)
  };
}

export function syncGodState(io: SocketIO.Server, state: GodState) {
  const godClientCommand: GodModeClientCommand = {
    commandName: 'SyncGodState',
    state
  };
  io.sockets.in(GOD_STATE_ROOM).emit(GOD_COMMAND_EVENT_NAME, godClientCommand);
}
