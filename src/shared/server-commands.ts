import {ArticleId} from './synced-state';

interface ChangeNameCommand {
  commandName: 'ChangeName';
  name: string;
}

interface IncreaseCountCommand {
  commandName: 'IncreaseCount';
}

interface CopyArticleCommand {
  commandName: 'CopyArticle';
  id: ArticleId;
}


export type ServerCommand = ChangeNameCommand | IncreaseCountCommand | CopyArticleCommand;