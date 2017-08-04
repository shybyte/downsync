import {GOD_COMMAND_EVENT_NAME, GodModeClientCommand, GodModeServerCommand} from "../shared/god-mode-commands";
import {SocketSession} from "../../server/index";
import {GodState, StateChange} from "../shared/god-state";

export interface CurrentState {
  patchHistory: StateChange[];
  socketSessions: { [socketId: string]: SocketSession };
}

const GOD_STATE_ROOM = 'goodStateRoom';

export function executeGodCommand(state: CurrentState,
                                  socket: SocketIO.Socket,
                                  godCommand: GodModeServerCommand) {
  console.log('godCommand', godCommand);
  switch (godCommand.commandName) {
    case 'subscribeToGodState':
      console.log('subscribeToGodState', socket.id);
      state.socketSessions[socket.id].subscribedToGod = true;
      socket.join(GOD_STATE_ROOM);
      syncCompleteGodState(socket, state);
      break;
    default:
      console.error('unknown godCommand', godCommand);
      // assertUnreachable(godCommand);
  }
  return undefined;
}

export function syncCompleteGodState(socket: SocketIO.Socket, state: GodState) {
  const godClientCommand: GodModeClientCommand = {
    commandName: 'SyncCompleteGodState',
    state: {patchHistory: state.patchHistory}
  };
  socket.emit(GOD_COMMAND_EVENT_NAME, godClientCommand);
}

export function syncStateChange(io: SocketIO.Server, stateChange: StateChange) {
  const godClientCommand: GodModeClientCommand = {
    commandName: 'SyncChange',
    stateChange
  };
  io.sockets.in(GOD_STATE_ROOM).emit(GOD_COMMAND_EVENT_NAME, godClientCommand);
}
