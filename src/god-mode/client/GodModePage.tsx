import * as React from 'react';
import {SyncedState} from '../../shared/synced-state';
import {GOD_COMMAND_EVENT_NAME, GodModeClientCommand, GodModeServerCommand} from "../shared/god-mode-commands";
import {GodState} from "../shared/god-state";
import './GodModePage.css';
import * as SplitPane from 'react-split-pane';
import ReactJsonView from 'react-json-view';

console.log('ReactJsonView', ReactJsonView);


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
  state: PageState = {};
  oldSocketId: string;

  onUndo = () => {
    sendGodCommand(this.props.socket, {commandName: 'undo'});
  }

  componentDidMount() {
    this.subscribeToGodState();
  }

  componentWillReceiveProps(nextProps: GodModeProps) {
    console.log('componentWillReceiveProps', this.oldSocketId, nextProps.socket.id);
    if (this.oldSocketId !== nextProps.socket.id) {
      this.subscribeToGodState();
    }
  }

  subscribeToGodState() {
    this.oldSocketId = this.props.socket.id;
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

  onSelectRevisionEvent = (ev: React.SyntheticEvent<HTMLInputElement | HTMLSelectElement>) => {
    this.onSelectRevision(parseInt(ev.currentTarget.value, 10));
  }


  render() {
    const godState = this.state.godState;
    if (!godState) {
      return <div>Loading</div>;
    }
    const currentChange = godState.patchHistory[godState.selectedRevision];
    return (
      <div className="god-mode-page">
        <SplitPane split="horizontal" minSize={40} defaultSize={40}>
          <div className="god-mode-toolbar">
            {godState.selectedRevision} / {godState.patchHistory.length - 1}
            <button onClick={this.onUndo}>Undo</button>
            <input
              type="range"
              min={0}
              max={godState.patchHistory.length - 1}
              step={1}
              value={godState.selectedRevision}
              onChange={this.onSelectRevisionEvent}
            />
            <select
              value={godState.selectedRevision}
              onChange={this.onSelectRevisionEvent}
            >
              {godState.patchHistory.map((delta, i) =>
                <option key={i} value={i}>{i}</option>
              )}
            </select>
          </div>

          <SplitPane split="vertical" minSize={20} defaultSize="50%">
            <div>
              <ReactJsonView src={this.props.syncedState!} name="State" collapsed={true} {...JSON_VIEW_PROPS} />
            </div>

            <SplitPane split="horizontal" minSize={20} defaultSize="50%">
              <ReactJsonView src={currentChange.delta} name="Diff" {...JSON_VIEW_PROPS} />
              <ReactJsonView src={currentChange.command} name="Command" {...JSON_VIEW_PROPS} />
            </SplitPane>
          </SplitPane>
        </SplitPane>
      </div>
    );
  }
}

const JSON_VIEW_PROPS = {
  theme: 'monokai',
  indentWidth: 2,
  displayDataTypes: false
};

export default GodModePage;
