import * as express from 'express';
import * as ioStatic from 'socket.io'
import * as http from 'http';

const app = express();
const server = http.createServer(app);
const io = ioStatic(server);

io.on('connection', socket => {
  console.log('a user connected');
  socket.emit("sync", {data: 123});
});

app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>');
});

server.listen(8000, () => {
  console.log('listening on *:8000');
});