import * as React from 'react';
import {SyncedState} from '../../shared/synced-state';
import {GOD_COMMAND_EVENT_NAME, GodModeClientCommand, GodModeServerCommand} from "../shared/god-mode-commands";
import {GodState, RevisionId, StateChange} from "../shared/god-state";
import './GodModePage.css';
import * as SplitPane from 'react-split-pane';
import ReactJsonView from 'react-json-view';
import {getStateOfRevision} from "../../shared/json-diff-patch";
import {assertUnreachable} from "../../shared/utils";
import throttle = require('lodash.throttle');

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
  selectedRevision: RevisionId;
}

function sendGodCommand(socket: SocketIOClient.Socket, godCommand: GodModeServerCommand) {
  socket.emit(GOD_COMMAND_EVENT_NAME, godCommand);
}

class GodModePage extends React.Component<GodModeProps, PageState> {
  oldSocket?: SocketIOClient.Socket;
  state: PageState = {};
  selectedRevisionRangeElement: HTMLInputElement;
  selectedRevisionSelectElement: HTMLSelectElement;

  componentDidMount() {
    this.subscribeToGodState(this.props.socket);
  }

  componentWillReceiveProps(nextProps: GodModeProps) {
    console.log('componentWillReceiveProps', this.oldSocket && this.oldSocket.id, nextProps.socket.id);
    if (this.oldSocket !== nextProps.socket) {
      this.subscribeToGodState(nextProps.socket);
    }
  }

  subscribeToGodState(socket: SocketIOClient.Socket) {
    console.log('subscribeToGodState');
    this.oldSocket = socket;
    sendGodCommand(this.props.socket, {commandName: 'subscribeToGodState'});
    socket.on(GOD_COMMAND_EVENT_NAME, this.onGodCommand);
    socket.on('disconnect', () => {
      console.log('disconnected', socket.id);
      socket.off(GOD_COMMAND_EVENT_NAME, this.onGodCommand);
      this.oldSocket = undefined;
    });
  }

  private onGodCommand = (command: GodModeClientCommand) => {
    switch (command.commandName) {
      case 'SyncCompleteGodState':
        console.log('got complete god state', command.state);
        this.setLoadedGodState(command.state.patchHistory);
        break;
      case 'SyncChange':
        console.log('got new change', command.stateChange);
        const patchHistory = this.state.loadedGodState!.godState.patchHistory;
        patchHistory.push(command.stateChange);
        this.setLoadedGodState(patchHistory);
        break;
      default:
        console.log('Unknown command', command);
        assertUnreachable(command);
    }
  }

  private setLoadedGodState(stateChanges: StateChange[]) {
    const latestRevision = stateChanges.length - 1;
    this.setState({
      loadedGodState: {
        godState: {patchHistory: stateChanges},
        syncedState: this.props.syncedState!,
        selectedRevision: latestRevision
      }
    });
    this.applySelectedRevisionToInputElements(latestRevision);
  }

  private applySelectedRevisionToInputElements(revision: RevisionId) {
    const revisionString = '' + revision;
    this.selectedRevisionRangeElement.value = revisionString;
    this.selectedRevisionSelectElement.value = revisionString;
  }

  onSelectRevision = (revision: RevisionId) => {
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

  onSelectRevisionThrottled = throttle(this.onSelectRevision, 500);

  onSelectRevisionEvent = (ev: React.SyntheticEvent<HTMLInputElement | HTMLSelectElement>) => {
    const revisionId = parseInt(ev.currentTarget.value, 10);
    this.applySelectedRevisionToInputElements(revisionId);
    this.onSelectRevisionThrottled(revisionId);
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
              <input
                type="range"
                min={0}
                max={godState.patchHistory.length - 1}
                step={1}
                defaultValue={'' + selectedRevision}
                onChange={this.onSelectRevisionEvent}
                ref={el => this.selectedRevisionRangeElement = el!}
              />
              <select
                defaultValue={'' + selectedRevision}
                onChange={this.onSelectRevisionEvent}
                ref={el => this.selectedRevisionSelectElement = el!}
              >
                {godState.patchHistory.map((delta, i) =>
                  <option key={i} value={i}>{i}</option>
                )}
              </select>

              of {godState.patchHistory.length - 1}
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
