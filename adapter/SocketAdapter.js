module.exports.adapter = function(robot) {
  var app = require('express')();
  var http = require('http').Server(app);
  var io = require('socket.io')(http);
  var port = process.env.NODE_PORT || 3000
  io.on('connection', function (socket) {
      console.log('a user connected : ' + socket.id);
      socket.on('disconnect', function () {
          console.log('user disconnected');
      });
      socket.on('message', function (msg) {
        console.log(msg);
        // メッセージが来たらrobot.receiveをコールする。
        // msg = {body: string, from: string}
        // senderを渡す。
        // senderはsender.send(msgBody, to)が実装されていること。
        robot.receive(msg, {
          send: function(msgBody, to) {
            if(to) {
              socket.emit('message', to + 'さん。\n' + msgBody);
            } else {
              socket.emit('message', msgBody);
            }

          }
        });
      });
  });
  app.get('/web/', function (req, res) {
      res.sendFile(process.argv[1].substring(0, process.argv[1].lastIndexOf('/')) + '/public/index.html');
  });
  http.listen(port, function () {
      console.log('listening on localhost:' + port + '/web/');
      console.log('Talk with me by Developer Console on Browser!!');
  });

  //セットアップが終わったらrunEnterをコールすること
  var sender = {
    send: function(msg) {
      io.sockets.emit('message', msg);
    }
  };
  robot.runEnter(sender);
};
