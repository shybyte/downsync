import * as React from 'react';
import {ServerCommand} from '../../../shared/server-commands';
import {Article} from '../../../shared/article';


interface ArticleGeneralTabProps {
  sendServerCommand: (command: ServerCommand) => void;
  article: Article;
}

class ArticleGeneralTab extends React.Component<ArticleGeneralTabProps, {}> {
  inputElement: HTMLInputElement;

  onSubmit = (ev: React.FormEvent<any>) => {
    ev.preventDefault();
    this.props.sendServerCommand({
      commandName: 'RenameArticle',
      id: this.props.article.id,
      displayName: this.inputElement.value
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

export default ArticleGeneralTab;
