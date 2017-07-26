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
  inputElement: HTMLInputElement;

  onSubmit = (ev: React.FormEvent<any>) => {
    ev.preventDefault();
    this.props.sendServerCommand({
      commandName: 'RenameArticle',
      id: this.props.articleId,
      displayName: this.inputElement.value
    });
  }

  render() {
    const {syncedState, articleId} = this.props;
    const article = syncedState.articles.find(hasId(articleId));
    if (!article) {
      return <div>Unknown Article {articleId}</div>;
    }
    return (
      <div>
        <form
          action="#"
          onSubmit={this.onSubmit}
        >
          <input
            defaultValue={article.displayName}
            disabled={article.builtIn}
            ref={(el) => this.inputElement = el!}
          />
          <button>Save</button>
        </form>
      </div>
    );
  }
}

export default ArticlePage;
