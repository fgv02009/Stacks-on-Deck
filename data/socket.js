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
    repo.dealUsersCards(roomKey, 5, function(err, data){
      // console.log(data)
    })

    // repo.getHand(roomKey, socket.username, function(err, data){

    // })
   
    repo.getUserKeys(roomKey, function(err, keys){
      var socketKeys = keys
      socketKeys.forEach(function(key){
        console.log(key);
        repo.getHand(roomKey, 'kevin', function(err, data){
          io.to(key).emit("updateHand", data);
        })
      })
    })
  });

});

// function randomHand(quantity){
//   var newHand = []
//   for(var i=0; i < quantity; i++ ){
//     newHand.push(randomCard())
//   }
//   return newHand;
// }

// function randomCard(){
//   var suits = ["hearts", "clubs", "spades", "diamonds"];
//   var values = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "Jack", "Queen", "King", "Ace"];
//   return {suit:_.sample(suits), value: _.sample(values)};
// }