# FUBOT
github HUBOTのパクリです。

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
  → `Hello! Hello!`が返れば成功。

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
ただし、ChatworkAPI側のメッセージ一覧取得が未実装なため
実際は会話ではなく、
タスクを追加するとそれに対して反応するような動きになります。
 (早くAPI実装してほしいなぁ。。)
- ChatworkのAPITokenを取得する  
  Chatworkのサイトで取得してください。※取得には数日かかります。
- ルームIDを確認する  
 たとえばルームのURLが`https://www.chatwork.com/#!rid123456`なら、ルームIDは`123456`です。
- Adapterの設定、APIToken、ルームIDを環境変数に指定してアプリを起動する
`NODE_ADAPTER_SCRIPT=ChatworkAdapter.js NODE_CHATWORK_TOKEN=xxxx NODE_CHATWORK_ROOM_ID=xxxxxx node app.js`
- ChatworkでTokenを取得したユーザにタスク「Hello」をふる  
  タイムラインに`Hello! Hello!`と表示されれば成功  
  ※表示までに最大30秒かかります。

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
