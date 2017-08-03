import {GOD_COMMAND_EVENT_NAME, GodModeClientCommand, GodModeServerCommand} from "../shared/god-mode-commands";
import {SyncedState} from "../../shared/synced-state";
import {SocketSession} from "../../server/index";
import {GodState, RevisionId, StateChange} from "../shared/god-state";

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
                                  godCommand: GodModeServerCommand) {
  console.log('godCommand', godCommand);
  switch (godCommand.commandName) {
    case 'subscribeToGodState':
      console.log('subscribeToGodState', socket.id);
      state.socketSessions[socket.id].subscribedToGod = true;
      socket.join(GOD_STATE_ROOM);
      break;
    default:
      console.error('unknown godCommand', godCommand);
      // assertUnreachable(godCommand);
  }
  return undefined;
}

export function syncGodState(io: SocketIO.Server, state: GodState) {
  const godClientCommand: GodModeClientCommand = {
    commandName: 'SyncGodState',
    state
  };
  io.sockets.in(GOD_STATE_ROOM).emit(GOD_COMMAND_EVENT_NAME, godClientCommand);
}
