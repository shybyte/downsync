import * as React from 'react';
import {ServerCommand} from '../../../shared/server-commands';
import {Article} from '../../../shared/article';


interface ArticleDetailsTabProps {
  sendServerCommand: (command: ServerCommand) => void;
  article: Article;
}

class ArticleDetailsTab extends React.Component<ArticleDetailsTabProps, {}> {

  render() {
    return (
      <div>
        <h1>Detail</h1>
      </div>
    );
  }
}

export default ArticleDetailsTab;
