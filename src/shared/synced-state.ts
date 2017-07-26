import {Article} from './article';

export interface SyncedState {
  name: string;
  count: number;
  articles: Article[];
}
