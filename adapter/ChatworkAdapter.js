HTTPS = require('https');

var CHATWORK_TOKEN = process.env.NODE_CHATWORK_TOKEN;
var CHATWORK_ROOM_ID = process.env.NODE_CHATWORK_ROOM_ID;

var ChatworkAPI = function(token) {
  var get = function(path, body, callback) { return request("GET", path, body, callback); };
  var post = function(path, body, callback) { return request("POST", path, body, callback); };
  var put = function(path, body, callback) { return request("PUT", path, body, callback); };

  var request = function(method, path, body, callback) {
    var headers, options, request;
    headers = {
      "Host": 'api.chatwork.com',
      "X-ChatWorkToken": token
    };
    var hasBody = body;
    options = {
      "agent": false,
      "host": 'api.chatwork.com',
      "port": 443,
      "path": "/v1" + path,
      "method": method,
      "headers": headers
    };
    if(hasBody) {
      body = new Buffer(body);
      options.headers["Content-Length"] = body.length;
    }

    options.headers["Content-Type"] = "application/x-www-form-urlencoded";
    request = HTTPS.request(options, function(response) {
      var data;
      data = "";
      response.on("data", function(chunk) { return data += chunk });
      response.on("end", function() {
        var e, json;
        if (response.statusCode >= 400) {
          switch (response.statusCode) {
            case 401:
              throw new Error("Invalid access token provided");
              break;
            default:
              console.error("Chatwork HTTPS status code: " + response.statusCode);
              console.error("Chatwork HTTPS response data: " + data);
          }
        }
        if (callback) {
          json = (function() {
            try {
              return JSON.parse(data);
            } catch (_error) {
              e = _error;
              return data || {};
            }
          })();
          return callback(null, json);
        }
      });
      return response.on("error", function(err) {
        console.error("Chatwork HTTPS response error: " + err);
        return callback(err, {});
      });
    });
    if(hasBody) {
      request.end(body, 'binary');
    } else {
      request.end(null, 'binary');
    }

    return request.on("error", function(err) {
      return console.error("Chatwork request error: " + err);
    });
  };
  return {
    My: function() {
      return {
        status: function(callback) {
          return get("/my/status", "", callback);
        },
        tasks: function(opts, callback) {
          var body, params;
          params = [];
          if (opts.assignedBy != null) {
            params.push("assigned_by_account_id=" + opts.assignedBy);
          }
          if (opts.status != null) {
            params.push("status=" + opts.status);
          }
          body = params.join('&');
          return get("/my/tasks", body, callback);
        }
      }
    },

    Room: function(roomId) {
      var baseUrl = "/rooms/" + roomId;
      return {
        Messages: function() {
          return {
            create: function(text, callback) {
              var body = "body=" + text;
              return post("" + baseUrl + "/messages", body, callback);
            },
            list: function(callback) {
              return get("" + baseUrl + "/messages?force=0", null, callback);
            }
          }
        }
      }
    }

  }
};

var chatworkAPI = ChatworkAPI(CHATWORK_TOKEN);

/**
* 新しいタスクを監視する
* newTasksCallback: function(newTasks)
*/
var listenTask = function(newTasksCallback) {
  var lastTaskId = null;
  var INTERVAL = 30 * 1000;

  var filterNewTasks = function(tasks) {
    console.log(lastTaskId)
    var result = [];
    if(lastTaskId == null) {
      lastTaskId = tasks[tasks.length - 1].task_id;
      return result;
    }
    var isNewTask = false;
    for(var i = 0; i < tasks.length; i++) {
      var task = tasks[i];
      if(task.task_id == lastTaskId) {
        isNewTask = true;
        continue;
      } else if(!isNewTask) {
        continue;
      }
      console.log("has new task")
      result.push(task);
    }

    lastTaskId = tasks[tasks.length - 1].task_id;
    return result;
  }

  setInterval(function() {
    console.log("listen tasks");
    chatworkAPI.My().tasks({}, function(err,data) {
      if(err) {
        console.error(err)
        return;
      }
      console.error(data)
      var newTasks = filterNewTasks(data);
      if(newTasks.length > 0) {
        console.log("-> new tasks exist");
        newTasksCallback(newTasks);
      } else {
        console.log("-> no new tasks");
      }
    });
  }, INTERVAL);
};

/**
* 送信メッセージの本文を生成する
*/
var createMessageBody = function(msg, to, toName) {
  var message = "";
  if(to) {
    message += "[To:" + to + "] ";
    if(toName) {
      message += toName;
    }
    message += '\n';
  }
  message += msg;
  return message;
};

/**
* ルームにメッセージを送る
*/
var sendToRoom = function(roomId, msgBody) {
  chatworkAPI.Room(roomId).Messages().create(msgBody, function(err, data) {
    if(err) {
      console.error("send response: " + err);
    } else {
      console.error("send response: " + data);
    }
  });
};

module.exports.adapter = function(robot) {
  listenTask(function(tasks) {
    tasks.forEach(function(task) {
      var msg = {
        body: task.body,
        from: task.assigned_by_account.account_id
      };
      robot.receive(msg, {
        send: function(msgBody, to) {
          sendToRoom(task.room.room_id, createMessageBody(msgBody, to, task.assigned_by_account.name));
        }
      });
    });
  });

  robot.runEnter({
    send: function(msgBody, to) {
      sendToRoom(CHATWORK_ROOM_ID, createMessageBody(msgBody, to));
    }
  });
}
