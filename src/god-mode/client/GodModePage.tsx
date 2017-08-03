import * as React from 'react';
import {SyncedState} from '../../shared/synced-state';
import {GOD_COMMAND_EVENT_NAME, GodModeClientCommand, GodModeServerCommand} from "../shared/god-mode-commands";
import {GodState} from "../shared/god-state";
import './GodModePage.css';
import * as SplitPane from 'react-split-pane';
import ReactJsonView from 'react-json-view';
import {getStateOfRevision} from "../../shared/json-diff-patch";

console.log('ReactJsonView', ReactJsonView);


interface GodModeProps {
  socket: SocketIOClient.Socket;
  syncedState?: SyncedState;
  renderApp: (props: any) => JSX.Element;
}

interface PageState {
  loadedGodState?: LoadedGodState;
}

interface LoadedGodState {
  godState: GodState;
  syncedState: SyncedState;
  selectedRevision: number;
}

function sendGodCommand(socket: SocketIOClient.Socket, godCommand: GodModeServerCommand) {
  socket.emit(GOD_COMMAND_EVENT_NAME, godCommand);
}

class GodModePage extends React.Component<GodModeProps, PageState> {
  oldSocketId: string;
  state: PageState = {};

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
          this.setState({
            loadedGodState: {
              godState: command.state,
              syncedState: this.props.syncedState!,
              selectedRevision: command.state.patchHistory.length - 1
            }
          });
          break;
        default:
          console.log('Unknown command', command.commandName);
      }
    });
  }

  onSelectRevision(revision: number) {
    console.log('onSelectRevisionEvent', revision);
    const loadedGodState = this.state.loadedGodState!;
    const newSyncedState = getStateOfRevision(loadedGodState.syncedState,
                                              loadedGodState.godState.patchHistory.map(x => x.delta),
                                              loadedGodState.selectedRevision, revision);
    this.setState({
      loadedGodState: {
        ...loadedGodState,
        syncedState: newSyncedState,
        selectedRevision: revision
      }
    });
  }

  onSelectRevisionEvent = (ev: React.SyntheticEvent<HTMLInputElement | HTMLSelectElement>) => {
    this.onSelectRevision(parseInt(ev.currentTarget.value, 10));
  }


  render() {
    const loadedGodState = this.state.loadedGodState;
    if (!loadedGodState) {
      return <div>Loading</div>;
    }
    const {godState, selectedRevision, syncedState} = loadedGodState;
    const currentChange = godState.patchHistory[selectedRevision];
    return (
      <SplitPane split="horizontal" minSize={50} defaultSize="50%">
        <div className="god-mode-page">
          <SplitPane split="horizontal" minSize={40} defaultSize={40}>
            <div className="god-mode-toolbar">
              {selectedRevision} / {godState.patchHistory.length - 1}
              <input
                type="range"
                min={0}
                max={godState.patchHistory.length - 1}
                step={1}
                value={selectedRevision}
                onChange={this.onSelectRevisionEvent}
              />
              <select
                value={selectedRevision}
                onChange={this.onSelectRevisionEvent}
              >
                {godState.patchHistory.map((delta, i) =>
                  <option key={i} value={i}>{i}</option>
                )}
              </select>

              <span className="dateTime">{formatDate(new Date(currentChange.time))}</span>

            </div>

            <SplitPane split="vertical" minSize={20} defaultSize="50%">
              <div>
                <ReactJsonView src={syncedState} name="State" collapsed={true} {...JSON_VIEW_PROPS} />
              </div>

              <SplitPane split="horizontal" minSize={20} defaultSize="50%">
                <ReactJsonView src={currentChange.delta} name="Diff" {...JSON_VIEW_PROPS} />
                <ReactJsonView src={currentChange.command} name="Command" {...JSON_VIEW_PROPS} />
              </SplitPane>
            </SplitPane>
          </SplitPane>
        </div>
        {this.props.renderApp({syncedState: syncedState})}
      </SplitPane>
    );
  }
}

const JSON_VIEW_PROPS = {
  theme: 'monokai',
  indentWidth: 2,
  displayDataTypes: false
};

function formatDate(date: Date) {
  const localTime = date.toLocaleTimeString();
  const localDate = date.toLocaleDateString();
  return localTime + ' ' + localDate;
}

export default GodModePage;
