var fs = require('fs');

module.exports.Robot = function() {
  var paterns = [];
  var enterCallback = function(){};
  return {
    /**
    * 送られてきたメッセージに対してマッチさせ、そのとき実行する処理を登録する。
    * scriptsディレクトリ内のスクリプトで呼ばれることを想定。
    * patern: マッチパターン。正規表現。
    * callback :function(sender) マッチした場合の処理。引数のsenderにはsend(msgBody, to)が実装されている。
    */
    hear: function(patern, callback) { paterns.push({patern: patern, callback: callback }) },

    /**
    * 起動時に１度だけ実行する処理を登録する。
    * scriptsディレクトリ内のスクリプトで呼ばれることを想定。
    * callback :function(sender) マッチした場合の処理。引数のsenderにはsend(msgBody, to)が実装されている。
    */
    enter: function(callback) { enterCallback = callback },

    /**
    * adapterのスクリプトで、起動時に１度だけ呼ぶこと。
    * sender: sender.send(msgBody, to)が実装されていること。
    */
    runEnter: function(sender) { enterCallback(sender) },

    /**
    * adapterのスクリプトで、メッセージが届くたびに呼ぶこと。
    * msg: {body: string, from: any}
    * sender: sender.send(msgBody, to)が実装されていること。
    */
    receive: function(msg, sender) {
      for(var i = 0; i < paterns.length; i++) {
        var isMatch;
        if(paterns[i].patern instanceof RegExp) {
          isMatch = msg.body.match(paterns[i].patern)
        } else {
          isMatch = paterns[i].patern(msg)
        }
        
        if(isMatch) {
          paterns[i].callback(msg, sender)
          break;
        }
      }
    }
  }
};
