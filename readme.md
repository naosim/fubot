# FUBOT
github HUBOTのパクリです。  

![fubot](http://naosim.ninpou.jp/img/fubot.png)

## 使ってみる
- インストール
```
git clone https://github.com/naosim/fubot.git
cd fubot
npm install
```

- 実行
```
node app.js
```

- 会話  
  - ブラウザで`http://localhost:3000/web/`にアクセスする。
  - ブラウザのDeveloperConsoleを開く
  - DeveloperConsoleに
  ```
  say('Hello')
  ```
  と入力する  
  → `はろー`が返れば成功。

## 会話のカスタマイズ
会話は`scripts/script.js`を変更することでカスタマイズできます。  
以下、カスタマイズ例です。
### "Hi"に対して"Hi! Hi!"を返す
- `scripts/script.js`を開く
- 下記を追加する
```
robot.hear(/Hi/i, function(msg, sender) {
    sender.send("Hi! Hi!", msg.from);
});
```
- アプリを再起動
```
node app.js
```
- ブラウザのDeveloperConsoleに`say('Hi')`と入力する  
→`Hi! Hi!`が返れば成功。

## ChatWorkAdapter
Chatworkで会話できるようにします。  
- ChatworkのAPITokenを取得する  
  Chatworkのサイトで取得してください。※取得には数日かかります。
- ルームIDを確認する  
 たとえばルームのURLが`https://www.chatwork.com/#!rid123456`なら、ルームIDは`123456`です。
- 自分(bot)のIDを確認する
  自分宛にtoでメッセージを送るとわかります。数値型です。
- Adapterの設定、APIToken、ルームIDを環境変数に指定してアプリを起動する
`NODE_ADAPTER_SCRIPT=ChatworkAdapter.js NODE_CHATWORK_TOKEN=xxxxxx NODE_CHATWORK_USER_ID=xxxx NODE_CHATWORK_ROOM_ID=xxxx node app.js`
- ChatworkでTokenを取得したユーザにタスク「Hello」をふる  
  タイムラインに`はろー`と表示されれば成功  
  ※表示までに最大30秒かかります。
### 余談：TOが自分の場合だけ反応させる
先ほどの例は、すべてのメッセージに反応しますが
sctipt.jsでこんな感じに書くと、自分宛のメッセージのみに反応するようにできます。
```
robot.hear(
  function(msg) {
    return msg.body.indexOf('hello') != -1 && msg.isMe
  },
  function(msg, sender) {
    sender.send("はろー", msg.from);
  }
);
```

## Adapterを自作する
- `/adapter`ディレクトリ内にjsファイルを作って実装してください。  
  実行時に環境変数`NODE_ADAPTER_SCRIPT`にファイル名を指定すると読み込まれます。

- Adapterの実装
  - module.exports.adapterを実装する
  ```
  module.exports.adapter = function(robot) {}
  ```
  - 引数`robot`の仕様は、fubot/fubot.jsを参照
  - `module.exports.adapter`内で`robot.runEnter(sender)`を呼ぶ
  - メッセージが到着したら`robot.receive(msg, sender)`を呼ぶ
