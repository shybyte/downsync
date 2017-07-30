import * as React from 'react';
import {SyncedState} from '../../shared/synced-state';
import {GOD_COMMAND_EVENT_NAME, GodModeClientCommand, GodModeServerCommand} from "../shared/god-mode-commands";
import {GodState} from "../shared/god-state";

interface GodModeProps {
  socket: SocketIOClient.Socket;
  syncedState?: SyncedState;
}

interface PageState {
  godState?: GodState;
}

function sendGodCommand(socket: SocketIOClient.Socket, godCommand: GodModeServerCommand) {
  socket.emit(GOD_COMMAND_EVENT_NAME, godCommand);
}


class GodModePage extends React.Component<GodModeProps, PageState> {
  state: PageState = {
  };

  onUndo = () => {
    sendGodCommand(this.props.socket, {commandName: 'undo'});
  }

  componentDidMount() {
    sendGodCommand(this.props.socket, {commandName: 'subscribeToGodState'});
    this.props.socket.on(GOD_COMMAND_EVENT_NAME, (command: GodModeClientCommand) => {
      switch (command.commandName) {
        case 'SyncGodState':
          console.log('got god state', command.state);
          this.setState({godState: command.state});
          break;
        default:
          console.log('Unknown command', command.commandName);
      }
    });
  }

  onSelectRevision(revision: number) {
    sendGodCommand(this.props.socket, {commandName: 'selectStateRevision', revision});
  }

  render() {
    const godState = this.state.godState;
    if (!godState) {
      return <div>Loading</div>;
    }
    return (
      <div>
        <button onClick={this.onUndo}>Undo</button>
        {godState.patchHistory.map((delta, i) => {
          return <button key={i} onClick={() => this.onSelectRevision(i)} title={JSON.stringify(delta)}>{i}</button>;
        })}
      </div>
    );
  }
}

export default GodModePage;
