import * as React from 'react';
import {ServerCommand} from '../../../shared/server-commands';
import {Article} from '../../../shared/article';


interface ArticleGeneralTabProps {
  sendServerCommand: (command: ServerCommand) => void;
  article: Article;
}

interface State {
  displayName: string;
  comment: string;
}


class ArticleGeneralTab extends React.Component<ArticleGeneralTabProps, State> {
  inputElement: HTMLInputElement;
  commentTextAreaElement: HTMLTextAreaElement;

  constructor(props: ArticleGeneralTabProps) {
    super(props);
    this.state = {
      displayName: props.article.displayName,
      comment: props.article.comment,
    };
  }


  onDisplayNameChange = (ev: React.SyntheticEvent<HTMLInputElement>) => {
    this.setState({displayName: ev.currentTarget.value});
  }

  onCommentChange = (ev: React.SyntheticEvent<HTMLTextAreaElement>) => {
    this.setState({comment: ev.currentTarget.value});
  }

  onSubmit = (ev: React.FormEvent<any>) => {
    ev.preventDefault();
    this.props.sendServerCommand({
      commandName: 'SaveArticle',
      id: this.props.article.id,
      displayName: this.inputElement.value,
      comment: this.commentTextAreaElement.value
    });
  }

  canSave() {
    return this.props.article.comment !== this.state.comment ||
      this.props.article.displayName !== this.state.displayName;
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
              onChange={this.onDisplayNameChange}
              ref={(el) => this.inputElement = el!}
            />
          </div>
          <div>
            <textarea
              defaultValue={article.comment}
              autoFocus={article.builtIn}
              onChange={this.onCommentChange}
              ref={(el) => this.commentTextAreaElement = el!}
            />
          </div>
          <button
            disabled={!this.canSave()}
          >Save
          </button>
        </form>
      </div>
    );
  }
}

export default ArticleGeneralTab;
