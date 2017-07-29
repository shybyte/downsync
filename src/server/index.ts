import * as fs from 'fs';
import * as express from 'express';
import * as ioStatic from 'socket.io';
import * as http from 'http';
import {ClientCommand} from '../shared/client-commands';
import {SyncedState} from '../shared/synced-state';
import {ServerCommand} from '../shared/server-commands';
import * as R from 'ramda';
import {diff, unpatch} from '../shared/json-diff-patch';
import {GodModeServerCommand} from "../god-mode/shared/god-mode-commands";
import {Delta} from "jsondiffpatch";
import {executeServerCommand} from "./execute-server-commands";
import deepFreezeStrict = require('deep-freeze-strict');


const app = express();
const server = http.createServer(app);
const io = ioStatic(server);

let syncedState: SyncedState = deepFreezeStrict(JSON.parse(fs.readFileSync('data/state.json', 'utf8')));

const patchHistory: Delta[] = [];


function sendCommand(clientCommand: ClientCommand) {
  io.emit('command', clientCommand);
}

io.on('connection', socket => {
  console.log('a user connected');

  function syncCompleteState() {
    sendCommand({commandName: 'SyncCompleteState', state: syncedState});
  }

  socket.on('command', (command: ServerCommand) => {
    console.log('Got command', command);
    const newSyncedState = R.clone(syncedState);
    executeServerCommand(newSyncedState, command);
    const statePatch = diff(syncedState, newSyncedState);
    sendCommand({commandName: 'SyncStatePatch', statePatch: statePatch!});
    patchHistory.push(statePatch);

    syncedState = deepFreezeStrict(newSyncedState);
  });

  socket.on('godCommand', (godCommand: GodModeServerCommand) => {
    console.log('godCommand', godCommand);
    switch (godCommand.commandName) {
      case 'undo':
        const lastPatch = patchHistory.pop();
        if (lastPatch) {
          console.log('undo', lastPatch);
          const stateClone = R.clone(syncedState);
          syncedState = deepFreezeStrict(unpatch(stateClone, lastPatch));
          syncCompleteState();
        }
        break;
      default:
        console.error('unknown godCommand', godCommand);
    }
  });

  syncCompleteState();
});

app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>');
});

server.listen(8000, () => {
  console.log('listening on *:8000');
});