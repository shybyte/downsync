import * as React from 'react';
import {SyncedState} from '../../../shared/synced-state';
import {ServerCommand} from '../../../shared/server-commands';
import {ArticleId} from '../../../shared/article';
import {hasId} from '../../../shared/utils';


interface ArticlePageProps {
  sendServerCommand: (command: ServerCommand) => void;
  syncedState: SyncedState;
  articleId: ArticleId;
}

class ArticlePage extends React.Component<ArticlePageProps, {}> {
  render() {
    const {syncedState, articleId} = this.props;
    const article = syncedState.articles.find(hasId(articleId));
    if (!article) {
      return <div>Unknown Article {articleId}</div>;
    }
    return (
      <div>
        <input defaultValue={article.displayName} disabled={article.builtIn}/>
      </div>
    );
  }
}

export default ArticlePage;
