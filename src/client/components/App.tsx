import * as React from 'react';
import './App.css';
import {SyncedState} from '../../shared/synced-state';
import {ServerCommand} from '../../shared/server-commands';

const logo = require('./logo.svg');

interface AppProps {
  sendServerCommand: (command: ServerCommand) => void;
  syncedState?: SyncedState;
}

class App extends React.Component<AppProps, {}> {
  increase = () => {
    this.props.sendServerCommand({commandName: 'IncreaseCount'});
  }

  render() {
    const {syncedState} = this.props;
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo"/>
          <h2>Welcome to DownSync!</h2>
        </div>
        <div className="App-intro">
          {syncedState ?
            <div>
              <p>Name: {syncedState.name}</p>
              <p>Count: {syncedState.count}</p>
              <button onClick={this.increase}>+</button>
            </div> : <div>Loading</div>
          }

        </div>
      </div>
    );
  }
}

export default App;
