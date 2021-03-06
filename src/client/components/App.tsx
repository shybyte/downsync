import * as React from 'react';
import './App.css';
import {SyncedState} from '../../shared/synced-state';
import {ServerCommand} from '../../shared/server-commands';
import ArticlesPage from './articles/ArticlesPage';
import {Route, Switch} from 'react-router';
import ArticlePage from './article/ArticlePage';
import {NavLink} from 'react-router-dom';

interface AppProps {
  sendServerCommand: (command: ServerCommand) => void;
  syncedState?: SyncedState;
  startGodMode: () => void;
}

class App extends React.Component<AppProps, {}> {
  increase = () => {
    this.props.sendServerCommand({commandName: 'IncreaseCount'});
  }

  render() {
    const renderWhenSynced = (syncedState: SyncedState) => {
      return (
        <div>
          <p>Count: {syncedState.count}</p>
          <button onClick={this.increase}>+</button>
          <Switch>
            <Route
              path="/article/:articleId"
              render={(routeProps) =>
                <ArticlePage
                  sendServerCommand={this.props.sendServerCommand}
                  syncedState={syncedState}
                  articleId={routeProps.match.params.articleId}
                  routeProps={routeProps}
                />
              }
            />
            <Route
              path="/"
              render={() =>
                <ArticlesPage
                  sendServerCommand={this.props.sendServerCommand}
                  syncedState={syncedState}
                />
              }
            />
          </Switch>
        </div>);
    };

    return (
      <div className="App">
        <div className="App-header">
          <NavLink to="/" exact={true}>Home</NavLink>
          <a
            href="#"
            onClick={(ev) => {
              ev.preventDefault();
              this.props.startGodMode();
            }}
          >
            GodMode
          </a>
        </div>
        <div className="App-intro">
          {this.props.syncedState ? renderWhenSynced(this.props.syncedState)
            : <div>Loading</div>
          }
        </div>
      </div>
    );
  }
}

export default App;
