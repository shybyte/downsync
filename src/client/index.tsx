import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './components/App';
import registerServiceWorker from './registerServiceWorker';
import './index.css';
import * as io from 'socket.io-client';

interface SyncedState {
  name: string;
}


ReactDOM.render(
  <App />,
  document.getElementById('root') as HTMLElement
);
registerServiceWorker();


const socket = io('http://localhost:8000');

socket.on('sync', function(data: SyncedState){
  console.log('welcome!', data);
});




