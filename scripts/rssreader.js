var FeedParser = require('feedparser')
  , request = require('request');

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
    feedparser: function() {
      var feedparser = new FeedParser();
      feedparser.on('error', function(error) {
      });
      feedparser.on('readable', function() {// itemを見つけるたびに呼ばれる
        var stream = this
          , meta = this.meta // **NOTE** the "meta" is always available in the context of the feedparser instance
          , item;

        while (item = stream.read()) {
          if(!feedSet.exists(meta.title, item.title)) {
            if(callback) callback(item);
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

var crawlTask = function(rssUrls, newItenFeedCrawler) {
  return function() {
    console.log('start request ' + new Date());
    rssUrls.forEach(function(rssUrl) {
      var req = request(rssUrl);
      req.on('error', function (error) {
        console.log(error)
      });
      req.on('response', function (res) {
        var stream = this;
        if (res.statusCode != 200) return this.emit('error', new Error('Bad status code'));
        stream.pipe(newItenFeedCrawler.feedparser());
      });
    });
  };
};
var newItenFeedCrawler = NewItemFeedcrawler();

module.exports.all = function() {
  return newItenFeedCrawler.all();
};

module.exports.run = function(rssUrls, sender) {
  var newFeedCallback = function(item) {
    console.log(item.title);
    sender.send(item.title);
  };

  setInterval(crawlTask(rssUrls, newItenFeedCrawler), 3 * 60 * 1000);
  crawlTask(rssUrls, newItenFeedCrawler)();

  // 初回取得をコールバックさせないために
  // 時間差でセットする
  setTimeout(function() {
    newItenFeedCrawler.setCallback(newFeedCallback);
  },10 * 1000);
};
