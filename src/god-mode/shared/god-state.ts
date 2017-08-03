import {Delta} from "jsondiffpatch";

export type RevisionId = number;

export interface GodState<C= Object> {
  patchHistory: StateChange<C>[];
  selectedRevision: RevisionId;
}

export interface StateChange<C= Object> {
  time: number;
  delta: Delta;
  command: C;
}
