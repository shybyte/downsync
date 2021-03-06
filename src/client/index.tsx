import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {BrowserRouter} from 'react-router-dom';
import App from './components/App';
import registerServiceWorker from './registerServiceWorker';
import './index.css';
import './split.css';
import * as io from 'socket.io-client';
import {SyncedState} from '../shared/synced-state';
import {ClientCommand} from '../shared/client-commands';
import {ServerCommand} from '../shared/server-commands';
import {assertUnreachable} from '../shared/utils';
import {patch} from '../shared/json-diff-patch';
import GodModePage from "../god-mode/client/GodModePage";

let syncedState: SyncedState;
const socket: SocketIOClient.Socket = io('http://localhost:8000');
const localState = {
  isGodModeActive: false,
};

function sendServerCommand(command: ServerCommand) {
  socket.emit('command', command);
  console.log('send command', command);
}


function startGodMode() {
  localState.isGodModeActive = true;
  render();
}

function render() {
  function renderApp(props: any) {
    return <App syncedState={props.syncedState} sendServerCommand={sendServerCommand} startGodMode={startGodMode}/>;
  }
  ReactDOM.render(
    <BrowserRouter>
      <div>
        {
          localState.isGodModeActive ?
              <GodModePage syncedState={syncedState} socket={socket} renderApp={renderApp}/> :
            <App syncedState={syncedState} sendServerCommand={sendServerCommand} startGodMode={startGodMode}/>
        }
      </div>
    </BrowserRouter>
    ,
    document.getElementById('root') as HTMLElement
  );
}

render();
registerServiceWorker();

socket.on('command', (clientCommand: ClientCommand) => {
  console.log('got client command:', clientCommand);
  switch (clientCommand.commandName) {
    case 'SyncCompleteState':
      syncedState = clientCommand.state;
      break;
    case 'SyncStatePatch':
      syncedState = patch(syncedState, clientCommand.statePatch);
      console.log('new state', syncedState);
      break;
    default:
      assertUnreachable(clientCommand);
  }
  render();
});

startGodMode();



