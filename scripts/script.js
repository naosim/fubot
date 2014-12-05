var rssreader = require(__dirname + '/rssreader.js');

module.exports = function(robot) {
  // 正規表現にマッチしたら答える
  // msg: {body: string, from: any}
  robot.hear(/Hello/i, function(msg, sender) {
    sender.send("はろー", msg.from);
  });

  robot.hear(/all/i, function(msg, sender) {
    var sites = rssreader.all();
    var result = '';
    Object.keys(sites).forEach(function(key) {
      result += key + '\n';
      Object.keys(sites[key]).forEach(function(key) {
        result += '  ' + key + '\n'
      });
    });
    sender.send(result, msg.from);
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
    var rssUrls = [
      {url: 'http://b.hatena.ne.jp/hotentry/it.rss', tag: 'it'},
      {url: 'http://b.hatena.ne.jp/hotentry/fun.rss', tag: null},
    ];
    var newFeedCallback = function(item, rss) {
      console.log(item.title, item.link, item.description);
      item['tag'] = rss.tag;
      sender.send(item);
    };
    rssreader.run(rssUrls, newFeedCallback);
    // setInterval(function() {
    //   sender.send("At " + new Date());
    // }, 60 * 1000);
    // sender.send("At " + new Date());
  });
}
