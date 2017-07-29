import {GodModeServerCommand} from "../shared/god-mode-commands";
import {SyncedState} from "../../shared/synced-state";
import {Delta} from "jsondiffpatch";
import {unpatch} from "../../shared/json-diff-patch";
import * as R from "ramda";
import deepFreezeStrict = require("deep-freeze-strict");

interface GodCommandResult {
  syncedState: SyncedState;
}

interface CurrentState {
  syncedState: SyncedState;
  patchHistory: Delta[];
}

export function executeGodCommand(state: CurrentState, godCommand: GodModeServerCommand): GodCommandResult | undefined {
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
    default:
      console.error('unknown godCommand', godCommand);
  }
  return undefined;
}