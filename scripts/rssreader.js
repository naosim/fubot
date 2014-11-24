var FeedParser = require('feedparser')
  , request = require('request');

var INTERVAL_EACH_URL = 10 * 1000;
var MIN_INTERVAL = 3 * 60 * 1000;

/**
* 新しいフィードが見つかったらコールバックに返す
*/
var NewItemFeedcrawler = function() {
  var FeedSet = function() {
    var sites = {};
    return {
      exists: function(siteTitle, itemTitle) {
        if(!sites[siteTitle]) sites[siteTitle] = {};
        return sites[siteTitle][itemTitle];
      },
      put: function(siteTitle, itemTitle) {
        if(!sites[siteTitle]) sites[siteTitle] = {};
        sites[siteTitle][itemTitle] = true;
      },
      all: function() {
        return sites;
      }
    }
  };

  var feedSet = FeedSet();
  var callback;
  return {
    // 新しいフィードが見つかったときのコールバック
    setCallback: function(incallback) {
      callback = incallback;
    },
    feedparser: function(userData) {
      var feedparser = new FeedParser();
      feedparser.on('error', function(error) {
      });
      feedparser.on('readable', function() {// itemを見つけるたびに呼ばれる
        var stream = this
          , meta = this.meta // **NOTE** the "meta" is always available in the context of the feedparser instance
          , item;

        while (item = stream.read()) {
          if(!feedSet.exists(meta.title, item.title)) {
            if(callback) callback(item, userData);
            feedSet.put(meta.title, item.title);
          }
        }
      });
      return feedparser;
    },
    // 取得したすべてのフィード
    all: function() {
      return feedSet.all();
    }

  }
}

var Crawl = function(newItenFeedCrawler) {
  return {
    start: function(rss) {
      // console.log('start ' + rss.url);
      var req = request(rss.url);
      req.on('error', function (error) {
        console.log(error, rss.url)
      });
      req.on('response', function (res) {
        var stream = this;
        if (res.statusCode != 200) return this.emit('error', new Error('Bad status code ' + res.statusCode + ' ' + rss.url));
        stream.pipe(newItenFeedCrawler.feedparser(rss));
      });
    }
  }
};

var newItenFeedCrawler = NewItemFeedcrawler();

module.exports.all = function() {
  return newItenFeedCrawler.all();
};

module.exports.run = function(rsses, newFeedCallback) {
  var crawl = Crawl(newItenFeedCrawler);

  rsses.forEach(function(rss, index) {
    setTimeout(function() {
    setInterval(function(){ crawl.start(rss) }, Math.max(INTERVAL_EACH_URL * rsses.length, MIN_INTERVAL))
      crawl.start(rss);
    }, index * INTERVAL_EACH_URL + (15 * 1000));// 15秒後から随時開始
  });

  rsses.forEach(crawl.start);

  // 初回取得をコールバックさせないために
  // 時間差でセットする
  setTimeout(function() {
    newItenFeedCrawler.setCallback(newFeedCallback);
  }, 10 * 1000);
};
