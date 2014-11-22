var fubot = require(__dirname + '/fubot/fubot.js');
var robot = fubot.Robot();
var example = require(__dirname + '/scripts/script.js')(robot);

// 環境変数NODE_ADAPTER_SCRIPTからアダプタのスクリプトを決める
// デフォルトは SocketAdapter.js
var DEFAULT_ADAPTER_SCRIPT = 'SocketAdapter.js';
var ADAPTER_SCRIPT_PATH = __dirname + '/adapter/' + (process.env.NODE_ADAPTER_SCRIPT || DEFAULT_ADAPTER_SCRIPT);

require(ADAPTER_SCRIPT_PATH).adapter(robot);
