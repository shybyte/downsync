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
import {executeGodCommand, syncGodStateChange} from "../god-mode/server/execute-god-commands";
import {SyncedState} from "../shared/synced-state";
import {StateChange} from "../god-mode/shared/god-state";
import {ObjectFileStorage} from "./object-file-storage";
import deepFreezeStrict = require('deep-freeze-strict');

const PORT = 8000;


const app = express();
const server = http.createServer(app);
const io = ioStatic(server);


export interface SocketSession {
  subscribedToGod?: boolean;
}

export interface ServerState {
  syncedState: SyncedState;
  patchHistory: StateChange[];
  socketSessions: { [socketId: string]: SocketSession };
}

const articleStorage = new ObjectFileStorage('data/articles');

function loadInitialSyncedState(): SyncedState {
  const s = JSON.parse(fs.readFileSync('data/state.json', 'utf8'));
  s.articles = articleStorage.load();
  return s;
}

const state: ServerState = {
  syncedState: deepFreezeStrict(loadInitialSyncedState()),
  patchHistory: [{delta: {}, command: {}, time: Date.now()}],
  socketSessions: {},
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
    const stateChange = {time: Date.now(), command: command, delta: statePatch};
    articleStorage.saveIfChanged(newSyncedState.articles, stateChange.delta.articles);
    state.patchHistory.push(stateChange);
    state.syncedState = deepFreezeStrict(newSyncedState);
    syncGodStateChange(io, stateChange);
  });

  socket.on('godCommand', (godCommand: GodModeServerCommand) => {
    executeGodCommand(io, state, socket, godCommand, (newSyncedState) => {
      const statePatch = diff(state.syncedState, newSyncedState);
      sendCommand({commandName: 'SyncStatePatch', statePatch: statePatch!});
      state.syncedState = deepFreezeStrict(newSyncedState);
    });
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


server.listen(PORT, () => {
  console.log('listening on *:' + PORT);
});
