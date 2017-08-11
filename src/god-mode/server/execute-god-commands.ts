import {
  GOD_COMMAND_EVENT_NAME,
  GodModeClientCommand,
  GodModeServerCommand,
  RevertToChangedStateCommand
} from "../shared/god-mode-commands";
import {SocketSession} from "../../server/server";
import {GodState, StateChange} from "../shared/god-state";
import {assertUnreachable} from "../../shared/utils";
import {getStateOfRevision} from "../../shared/json-diff-patch";

export interface CurrentState<S= any> {
  syncedState: S;
  patchHistory: StateChange[];
  socketSessions: { [socketId: string]: SocketSession };
}

const GOD_STATE_ROOM = 'goodStateRoom';

type HandleNewSyncedState<S= any> = (state: S) => void;

export function executeGodCommand<S= any>(io: SocketIO.Server,
                                          state: CurrentState<S>,
                                          socket: SocketIO.Socket,
                                          godCommand: GodModeServerCommand,
                                          handleNewSyncedState: HandleNewSyncedState) {
  console.log('godCommand', godCommand);
  switch (godCommand.commandName) {
    case 'subscribeToGodState':
      state.socketSessions[socket.id].subscribedToGod = true;
      socket.join(GOD_STATE_ROOM);
      syncCompleteGodState(socket, state);
      break;
    case 'revertToRevision':
      const newSyncedState = getStateOfRevision(state.syncedState,
                                                state.patchHistory.map(x => x.delta),
                                                state.patchHistory.length - 1, godCommand.revisionId);
      handleNewSyncedState(newSyncedState);
      state.patchHistory.splice(godCommand.revisionId + 1);
      syncCompleteGodStateToAll(io, state);
      break;
    case 'revertToChangedState':
      revertToChangedState(io, state, handleNewSyncedState, godCommand);
      break;
    default:
      console.error('unknown godCommand', godCommand);
      assertUnreachable(godCommand);
  }
  return undefined;
}

function revertToChangedState(io: SocketIO.Server,
                              state: CurrentState,
                              handleNewSyncedState: HandleNewSyncedState,
                              godCommand: RevertToChangedStateCommand) {
  const newSyncedState = godCommand.changedState;
  handleNewSyncedState(newSyncedState);
  state.patchHistory.splice(godCommand.revisionId + 1);
  syncCompleteGodStateToAll(io, state);
}

export function syncCompleteGodStateToAll(io: SocketIO.Server, state: GodState) {
  const godClientCommand: GodModeClientCommand = {
    commandName: 'SyncCompleteGodState',
    state: {patchHistory: state.patchHistory}
  };
  io.sockets.in(GOD_STATE_ROOM).emit(GOD_COMMAND_EVENT_NAME, godClientCommand);
}

export function syncCompleteGodState(socket: SocketIO.Socket, state: GodState) {
  const godClientCommand: GodModeClientCommand = {
    commandName: 'SyncCompleteGodState',
    state: {patchHistory: state.patchHistory}
  };
  socket.emit(GOD_COMMAND_EVENT_NAME, godClientCommand);
}

export function syncGodStateChange(io: SocketIO.Server, stateChange: StateChange) {
  const godClientCommand: GodModeClientCommand = {
    commandName: 'SyncChange',
    stateChange
  };
  io.sockets.in(GOD_STATE_ROOM).emit(GOD_COMMAND_EVENT_NAME, godClientCommand);
}
