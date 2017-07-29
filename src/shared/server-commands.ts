import {ArticleId} from './article';

export interface IncreaseCountCommand {
  commandName: 'IncreaseCount';
}

export interface CopyArticleCommand {
  commandName: 'CopyArticle';
  id: ArticleId;
}

export interface SaveArticleCommand {
  commandName: 'SaveArticle';
  id: ArticleId;
  displayName: string;
  comment: string;
}

export interface DeleteArticleCommand {
  commandName: 'DeleteArticle';
  id: ArticleId;
}


export type ServerCommand =
  | IncreaseCountCommand
  | CopyArticleCommand
  | DeleteArticleCommand
  | SaveArticleCommand;