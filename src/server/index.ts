import * as express from 'express';
import * as ioStatic from 'socket.io';
import * as http from 'http';
import {ClientCommand} from '../shared/client-commands';
import {SyncedState} from '../shared/synced-state';
import {ServerCommand} from "../shared/server-commands";
import {assertUnreachable} from "./utils";

const app = express();
const server = http.createServer(app);
const io = ioStatic(server);

const syncedState: SyncedState = {
  name: 'Marco',
  count: 0
};

io.on('connection', socket => {
  console.log('a user connected');

  function syncState() {
    sendCommand({commandName: 'SyncCompleteState', state: syncedState});
  }


  socket.on('command', (command: ServerCommand) => {
    switch (command.commandName) {
      case 'IncreaseCount':
        syncedState.count += 1;
        break;
      case 'ChangeName':
        syncedState.name = command.name;
        break;
      default:
        assertUnreachable(command);
    }

    syncState();
  });

  syncState();
});

function sendCommand(clientCommand: ClientCommand) {
  io.emit('command', clientCommand);
}

app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>');
});

server.listen(8000, () => {
  console.log('listening on *:8000');
});