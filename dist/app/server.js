var http = require('http');

httpServer = http.createServer(function(req, res) {
    console.log("start");
});
//port server

httpServer.listen(1337);
 
var io = require('socket.io').listen(httpServer);
var users = {};
var nbr_room = -1;
var room_name = 'room';

io.sockets.on('connection', function(socket) {

    var me = false;
    console.log('nouveau utilisateur');

    for (var k in users) {
        console.log(k)
        socket.emit('newuser', users[k]);
    }
    socket.on('login', function(user) {
        me = user;
        console.log(me.username, 'test');

        if (users[me.username] == undefined ) {
 
       	socket.emit('logged');
       
        me.socket_id = socket.id;
        users[me.username] = me;
         console.log(users)
        io.sockets.emit('newuser', me);
        socket.emit('current_user', me);
        }
        else{
        	console.log('deja pris');
        	socket.emit('change_pseudo', me);
        }
      


    })




    socket.on('invite', function(id, username, current_user_id) {

        socket.broadcast.to(id).emit('invite_send', {
            username: username,
            id: current_user_id
        });
    });


    socket.on('launch', function(data) {

        socket.emit('launch_send');
        socket.broadcast.to(data.id_coop).emit('launch_send');


    });


    socket.on('create', function() {

        nbr_room++
        if (nbr_room == 2) {
            nbr_room = 0;
            room_name = 'rom_name' + me.socket_id

        }
        if (nbr_room == 1) {
            socket.emit('aveugle')
        }

        console.log(room_name, 'room name');
        
         me.room = room_name;
         console.log(users, 'users_test');
        socket.join(room_name);
        delete users[me.username];
        io.sockets.emit('disuseur', me);
        socket.emit('start', room_name);
    });

    socket.on('share_map', function(map_and_current_room) {
    	socket.broadcast.to(map_and_current_room.current_room).emit('send_map', map_and_current_room.map);
    });

    socket.on('mouvement', function(mouvement) {
        console.log(mouvement, 'mouvement')
        direction = mouvement.direction;
         io.in(mouvement.current_room).emit('recive', direction);
    })

    socket.on('sound', function(mouvement) {

        direction = mouvement.direction;
        socket.broadcast.to(mouvement.current_room).emit('sound_send', direction);

    })

    socket.on('game_over', function(current_room) {

        io.in(current_room).emit('game_over_send');

    })

    socket.on('success', function(current_room) {
        io.in(current_room).emit('success_send');

    })
    socket.on('reset', function(current_room) {

        io.in(current_room).emit('reset_send');
    })



    console.log(users)
    socket.on('disconnect', function() {

        if (!me) {
            return false;
        }
        delete users[me.username];
        io.sockets.emit('disuseur', me);
        console.log(users)
        socket.broadcast.to(me.room).emit('disconenct_room');
        
    })


});

