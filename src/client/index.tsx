import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {BrowserRouter} from 'react-router-dom';
import App from './components/App';
import registerServiceWorker from './registerServiceWorker';
import './index.css';
import * as io from 'socket.io-client';
import {SyncedState} from '../shared/synced-state';
import {ClientCommand} from '../shared/client-commands';
import {ServerCommand} from '../shared/server-commands';

let syncedState: SyncedState;
const socket = io('http://localhost:8000');

function sendServerCommand(command: ServerCommand) {
  socket.emit('command', command);
  console.log('send command', command);
}

function render() {
  ReactDOM.render(
    <BrowserRouter>
      <App syncedState={syncedState} sendServerCommand={sendServerCommand}/>
    </BrowserRouter>
    ,
    document.getElementById('root') as HTMLElement
  );
}

render();
registerServiceWorker();

socket.on('command', (clientCommand: ClientCommand) => {
  console.log('command:', clientCommand);
  syncedState = clientCommand.state;
  render();
});




