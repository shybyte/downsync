import {ArticleId} from './article';

interface IncreaseCountCommand {
  commandName: 'IncreaseCount';
}

interface CopyArticleCommand {
  commandName: 'CopyArticle';
  id: ArticleId;
}

interface RenameArticleCommand {
  commandName: 'RenameArticle';
  id: ArticleId;
  displayName: string;
}

interface DeleteArticleCommand {
  commandName: 'DeleteArticle';
  id: ArticleId;
}


export type ServerCommand =
  | IncreaseCountCommand
  | CopyArticleCommand
  | DeleteArticleCommand
  | RenameArticleCommand;