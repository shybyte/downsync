import * as React from 'react';
import {SyncedState} from '../../../shared/synced-state';
import {ServerCommand} from '../../../shared/server-commands';
import {Article, canBeDeleted} from '../../../shared/article';
import {Link} from 'react-router-dom';


interface ArticlesPageProps {
  sendServerCommand: (command: ServerCommand) => void;
  syncedState: SyncedState;
}

class ArticlesPage extends React.Component<ArticlesPageProps, {}> {
  onCopy = (article: Article) => {
    this.props.sendServerCommand({commandName: 'CopyArticle', id: article.id});
  }

  onDelete = (article: Article) => {
    this.props.sendServerCommand({commandName: 'DeleteArticle', id: article.id});
  }

  render() {
    const {syncedState} = this.props;
    return (
      <div>
        <table>
          <thead>
          <tr>
            <th>Name</th>
            <th>BuiltIn</th>
            <th>Actions</th>
          </tr>
          </thead>
          <tbody>
          {
            syncedState.articles.map(article => (
              <tr key={article.id}>
                <td><Link to={`article/${article.id}`}>{article.displayName}</Link></td>
                <td>{article.builtIn ? 'yes' : ''}</td>
                <td>
                  <button onClick={() => this.onCopy(article)}>Copy</button>
                  <button onClick={() => this.onDelete(article)} disabled={!canBeDeleted(article)}>Delete</button>
                </td>
              </tr>))
          }
          </tbody>
        </table>

      </div>
    );
  }
}

export default ArticlesPage;
