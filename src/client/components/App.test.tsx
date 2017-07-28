import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';
import {ServerCommand} from '../../shared/server-commands';

it('renders without crashing', () => {
  const div = document.createElement('div');
  const syncedState = {
    name: 'TestName',
    count: 123,
    articles: [{
      id: 'dummyId',
      displayName: 'Article 1',
      comment: 'My comment',
      builtIn: true
    }]
  };

  function sendServerCommand(command: ServerCommand) {
   console.log('Got Command', command);
  }

  ReactDOM.render(<App syncedState={syncedState} sendServerCommand={sendServerCommand}/>, div);
});
