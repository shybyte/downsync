import * as React from 'react';
import './App.css';
import {Article, SyncedState} from '../../shared/synced-state';
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

  onCopy = (article: Article) => {
    this.props.sendServerCommand({commandName: 'CopyArticle', id: article.id});
  }

  onDelete = (article: Article) => {
    this.props.sendServerCommand({commandName: 'DeleteArticle', id: article.id});
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
              <table>
                <thead>
                <tr>
                  <th>Name</th>
                  <th>BuiltIn</th>
                  <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {
                  syncedState.articles.map(article => (
                    <tr key={article.id}>
                      <td>{article.displayName}</td>
                      <td>{article.builtIn ? 'yes' : ''}</td>
                      <td>
                        <button onClick={() => this.onCopy(article)}>Copy</button>
                        <button onClick={() => this.onDelete(article)}>Delete</button>
                      </td>
                    </tr>))
                }
                </tbody>
              </table>

            </div> : <div>Loading</div>
          }

        </div>
      </div>
    );
  }
}

export default App;
