import * as React from 'react';
import {ServerCommand} from '../../../shared/server-commands';
import {Article} from '../../../shared/article';


interface ArticleGeneralTabProps {
  sendServerCommand: (command: ServerCommand) => void;
  article: Article;
}

class ArticleGeneralTab extends React.Component<ArticleGeneralTabProps, {}> {
  inputElement: HTMLInputElement;
  commentTextAreaElement: HTMLTextAreaElement;

  onSubmit = (ev: React.FormEvent<any>) => {
    ev.preventDefault();
    this.props.sendServerCommand({
      commandName: 'SaveArticle',
      id: this.props.article.id,
      displayName: this.inputElement.value,
      comment: this.commentTextAreaElement.value
    });
  }

  render() {
    const {article} = this.props;
    return (
      <div>
        <form
          action="#"
          onSubmit={this.onSubmit}
        >
          <div>
            <input
              defaultValue={article.displayName}
              autoFocus={!article.builtIn}
              disabled={article.builtIn}
              ref={(el) => this.inputElement = el!}
            />
          </div>
          <div>
            <textarea
              defaultValue={article.comment}
              autoFocus={article.builtIn}
              ref={(el) => this.commentTextAreaElement = el!}
            />
          </div>
          <button>Save</button>
        </form>
      </div>
    );
  }
}

export default ArticleGeneralTab;
