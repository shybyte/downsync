import * as React from 'react';
import {ServerCommand} from '../../../shared/server-commands';
import {Article, sanitizeArticleDisplayName, validateDisplayName} from '../../../shared/article';


interface ArticleGeneralTabProps {
  sendServerCommand: (command: ServerCommand) => void;
  articles: Article[];
  article: Article;
}

interface State {
  displayName: string;
  displayNameError?: string;
  comment: string;
}


class ArticleGeneralTab extends React.Component<ArticleGeneralTabProps, State> {
  constructor(props: ArticleGeneralTabProps) {
    super(props);
    this.state = {
      displayName: props.article.displayName,
      comment: props.article.comment,
    };
  }

  onDisplayNameChange = (ev: React.SyntheticEvent<HTMLInputElement>) => {
    const displayName = sanitizeArticleDisplayName(ev.currentTarget.value);
    this.setState({
      displayName: displayName,
      displayNameError: validateDisplayName(this.props.articles, this.props.article.id, displayName)
    });
  }

  onCommentChange = (ev: React.SyntheticEvent<HTMLTextAreaElement>) => {
    this.setState({comment: ev.currentTarget.value.trim()});
  }

  onSubmit = (ev: React.FormEvent<any>) => {
    ev.preventDefault();
    this.props.sendServerCommand({
      commandName: 'SaveArticle',
      id: this.props.article.id,
      displayName: this.state.displayName,
      comment: this.state.comment,
    });
  }

  canSave() {
    const hasSomethingChanged = this.props.article.comment !== this.state.comment ||
      this.props.article.displayName !== this.state.displayName;
    return hasSomethingChanged && !this.state.displayNameError;
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
            <div>
              <input
                defaultValue={article.displayName}
                autoFocus={!article.builtIn}
                disabled={article.builtIn}
                onChange={this.onDisplayNameChange}
              />
              {this.state.displayNameError && <div>{this.state.displayNameError}</div>}
            </div>
          </div>
          <div>
            <textarea
              defaultValue={article.comment}
              autoFocus={article.builtIn}
              onChange={this.onCommentChange}
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
