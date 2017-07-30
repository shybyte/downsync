import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';
import {ServerCommand} from '../../shared/server-commands';
import {MemoryRouter} from "react-router";

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

  function startGodMode() {
    // just a dummy
  }

  ReactDOM.render(
    (
      <MemoryRouter>
        <App
          syncedState={syncedState}
          sendServerCommand={sendServerCommand}
          startGodMode={startGodMode}
        />
      </MemoryRouter>
    ),
    div
  );
});
