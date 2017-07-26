export type ArticleId = string;

export interface Article {
  id: ArticleId;
  displayName: string;
  builtIn: boolean;
}


export interface SyncedState {
  name: string;
  count: number;
  articles: Article[];
}
