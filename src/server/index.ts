import * as fs from 'fs';
import * as express from 'express';
import * as ioStatic from 'socket.io';
import * as http from 'http';
import {ClientCommand} from '../shared/client-commands';
import {SyncedState} from '../shared/synced-state';
import {ServerCommand} from '../shared/server-commands';
import * as R from 'ramda';
import {diff} from '../shared/json-diff-patch';
import {GodModeServerCommand} from "../god-mode/shared/god-mode-commands";
import {Delta} from "jsondiffpatch";
import {executeServerCommand} from "./execute-server-commands";
import {executeGodCommand} from "../god-mode/server/execute-god-commands";
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
  console.log('a user connected', socket.id);

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
    const godCommandResult = executeGodCommand({syncedState, patchHistory}, godCommand);
    if (godCommandResult) {
      syncedState = godCommandResult.syncedState;
      syncCompleteState();
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