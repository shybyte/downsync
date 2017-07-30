import {Delta} from "jsondiffpatch";

export interface GodState {
  patchHistory: Delta[];
}
