import {GOD_COMMAND_EVENT_NAME, GodModeClientCommand, GodModeServerCommand} from "../shared/god-mode-commands";
import {SyncedState} from "../../shared/synced-state";
import {Delta} from "jsondiffpatch";
import {unpatch} from "../../shared/json-diff-patch";
import * as R from "ramda";
import {assertUnreachable} from "../../shared/utils";
import {SocketSession} from "../../server/index";
import deepFreezeStrict = require("deep-freeze-strict");

interface GodCommandResult {
  syncedState: SyncedState;
}

interface CurrentState {
  syncedState: SyncedState;
  patchHistory: Delta[];
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
      const lastPatch = state.patchHistory.pop();
      if (lastPatch) {
        console.log('undo', lastPatch);
        const stateClone = R.clone(state.syncedState);
        return {
          syncedState: deepFreezeStrict(unpatch(stateClone, lastPatch))
        };
      }
      break;
    case 'subscribeToGodState':
      console.log('subscribeToGodState', socket.id);
      state.socketSessions[socket.id].subscribedToGod = true;
      socket.join(GOD_STATE_ROOM)
      const godClientCommand: GodModeClientCommand = {
        commandName: 'SyncGodState',
        state: {
          patchHistory: state.patchHistory
        }
      }
      io.sockets.in(GOD_STATE_ROOM).emit(GOD_COMMAND_EVENT_NAME, godClientCommand);
      break;
    default:
      console.error('unknown godCommand', godCommand);
      assertUnreachable(godCommand);
  }
  return undefined;
}