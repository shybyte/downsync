import * as React from 'react';
import {SyncedState} from '../../shared/synced-state';

interface GodModeProps {
  socket: SocketIOClient.Socket;
  syncedState?: SyncedState;
}

class GodModePage extends React.Component<GodModeProps, {}> {
  onUndo = () => {
    this.props.socket.emit('godCommand', {commandName: 'undo'});
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
