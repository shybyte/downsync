import {SyncedState} from "../shared/synced-state";
import {assertUnreachable, hasId} from "../shared/utils";
import {CopyArticleCommand, SaveArticleCommand, ServerCommand} from "../shared/server-commands";
import {Article, ArticleId, canBeDeleted, sanitizeArticleDisplayName, validateDisplayName} from "../shared/article";
import * as R from "ramda";
import shortid = require("shortid");

function doWithArticle(localSyncedState: SyncedState, articleId: ArticleId, action: (article: Article) => void) {
  const article = localSyncedState.articles.find(hasId(articleId));
  if (article) {
    action(article);
  }
}

function copyArticle(newSyncedState: SyncedState, command: CopyArticleCommand) {
  function findNewName(originalName: string, newid: ArticleId) {
    const simpleProposal = originalName + ' (Copy)';
    const existSimpleProposal = newSyncedState.articles.some(a => a.displayName === simpleProposal);
    if (existSimpleProposal) {
      return simpleProposal + ' ' + newid;
    } else {
      return simpleProposal;
    }
  }

  doWithArticle(newSyncedState, command.id, (article) => {
    const clone = R.clone(article);
    clone.id = shortid.generate();
    clone.displayName = findNewName(article.displayName, clone.id);
    clone.builtIn = false;
    newSyncedState.articles.push(clone);
  });
}

function saveArticle(newSyncedState: SyncedState, command: SaveArticleCommand) {
  doWithArticle(newSyncedState, command.id, (article) => {
    if (!article.builtIn) {
      const newDisplayName = sanitizeArticleDisplayName(command.displayName);
      const validationError = validateDisplayName(newSyncedState.articles, article.id, newDisplayName);
      if (validationError) {
        console.error('Error in SaveArticle:', command, validationError);
        return;
      }
      article.displayName = newDisplayName;
    }
    article.comment = command.comment;
  });
}

export function executeServerCommand(newSyncedState: SyncedState, command: ServerCommand) {
  switch (command.commandName) {
    case 'IncreaseCount':
      newSyncedState.count += 1;
      break;
    case 'CopyArticle':
      copyArticle(newSyncedState, command);
      break;
    case 'SaveArticle':
      saveArticle(newSyncedState, command);
      break;
    case 'DeleteArticle':
      doWithArticle(newSyncedState, command.id, (article) => {
        if (canBeDeleted(article)) {
          newSyncedState.articles = R.reject(hasId(article.id), newSyncedState.articles);
        }
      });
      break;
    default:
      assertUnreachable(command);
  }
}