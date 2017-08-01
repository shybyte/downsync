import {Delta} from "jsondiffpatch";

export type RevisionId = number;

export interface GodState {
  patchHistory: Delta[];
  selectedRevision: RevisionId;
}
