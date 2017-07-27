import * as express from 'express';
import * as ioStatic from 'socket.io';
import * as http from 'http';
import {ClientCommand} from '../shared/client-commands';
import {Article, ArticleId, canBeDeleted} from '../shared/article';
import {SyncedState} from '../shared/synced-state';
import {ServerCommand} from '../shared/server-commands';
import {assertUnreachable, hasId} from '../shared/utils';
import * as R from 'ramda';
import * as shortid from 'shortid';
import {DiffPatcher} from 'jsondiffpatch';
import deepFreezeStrict = require('deep-freeze-strict');

const diffPatcher = new DiffPatcher({});


const app = express();
const server = http.createServer(app);
const io = ioStatic(server);

let syncedState: SyncedState = deepFreezeStrict({
  name: 'Marco',
  count: 0,
  articles: [{
    id: 'dummyId',
    displayName: 'Article 1',
    builtIn: true
  }]
});


function doWithArticle(localSyncedState: SyncedState, articleId: ArticleId, action: (article: Article) => void) {
  const article = localSyncedState.articles.find(hasId(articleId));
  if (article) {
    action(article);
  }
}

function sendCommand(clientCommand: ClientCommand) {
  io.emit('command', clientCommand);
}


io.on('connection', socket => {
  console.log('a user connected');

  function syncCompleteState() {
    sendCommand({commandName: 'SyncCompleteState', state: syncedState});
  }

  socket.on('command', (command: ServerCommand) => {
    const newSyncedState = R.clone(syncedState);
    switch (command.commandName) {
      case 'IncreaseCount':
        newSyncedState.count += 1;
        break;
      case 'ChangeName':
        newSyncedState.name = command.name;
        break;
      case 'CopyArticle':
        doWithArticle(newSyncedState, command.id, (article) => {
          const clone = R.clone(article);
          clone.id = shortid.generate();
          clone.displayName = article.displayName + ' (Copy)';
          clone.builtIn = false;
          newSyncedState.articles.push(clone);
        });
        break;
      case 'RenameArticle':
        doWithArticle(newSyncedState, command.id, (article) => {
          if (!article.builtIn) {
            article.displayName = command.displayName;
          }
        });
        break;
      case 'DeleteArticle':
        doWithArticle(newSyncedState, command.id, (article) => {
          if (canBeDeleted(article)) {
            newSyncedState.articles = R.reject(hasId(article.id), syncedState.articles);
          }
        });
        break;
      default:
        assertUnreachable(command);
    }

    const statePatch = diffPatcher.diff(syncedState, newSyncedState);
    sendCommand({commandName: 'SyncStatePatch', statePatch: statePatch!});

    syncedState = deepFreezeStrict(newSyncedState);
  });

  syncCompleteState();
});

app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>');
});

server.listen(8000, () => {
  console.log('listening on *:8000');
});