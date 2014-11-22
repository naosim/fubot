module.exports = function(robot) {
  // 正規表現にマッチしたら答える
  // msg: {body: string, from: any}
  robot.hear(/Hello/i, function(msg, sender) {
    sender.send("Hello! Hello!", msg.from);
  });

  // マッチはboolを返すfunctionでもOK
  // msg: {body: string, from: any}
  robot.hear(
    function(msg) {
      return msg.body.indexOf('バカ') != -1
    },
    function(msg, sender) {
      sender.send("バカって言うやつがバカ！", msg.from);
    }
  );

  // 定期的実行する (時刻を知らせる)
  robot.enter(function(sender) {
    setInterval(function() {
      sender.send("At " + new Date());
    }, 60 * 1000);
    sender.send("At " + new Date());
  });
}
