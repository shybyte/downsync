import * as fs from 'fs';
import * as express from 'express';
import * as ioStatic from 'socket.io';
import * as http from 'http';
import {ClientCommand} from '../shared/client-commands';
import {ServerCommand} from '../shared/server-commands';
import * as R from 'ramda';
import {diff} from '../shared/json-diff-patch';
import {GodModeServerCommand} from "../god-mode/shared/god-mode-commands";
import {executeServerCommand} from "./execute-server-commands";
import {CurrentState, executeGodCommand, syncGodState} from "../god-mode/server/execute-god-commands";
import deepFreezeStrict = require('deep-freeze-strict');


const app = express();
const server = http.createServer(app);
const io = ioStatic(server);


export interface SocketSession {
  subscribedToGod?: boolean;
}


const state: CurrentState = {
  syncedState: deepFreezeStrict(JSON.parse(fs.readFileSync('data/state.json', 'utf8'))),
  patchHistory: [{}],
  socketSessions: {},
  selectedRevision: 0
};


function sendCommand(clientCommand: ClientCommand) {
  io.emit('command', clientCommand);
}

io.on('connection', socket => {
  console.log('a user connected', socket.id);
  state.socketSessions[socket.id] = {};

  function syncCompleteState() {
    sendCommand({commandName: 'SyncCompleteState', state: state.syncedState});
  }

  socket.on('command', (command: ServerCommand) => {
    console.log('Got command', command);
    const newSyncedState = R.clone(state.syncedState);
    executeServerCommand(newSyncedState, command);
    const statePatch = diff(state.syncedState, newSyncedState);
    sendCommand({commandName: 'SyncStatePatch', statePatch: statePatch!});
    state.patchHistory.push(statePatch);
    state.selectedRevision = state.patchHistory.length - 1;
    state.syncedState = deepFreezeStrict(newSyncedState);
    syncGodState(io, state);
  });

  socket.on('godCommand', (godCommand: GodModeServerCommand) => {
    const godCommandResult = executeGodCommand(io, state, socket, godCommand);
    if (godCommandResult) {
      state.syncedState = godCommandResult.syncedState;
      syncCompleteState();
    }
    syncGodState(io, state);
  });

  socket.on('disconnect', () => {
    console.log('disconnected', socket.id);
    delete state.socketSessions[socket.id];
  });

  syncCompleteState();
});


app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>');
});

server.listen(8000, () => {
  console.log('listening on *:8000');
});
