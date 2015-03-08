// core frameworks
var io = require('socket.io')(server);
var _ = require('underscore');
var repo = require('./repository');

// sockets!
io.on('connection', function(socket){
  socket.on("joinRoom", function(data){
    socket.join(data.roomkey, function(error){
      socket.username = data.username;
      repo.createUser(data.roomkey, data.username, socket.id);
      repo.getUsers(data.roomkey, function(err, users){
        io.to(data.roomkey).emit("updateClients", users);
      });
      if(error){console.log("error:" + error);}
    });
  });

  socket.on("dealCards", function(){
    var roomKey = socket.rooms[1];
    repo.createDeck(roomKey);
    repo.dealUsersCards(roomKey, 5);

    repo.getUserKeys(roomKey, function(err, keys){
      var socketKeys = keys
      socketKeys.forEach(function(key){
        repo.getUser(roomKey, key, function(err, username){
          repo.getHand(roomKey, username, function(err, data){
            console.log(data)
            console.log(data.sort());
            io.to(key).emit("updateHand", data.sort());
          })
        })
      })
    })
  });

  socket.on("passCard", function(data){
    var roomKey = socket.rooms[1];
    repo.passCard(roomKey, socket.username, data.toUser, data.passingCard)
    repo.getUserKeys(roomKey, function(err, keys){
      var socketKeys = keys
      socketKeys.forEach(function(key){
        repo.getUser(roomKey, key, function(err, username){
          repo.getHand(roomKey, username, function(err, data){
            io.to(key).emit("updateHand", data.sort());
          })
        })
      })
    })
  })

  socket.on("drawCard", function(){
    var roomKey = socket.rooms[1];
    repo.dealUserCard(roomKey, socket.username);
    repo.getHand(roomKey, socket.username, function(err, data){
      io.to(socket.id).emit("updateHand", data.sort());
    })
  })

  socket.on("passTable", function(card){
    var roomKey = socket.rooms[1];
    repo.passCard(roomKey, socket.username, "Table", card);
    repo.getHand(roomKey, socket.username, function(err, data){
      io.to(socket.id).emit("updateHand", data.sort());
      repo.getUserKeys(roomKey, function(err, keys){
        var socketKeys = keys
        socketKeys.forEach(function(key){
          repo.getHand(roomKey, "Table", function(err, data){
            io.to(key).emit("updateTable", data);
          })
        })
      })
    })
  })

  socket.on("userCollectsTable", function(){
    var roomKey = socket.rooms[1];
    repo.getTable(roomKey, socket.username);
    setTimeout(function(){
      repo.getHand(roomKey, socket.username, function(err, data){
        io.to(socket.id).emit("updateHand", data);
        repo.getUserKeys(roomKey, function(err, keys){
          var socketKeys = keys
          socketKeys.forEach(function(key){
            repo.getHand(roomKey, "Table", function(err, data){
              io.to(key).emit("updateTable", data);
            })
          })
        })
      })
    }, 105)
  })

  socket.on("userDiscardsCard", function(card){
    var roomKey = socket.rooms[1];
    repo.passCard(roomKey, socket.username, "Discard", card);
    repo.getHand(roomKey, socket.username, function(err, data){
      io.to(socket.id).emit("updateHand", data);
      repo.getUserKeys(roomKey, function(err, keys){
        var socketKeys = keys
        socketKeys.forEach(function(key){
          repo.getHand(roomKey, "Discard", function(err, data){
            io.to(key).emit("updateDiscardPile", data);
          })
        })
      })
    })
  })

  socket.on("getTableCard", function(card){
    var roomKey = socket.rooms[1];
    repo.passCard(roomKey, "Table", socket.username, card);
    setTimeout(function(){
      repo.getHand(roomKey, socket.username, function(err, data){
        io.to(socket.id).emit("updateHand", data);
        repo.getUserKeys(roomKey, function(err, keys){
          var socketKeys = keys
          socketKeys.forEach(function(key){
            repo.getHand(roomKey, "Table", function(err, data){
              io.to(key).emit("updateTable", data);
            })
          })
        })
      })
    }, 105)
  })

  socket.on("discardTableCard", function(card){
    var roomKey = socket.rooms[1];
    repo.passCard(roomKey, "Table", "Discard", card);
    repo.getUserKeys(roomKey, function(err, keys){
      var socketKeys = keys
      socketKeys.forEach(function(key){
        repo.getHand(roomKey, "Table", function(err, data){
          io.to(key).emit("updateTable", data);
        })
        repo.getHand(roomKey, "Discard", function(err, data){
          io.to(key).emit("updateDiscardPile", data);
        })
      })
    })
  })

});