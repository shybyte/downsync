import * as React from 'react';
import {SyncedState} from '../../shared/synced-state';
import {GOD_COMMAND_EVENT_NAME, GodModeClientCommand} from "../shared/god-mode-commands";
import {GodState} from "../shared/god-state";

interface GodModeProps {
  socket: SocketIOClient.Socket;
  syncedState?: SyncedState;
}

interface PageState {
  godState: GodState;
}


class GodModePage extends React.Component<GodModeProps, PageState> {
  onUndo = () => {
    this.props.socket.emit('godCommand', {commandName: 'undo'});
  }

  componentDidMount() {
    this.props.socket.emit('godCommand', {commandName: 'subscribeToGodState'});
    this.props.socket.on(GOD_COMMAND_EVENT_NAME, (command: GodModeClientCommand) => {
      switch (command.commandName) {
        case 'SyncGodState':
          console.log('got god state', command.state);
          break;
        default:
          console.log('Unknown command', command.commandName);
      }
    });
  }

  render() {
    return (
      <div>
        <button onClick={this.onUndo}>Undo</button>
      </div>
    );
  }
}

export default GodModePage;
