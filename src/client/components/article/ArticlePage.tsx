import * as React from 'react';
import {SyncedState} from '../../../shared/synced-state';
import {ServerCommand} from '../../../shared/server-commands';
import {ArticleId} from '../../../shared/article';
import {hasId} from '../../../shared/utils';
import ArticleGeneralTab from "./ArticleGeneralTab";
import {Route, RouteComponentProps, Switch} from "react-router";
import ArticleDetailsTab from "./ArticleDetailsTab";
import {NavLink} from "react-router-dom";


interface ArticlePageProps {
  sendServerCommand: (command: ServerCommand) => void;
  syncedState: SyncedState;
  articleId: ArticleId;
  routeProps: RouteComponentProps<any>;
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
    const {sendServerCommand, syncedState, articleId, routeProps} = this.props;
    const article = syncedState.articles.find(hasId(articleId));
    if (!article) {
      return <div>Unknown Article {articleId}</div>;
    }

    const detailsLink = routeProps.match.url + '/details';
    return (
      <div>
        <NavLink to={routeProps.match.url} exact={true}>General</NavLink>
        <NavLink to={detailsLink} exact={true}>Details</NavLink>
        <Switch>
          <Route
            path={detailsLink}
            render={() =>
              <ArticleDetailsTab sendServerCommand={sendServerCommand} article={article}/>
            }
          />
          <Route
            path={routeProps.match.url}
            render={() =>
              <ArticleGeneralTab sendServerCommand={sendServerCommand} article={article}/>
            }
          />
        </Switch>
      </div>
    );
  }
}

export default ArticlePage;
