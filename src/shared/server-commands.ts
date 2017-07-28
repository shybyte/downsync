import {ArticleId} from './article';

interface IncreaseCountCommand {
  commandName: 'IncreaseCount';
}

interface CopyArticleCommand {
  commandName: 'CopyArticle';
  id: ArticleId;
}

interface SaveArticleCommand {
  commandName: 'SaveArticle';
  id: ArticleId;
  displayName: string;
  comment: string;
}

interface DeleteArticleCommand {
  commandName: 'DeleteArticle';
  id: ArticleId;
}


export type ServerCommand =
  | IncreaseCountCommand
  | CopyArticleCommand
  | DeleteArticleCommand
  | SaveArticleCommand;