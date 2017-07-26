import * as express from 'express';
import * as ioStatic from 'socket.io';
import * as http from 'http';
import {ClientCommand} from '../shared/client-commands';
import {Article, ArticleId, canBeDeleted} from '../shared/article';
import {SyncedState} from '../shared/synced-state';
import {ServerCommand} from '../shared/server-commands';
import {assertUnreachable, hasId} from './utils';
import * as R from 'ramda';
import * as shortid from 'shortid';

const app = express();
const server = http.createServer(app);
const io = ioStatic(server);

const syncedState: SyncedState = {
  name: 'Marco',
  count: 0,
  articles: [{
    id: 'dummyId',
    displayName: 'Article 1',
    builtIn: true
  }]
};


function doWithArticle(articleId: ArticleId, action: (article: Article) => void) {
  const article = syncedState.articles.find(hasId(articleId));
  if (article) {
    action(article);
  }
}


io.on('connection', socket => {
  console.log('a user connected');

  function syncState() {
    sendCommand({commandName: 'SyncCompleteState', state: syncedState});
  }


  socket.on('command', (command: ServerCommand) => {
    switch (command.commandName) {
      case 'IncreaseCount':
        syncedState.count += 1;
        break;
      case 'ChangeName':
        syncedState.name = command.name;
        break;
      case 'CopyArticle':
        doWithArticle(command.id, (article) => {
          const clone = R.clone(article);
          clone.id = shortid.generate();
          clone.displayName = article.displayName + ' (Copy)';
          clone.builtIn = false;
          syncedState.articles.push(clone);
        });
        break;
      case 'DeleteArticle':
        doWithArticle(command.id, (article) => {
          if (canBeDeleted(article)) {
            syncedState.articles = R.reject(hasId(article.id), syncedState.articles);
          }
        });
        break;
      default:
        assertUnreachable(command);
    }

    syncState();
  });

  syncState();
});

function sendCommand(clientCommand: ClientCommand) {
  io.emit('command', clientCommand);
}

app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>');
});

server.listen(8000, () => {
  console.log('listening on *:8000');
});