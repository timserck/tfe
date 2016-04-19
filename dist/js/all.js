jQuery(document).ready(function($) {
    var level = 0;
    var animation_ai;
    var socket = io.connect('http://localhost:1337');
    var game_over = false;
    var sucess_level = false;
    var current_room = '';
    var all_success = 0;
    var role = 'guide';
    var nbrUser = 0;
    //compteur
    var mouvement = 0;
    var nbr_mouvement;



    console.log('game_over' + game_over);

    function reset() {

        myMap.create();
        $('.game_over').fadeOut();
        game_over = false;
        sucess_level = false;
        //current position = 0;
        myMap.currentPositionperso = {
            x: 0,
            y: 0
        };
        //current position perso == 00
        Myperso.perso.finish().css({
            left: 65,
            top: 35
        });
        //animate
        // badPerso.start();

    }

    //login
    $('#login').submit(function(event) {
        event.preventDefault();
        var username = $('#pseudo').val();
        if (username == '') {
            $('.error_pseudo').fadeIn();
        }else{

        socket.emit('login', {
            username: username
        });
         }
    });

    socket.on('change_pseudo', function(me) {
    $('.error_pseudo').fadeIn();
    });


    socket.on('newuser', function(user) {
        nbrUser++
        if(nbrUser == 1){
           $('#users div ul').append('<li><a id="noUser">no useur for the moment</a></li>'); 
        }
        if (nbrUser >= 2) {
           $('#users div ul #noUser').parent().remove();
        }

             

        $('#users div ul').append('<li > <a class="room" data-id="' + user.socket_id + '" href="#" id = "' + user.username + '">' + user.username + '</a></li>');

        $('.room').click(function(event) {
            event.preventDefault();
            var username = $('.current_user').text();
            var current_user_id = $('.current_user').attr("data-id");
            var socket_id = $(this).attr("data-id");
            socket.emit('invite', socket_id, username, current_user_id);

            $('.user_invite_feedback').text($(this).text());
            $('.ask_join').slideDown(400);

        });
    });
    socket.on('invite_send', function(client) {
        console.log('invite_client', client)
        $('.user_invite').html(client.username).attr('data-id', client.id);
        $('.join').slideDown(400);
    })

    socket.on('current_user', function(me) {
        console.log(me, 'me')
        $('.current_user').text(me.username).attr('data-id', me.socket_id);
        $('#' + me.username).parent().remove();


    })

    socket.on('disuseur', function(user) {
        level = 0;
        $('#' + user.username).parent().remove();
         nbrUser--;
          if(nbrUser == 1){
           $('#users div ul').append('<li><a id="noUser">no useur for the moment</a></li>'); 
        }
        if (nbrUser == 2) {
           $('#users div ul #noUser').parent().remove();
        }

    });
    ///////////////////
    // unjoin 
    /////////

    $('.unjoin_room').click(function(event) {
        event.preventDefault();
        $('.join').slideUp(400);
    });

    $('.join_room').click(function(event) {
        event.preventDefault();
        var id_coop = $('.user_invite').attr('data-id');
        console.log(id_coop, "id_coop");

        socket.emit('launch', {
            id_coop: id_coop
        });


    });

    socket.on('launch_send', function() {
        socket.emit('create');
    });


    socket.on('start', function(current_room_recive) {
        console.log(current_room_recive, 'in');
        current_room = current_room_recive;
        $('#users').fadeOut();


        myMap.create();


    });

    $('.start_game').click(function(event) {
        Myperso.displayRole(role);
         myMap.displayScore(level);  

        });

       socket.on('disconenct_room', function() {
        // console.log('deconnection autre joueur');
        $("<div class='restart_box center-e'><div><h2>Sorry</h2><p> your coop has left the game.</p><a class='restart' href=''>Try again</a></div></div>").appendTo('body').fadeIn();

    });


    ////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////
    //map
    /////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////
    var Map = function() {};

    //display score
    Map.prototype.displayScore = function(level){

         $('#score_current').empty();
        $("<h1> level : " + level + "</h1>").appendTo('#score_current').fadeIn(2000).fadeOut(2000);         

    }
    // variable posible map generate
    Map.prototype.value = [1, 2, 3];
    // generate random matrice 2d 4x4
    Map.prototype.randomDecorMatrice = function() {

        var MX = new Array(4);
        for (i = 0; i < 4; i++) {
            MX[i] = new Array(4);
            for (j = 0; j < 4; j++) {

                MX[i][j] = this.value[Math.floor(Math.random() * 3)];

            }
        }
        //star no under the wather


        return MX;
    };

    Map.prototype.randomWayMatrice = function() {

        var MX_chemin = [];
        for (var i = 0; i < 4; i++) {
            MX_chemin[i] = [];
            for (var j = 0; j < 4; j++) {
                MX_chemin[i][j] = 0;
            }
        }

        var Position_currentPosx = 0;
        var Position_currentPosy = 0;
        var Position_destinationPosx = 3;
        var Position_destinationPosy = 3;

        while (Position_currentPosx != Position_destinationPosx || Position_currentPosy != Position_destinationPosy) {

            var nombreRandom = Math.floor(Math.random() * 2);

            if (nombreRandom === 0) {
                if (Position_currentPosx < Position_destinationPosx) {
                    Position_currentPosx++;
                    MX_chemin[Position_currentPosx][Position_currentPosy] = 99; //appartient au chemin
                } else

                {
                    Position_currentPosy++;
                    MX_chemin[Position_currentPosx][Position_currentPosy] = 99; //appartient au chemin     
                }
            } else {
                if (Position_currentPosy < Position_destinationPosy) {
                    Position_currentPosy++;
                    MX_chemin[Position_currentPosx][Position_currentPosy] = 99; //appartient au chemin
                } else {
                    Position_currentPosx++;
                    MX_chemin[Position_currentPosx][Position_currentPosy] = 99; //appartient au chemin     
                }
            }
        }

        return MX_chemin;
    };
     Map.prototype.Matrice_bomb = '';


    Map.prototype.bombMatrice = function(Nbr_bomb) {
        var Position_bomb = {
            x: 0,
            y: 0
        };
        var Matrice = [

            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]

        ];

        if (level == 1) { Matrice[0][2] = 1; }

        if (level == 2) { Matrice[0][2] = 0; }

        else{



            for (var i = Nbr_bomb; i > 0; i--) {

                Position_bomb.x = Math.floor(Math.random() * 3);
                // console.log('bomb_x = ' + Position_bomb.x + ' ' + i);
                Position_bomb.y = Math.floor(Math.random() * 3);
                // console.log('bomb_y = ' + Position_bomb.y + ' ' + i);

                // verifier si la bomb est deja placer recommence la boucleµ
                // bombe sur les premiere case interdit
                if ((Matrice[Position_bomb.x][Position_bomb.y] == 1) || (Position_bomb.y === 3 && Position_bomb.x === 3) || (Position_bomb.y === 0 && Position_bomb.x === 0) || (Position_bomb.y === 1 && Position_bomb.x === 0) || (Position_bomb.x === 1 && Position_bomb.y === 0) || (Position_bomb.y === 1 && Position_bomb.x === 1)) {
                    i++;
                }
                //verifier la nature du terrain
                else {

                    Matrice[Position_bomb.x][Position_bomb.y] = 1;
                }
            }
            
        }
        this.Matrice_bomb = Matrice;
        this.getPositionBombDom(this.Matrice_bomb);
    };    




    Map.prototype.bombAction = function(){
        if (level === 1) {
         
            this.matrice =  [

                [0, 99, 99, 1],
                [99, 99, 99,1],
                [99, 99, 99, 1],
                [1, 1, 99, 0],

            ];
          
            this.generate();


        }
    };
    Map.prototype.getPositionBombDom = function(){

               caseBomb = [];
        for (var j = 0; j < this.Matrice_bomb.length; j++) {

            for (var i = 0; i < this.Matrice_bomb.length; i++) {

                if (this.Matrice_bomb[j][i] === 1) {
                   // console.log( ' case bomb j : '+ j + ' i :'+ i);
                   // matrice + perso + enemi ....
                   caseBomb.push( (j*4) + i + 1 + 3);
                   // console.log(caseBomb, 'caseBomb');
                }
            }
        }
        this.bombDisplay(caseBomb);

    };

       Map.prototype.bombDisplay = function(caseBomb){
             $('.part_map').removeClass('bombAction');
            for (var i = caseBomb.length - 1; i >= 0; i--) {

                // console.log('caseBomb[i]', caseBomb[i]);
                $('.part_map:nth-child('+ (caseBomb[i] ) +')').addClass('bombAction');
               
            }
        };
    Map.prototype.sumMatrice = function() {

        var a = this.randomWayMatrice();
        var b = this.randomDecorMatrice();
        var c = [];
        for (var k = 0; k < 4; k++) {
            c[k] = new Array(4);
        }



        for (var j = 0; j < c.length; j++) {
            // console.log(j)


            for (var i = 0; i < c.length; i++) {

                c[j][i] = a[j][i] + b[j][i];

                // console.log( this.randomWayMatrice()[j][i] + this.randomDecorMatrice()[j][i]);

            }

        }
          // console.log('nbrs de level' + level);
        //
         if (level === 0) {
            c = [
                [0, 99, 99, 99],
                [99, 99, 99,99],
                [99, 99, 99, 99],
                [99, 99, 99, 0],
            ];
        }

        if (level === 1) {
            c = [
                [0, 99, 99, 1],
                [99, 99, 99,1],
                [99, 99, 99, 1],
                [1, 1, 1, 0],
            ];
        }

        if (level === 2) {
            c = [
                [0, 99, 99, 1],
                [1, 1, 99, 99],
                [1, 99, 99, 1],
                [1, 1, 99, 0],
            ];
        }

        if (level === 3) {
            c = [
                [99, 1, 2, 1],
                [99, 1, 99, 1],
                [99, 99, 99, 99],
                [99, 1, 2, 1],
            ];
        }
         if (level === 4) {
            c = [
                [99, 2, 99, 99],
                [3, 3, 3, 2],
                [2, 2, 3, 3],
                [99, 2, 3, 99],
            ];
        }

          if (level === 5) {
            c = [
                [99, 1, 99, 99],
                [99, 1, 99, 99],
                [99, 99, 1, 99],
                [99, 99, 1, 99],
            ];
        }
        this.matrice = c;


    };

    // matrice object create here
    Map.prototype.matrice = '';

    Map.prototype.currentPositionperso = {
        x: 0,
        y: 0
    };

    Map.prototype.positionPersoMatrice = function(deplacement) {

        switch (deplacement) {
            case 'left':
                this.currentPositionperso.x--;
                break;
            case 'right':
                this.currentPositionperso.x++;
                break;
            case 'up':
                this.currentPositionperso.y--;
                break;
            case 'down':
                this.currentPositionperso.y++;
                break;
        }

        var terrainMatrice = this.matrice[this.currentPositionperso.y][this.currentPositionperso.x];
        var terrainBomb = this.Matrice_bomb[this.currentPositionperso.y][this.currentPositionperso.x];

        this.terrainAction(terrainMatrice);

    };
 //////////////////////////////////////////////////////////
 /////  teleport action
 /////////////////////////////////////////////////
var caseTeleport = [];

 Map.prototype.matriceTeleport = [
           [0,0,0,0],
           [0,0,0,0],
           [0,0,0,0],
           [0,0,0,0] ];

 Map.prototype.teleportInit = function(){

       switch(level) {
            case 0 :
              this.matriceTeleport =    [
            [0,0,0,0],
           [0,0,1,0],
           [0,1,0,0],
           [0,0,0,0],
           ];
                break;

                 case 5 :
              this.matriceTeleport =    [
            [0,0,1,0],
           [0,0,0,0],
           [0,0,0,0],
           [0,1,0,0],
           ];
                break;
      
            default: 
                 this.matriceTeleport =    [
            [0,0,0,0],
           [0,0,0,0],
           [0,0,0,0],
           [0,0,0,0],
           ];

        }

         caseTeleport = [];
        for (var j = 0; j < this.matriceTeleport.length; j++) {

            for (var i = 0; i < this.matriceTeleport.length; i++) {

                if (this.matriceTeleport[j][i] === 1) {
                   // console.log( ' case teleport j : '+ j + ' i :'+ i);
                   // matrice + perso + enemi ....
                   caseTeleport.push( (j*4) + i + 1 + 3);
                   // console.log(caseTeleport, 'caseTeleport');
                }
            }
        }

        this.teleportDisplay();

 };

   Map.prototype.teleportDisplay = function(){
             $('.part_map').removeClass('teleportAction');
            for (var i = caseTeleport.length - 1; i >= 0; i--) {

                // console.log('caseTeleport[i]', caseTeleport[i]);
                $('.part_map:nth-child('+ (caseTeleport[i] ) +')').addClass('teleportAction');
               
            }
        };

    Map.prototype.teleportActif = function(direction){


        switch(direction) {

                case 'left' :

                  if ( this.matriceTeleport[this.currentPositionperso.y ][this.currentPositionperso.x - 1] === 1  ) {
                  // console.log(' teleport left direction');
                    this.currentPositionperso.x = this.currentPositionperso.x - 1;
                    this.teleportActionVerification();

                  }
                  
                break;
                case 'right':


                if ( this.matriceTeleport[this.currentPositionperso.y ][this.currentPositionperso.x + 1] === 1  ) {
                  // console.log(' teleport right direction');
                    this.currentPositionperso.x = this.currentPositionperso.x + 1;

                    this.teleportActionVerification();

                }

                break;

                case 'up':
               

                if ( this.matriceTeleport[this.currentPositionperso.y - 1][this.currentPositionperso.x ] === 1  ) {
                     // console.log(' teleport up direction');
                    this.currentPositionperso.y = this.currentPositionperso.y - 1;

                    this.teleportActionVerification();
                }

                break;

                case 'down':

                if ( this.matriceTeleport[this.currentPositionperso.y + 1][this.currentPositionperso.x ] === 1  ) {
                     // console.log(' teleport down direction');
                    this.currentPositionperso.y = this.currentPositionperso.y + 1;
                    this.teleportActionVerification(direction);

                }

                break;
          }  

    };

    var postionTeleportFinal = {
        x:0,
        y: 0
     };

    Map.prototype.teleportActionVerification = function(direction){

            for (var j = 0; j < this.matriceTeleport.length; j++) {

            for (var i = 0; i < this.matriceTeleport.length; i++) {
                
                if (this.matriceTeleport[j][i] == 1 && j !== this.currentPositionperso.y && i !== this.currentPositionperso.x ) {

                   // console.log('j dans le tableau : ' + j  + ' i dans le tableau : ' + i + ' x position current perso: ' + this.currentPositionperso.x + ' y position perso : ' + this.currentPositionperso.y );
                  // console.log('position autre =  j '+ j + ' i : ' + i );
                  //set position current


                  postionTeleportFinal = {
                    x: i,
                    y: j
                };
               

                }

            }
        }
                 // current position perso == 00
                Myperso.perso.finish().css({
                    left: (postionTeleportFinal.x * 100) +  65,
                    top: (postionTeleportFinal.y * 100) + 35
                });

                  myMap.currentPositionperso = {
                    x: postionTeleportFinal.x,
                    y: postionTeleportFinal.y
                };

    };


 //////////////////////////////////////////////////////////
 /////  double action
 /////////////////////////////////////////////////
      var caseDoubleAction = [];

     Map.prototype.matriceDoubleDirection = [
           [0,0,0,0],
           [0,0,0,0],
           [0,0,0,0],
           [0,0,0,0],
        ];


        // for each value display de symble double action
    Map.prototype.addDoubleAction = function(){
             $('.part_map').removeClass('doubleAction');
            for (var i = caseDoubleAction.length - 1; i >= 0; i--) {

                // console.log('caseDoubleAction[i]', caseDoubleAction[i]);
                $('.part_map:nth-child('+ (caseDoubleAction[i] ) +')').addClass('doubleAction');
               
            }
        };
//retourne les numero de case avec double direction
    Map.prototype.doubleDirectionChange = function(){

        switch(level) {
            case 0 :
              this.matriceDoubleDirection =    [
            [0,0,0,0],
           [0,0,0,0],
           [0,0,1,0],
           [0,0,0,0],
           ];
                break;
            case 3 :
                      this.matriceDoubleDirection =    [
            [0,0,0,0],
           [0,0,0,0],
           [0,0,1,0],
           [0,0,0,0],
           ];
                break;
            default: 
                 this.matriceDoubleDirection =    [
            [0,0,0,0],
           [0,0,0,0],
           [0,0,0,0],
           [0,0,0,0],
           ];

        }

        caseDoubleAction = [];
        for (var j = 0; j < this.matriceDoubleDirection.length; j++) {

            for (var i = 0; i < this.matriceDoubleDirection.length; i++) {

                if (this.matriceDoubleDirection[j][i] === 1) {
                   // console.log( 'j : '+ j + ' i :'+ i);
                   // matrice + perso + enemi ....
                   caseDoubleAction.push( (j*4) + i + 1 + 3);
                   // console.log(caseDoubleAction, 'caseDoubleAction');
                }
            }
        }

        this.addDoubleAction();
    };

 

    Map.prototype.doubleActionActif = function(direction){

        if ( this.matriceDoubleDirection[this.currentPositionperso.y][this.currentPositionperso.x ] === 1 ) {
            // console.log('you are in double action case' + direction);

          switch(direction) {

                case 'left' :

                  // console.log('left direction');
                  if ( this.currentPositionperso.x - 2 <= 3 && this.currentPositionperso.x  >= 0 ) {

                    Myperso[direction]();
                    myMap.positionPersoMatrice(direction);
                    Myperso.displayCurrentPosition();

                  }
                  
                break;
                case 'right':

                // console.log('right direction');
                if ( this.currentPositionperso.x + 2 <= 3 && this.currentPositionperso.x >= 0 ) {

                    Myperso[direction]();
                    myMap.positionPersoMatrice(direction);
                    Myperso.displayCurrentPosition();

                }

                break;

                case 'up':
                // console.log('up direction');

                if ( this.currentPositionperso.y - 2 <= 3 && this.currentPositionperso.y >= 0 ) {

                    Myperso[direction]();
                    myMap.positionPersoMatrice(direction);
                    Myperso.displayCurrentPosition();

                }

                break;

                case 'down':

                // console.log('down direction');

                if ( this.currentPositionperso.y + 2 <= 3 && this.currentPositionperso.y >= 0 ) {

                    Myperso[direction]();
                    myMap.positionPersoMatrice(direction);
                    Myperso.displayCurrentPosition();

                }

                break;
          }   
        }
    };


               


    var terrainActif = false;

    Map.prototype.terrainActionGlaceActif = function() {



        if (terrainActif === true) {

            // console.log('true transform glace');

            
            this.matrice[this.currentPositionperso.y ][this.currentPositionperso.x ] = 2;
            
            this.generate();

            terrainActif = false;
        }
    };


    Map.prototype.terrainAction = function(terrainMatrice) {

       

        switch (true) {
            case terrainMatrice == 1:
                // console.log('buisson');
                break;
            case terrainMatrice == 2:

                socket.emit('game_over', current_room);

                break;
            case terrainMatrice == 3:
                // console.log('glace');
                terrainActif = true;
                break;
            case terrainMatrice >= 99 && terrainMatrice < 1000:
                // console.log('terre');
                break;
            case terrainMatrice == 1000:
                // console.log('start');
                break;

        }
    };

    // generate de map with the array matrice
    Map.prototype.generate = function() {
        $('.part_map').remove();

        this.matrice[3][3] = 1000;
        this.matrice[0][0] = 1000;
        $.each(this.matrice, function(i, value) {
            $.each(value, function(j, val) {

                //change value of matrice to class name
                switch (true) {
                    case val == 1:
                        val = 'buisson';
                        break;
                    case val == 2:
                        val = 'water';
                        break;
                    case val == 3:
                        val = 'glace';
                        break;
                    case val >= 99 && val < 1000:
                        val = 'terre';
                        break;
                    case val == 1000:
                        val = 'start';
                        break;

                }
                if (val == 'buisson') {

                    $('<div class="part_map"><span class="front"></span><span class="up"></span><span class="side"></span></div>').addClass(val).appendTo('.all_map');

                } else {
                    $('<div class="part_map" />').addClass(val).appendTo('.all_map');

                }

            });
        });
        //active the curent display for aveugle
         $('.part_map:nth-child(4)').addClass('active');

              this.doubleDirectionChange();
         this.teleportInit();
         this.bombMatrice(0);
    };
    Map.prototype.create = function() {
        if (role === 'guide') {

            this.sumMatrice();
            // generate map / html
            // console.log(this.matrice);
            socket.emit('share_map', {
                'map' : this.matrice, 
                'current_room' : current_room
            });
           

             this.generate();
        }
         Myperso.displayRole(role);
         myMap.displayScore(level);   
    };
    Map.prototype.sucess_level = function(){

            if (myMap.currentPositionperso.y == 3 && myMap.currentPositionperso.x == 3) {

                setTimeout(function () { 
                    //nbr de deplacement reset
                    nbr_mouvement = mouvement;
                    mouvement = 0;
                    // console.log(nbr_mouvement,'temps_final');

                    socket.emit('success', current_room);

                }, 2000);

                sucess_level = true;

            }
    }
            
          
    //launch the constructor :  Map
    var myMap = new Map();

     socket.on('send_map', function(map_recive){
        // console.log(map_recive, 'map recive');
        myMap.matrice = map_recive;
        myMap.generate();
         myMap.bombMatrice(0);
         $('.all_map').addClass('aveugle');
         myMap.doubleDirectionChange();
       

     }) 

    socket.on('logged', function() {
        $('.section_login').fadeOut();

    });


    //////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////
    //PERSONNAGE
    /////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////

    var Perso = function() {};

    Perso.prototype.displayRole = function(role){
        $("#role_guide").removeClass('active');
        $("#role_aveugle").removeClass('active');
        if (role == 'guide') {
            $("#role_guide").addClass('active');

        }else{
            $("#role_aveugle").addClass('active');

           
        }
    }

    Perso.prototype.perso = $('.perso');


    // verificationPosition
    Perso.prototype.verficationPosition = function(direction) {


        if (direction == 'left' && myMap.currentPositionperso.x > 0) {

            if (myMap.matrice[myMap.currentPositionperso.y][myMap.currentPositionperso.x - 1] == 1) {
                // console.log('false');
                return false;
            };

            //bomb
            if (myMap.Matrice_bomb[myMap.currentPositionperso.y][myMap.currentPositionperso.x - 1] == 1) {
                // console.log('bomb');
                myMap.bombAction();
            };


            // console.log('true');
            return true;
        };


        if (direction == 'right' && myMap.currentPositionperso.x < 3) {

            if (myMap.matrice[myMap.currentPositionperso.y][myMap.currentPositionperso.x + 1] == 1) {
                // console.log('false');
                return false;
            };

            //bomb
            if (myMap.Matrice_bomb[myMap.currentPositionperso.y][myMap.currentPositionperso.x + 1] == 1) {
                // console.log('bomb');
                myMap.bombAction();
            };
           
            // console.log('true');
            return true;


        }

        if (direction == 'up' && myMap.currentPositionperso.y > 0) {

            if (myMap.matrice[myMap.currentPositionperso.y - 1][myMap.currentPositionperso.x] == 1) {
                // console.log('false');
                return false;
            }
            //bomb
            if (myMap.Matrice_bomb[myMap.currentPositionperso.y - 1][myMap.currentPositionperso.x] == 1) {
                // console.log('bomb');
                myMap.bombAction();
            };
  
            // console.log('true');
            return true;
        }


        if (direction == 'down' && myMap.currentPositionperso.y < 3) {
            if (myMap.matrice[myMap.currentPositionperso.y + 1][myMap.currentPositionperso.x] == 1) {
                // console.log('false');
                return false;
            }
            //bomb
            if (myMap.Matrice_bomb[myMap.currentPositionperso.y + 1][myMap.currentPositionperso.x] == 1) {
                // console.log('bomb');
                myMap.bombAction();
            };

            // console.log('true');
            return true;
        }
        if (myMap.currentPositionperso.y == 3 && myMap.currentPositionperso.x == 3) {

        // console.log('false');
        return false;


        }

      
        // console.log('false');
        return false;

    };
    Perso.prototype.displayCurrentPosition = function(){
        if (role == 'aveugle') {
            //get the nth child div current 
            var displayNumberDiv = (myMap.currentPositionperso.y * 4) + (myMap.currentPositionperso.x ) + 1;
             $('.all_map>.part_map').removeClass('active');
             //counter perso and ai
            $('.all_map>.part_map:nth-child('+ (displayNumberDiv + 3 ) + ')').addClass('active');
         }
       
    }

     


    Perso.prototype.compteur = function(){

         mouvement++;
         // console.log(mouvement,'mouvement');

      
    }


    Perso.prototype.left = function() {
        this.perso.finish().animate({
            "left": "-=100px"
        }, "slow");
    };
    Perso.prototype.right = function() {
        this.perso.finish().animate({
            "left": "+=100px"
        }, "slow");
    };
    Perso.prototype.up = function() {
        this.perso.finish().animate({
            "top": "-=100px"
        }, "slow");
    };
    Perso.prototype.down = function() {
        this.perso.finish().animate({
            "top": "+=100px"
        }, "slow");
    };
    var Myperso = new Perso();

    socket.on('aveugle', function() {
        // console.log('aveugle');
        role = 'aveugle';
    })

    //badPerso
    // var badPerso = Object.create(Myperso);
    //    badPerso.perso = $('.ennemi');
    //    badPerso.currentPosition = {
    //     x:2,
    //     y:3
    //    }
    //     badPerso.positionBadPersoMatrice = function(deplacement) {

    //     switch (deplacement) {
    //         case 'left':
    //             badPerso.currentPosition.x--;
    //             break;
    //         case 'right':
    //             badPerso.currentPosition.x++;
    //             break;
    //         case 'up':
    //             badPerso.currentPosition.y--;
    //             break;
    //         case 'down':
    //             badPerso.currentPosition.y++;
    //             break;
    //     }

        
    // };

    //    badPerso.originPosition = function(){
    //     this.perso.css({
    //         left: 250,
    //         top: 350
    //     });
    //    }




    //    badPerso.deplacement = function(){
       
    //     console.log(level,'level deplacement')      
    //     function direction(){

    //     for (var i = 3; i > 0; i--) {
    //         $.when( badPerso.up()).done (function(){
    //         setTimeout(function(){badPerso.positionBadPersoMatrice('up'), 'slow'});
    //             // badPerso.hit();
    //             console.log(badPerso.currentPosition, 'bad perso position');
    //         });   
    //     }
    //      $.when(badPerso.left()).done (function(){
    //         setTimeout(function(){badPerso.positionBadPersoMatrice('left'), 'slow'});
    //         // badPerso.hit();
    //         console.log(badPerso.currentPosition, 'bad perso position');
    //     });
        
        


    //       $.when(badPerso.right()).done (function(){
    //         setTimeout(function(){ badPerso.positionBadPersoMatrice('right'), 'slow'});
    //         // badPerso.hit();
    //         console.log(badPerso.currentPosition, 'bad perso position');
    //     });
       


        
    
    //     for (var i = 3; i > 0; i--) {
    //         $.when( badPerso.down()).done (function(){
    //             setTimeout(function(){badPerso.positionBadPersoMatrice('down'), 'slow'});
    //             // badPerso.hit();
    //             console.log(badPerso.currentPosition, 'bad perso position');
    //         });   
    //     }

        
       
       
    //     }

    //     if (level == 2) {
           
    //     animation_ai = setInterval(direction, 8000);

    //     }
    //     else{
    //         console.log('test pass ');
    //          clearInterval(animation_ai);
             
    //     }
    //    };

    //    badPerso.hit = function(){

    //         if (myMap.currentPositionperso.y  == badPerso.currentPosition.y &&  myMap.currentPositionperso.x == badPerso.currentPosition.x ) {
    //             socket.emit('game_over', current_room);
    //         }

    //    }
      

    
    //    badPerso.start = function(){
    //     this.originPosition();
    //      this.deplacement();
    //    }

       // console.log(badPerso,'badPerso');
       

    window.addEventListener("keydown", moveSomething, false);

    // move with array 
    function moveSomething(e) {
        if (role == 'aveugle') {
            switch (e.keyCode) {
                case 37:
                    socket.emit('mouvement', {
                        direction: "left",
                        current_room: current_room
                    });
                    break;
                case 38:
                    socket.emit('mouvement', {
                        direction: "up",
                        current_room: current_room
                    });
                    break;
                case 39:
                    socket.emit('mouvement', {
                        direction: "right",
                        current_room: current_room
                    });
                    break;
                case 40:
                    socket.emit('mouvement', {
                        direction: "down",
                        current_room: current_room
                    });
                    break;
            }
        }
    }
    // gesture mouvement
    $('body').hammer().data("hammer").get("swipe").set({
        direction: Hammer.DIRECTION_ALL
    });
    $('body').hammer().on("swipeleft", function(e) {
        socket.emit('mouvement', {
            direction: "left"
        });
    });
    $('body').hammer().on("swiperight", function(e) {
        socket.emit('mouvement', {
            direction: "right"
        });
    });
    $('body').hammer().on("swipeup", function(e) {
        socket.emit('mouvement', {
            direction: "up"
        });
    });
    $('body').hammer().on("swipedown", function(e) {
        socket.emit('mouvement', {
            direction: "down"
        });
    });


    socket.on('recive', function(direction) {

        //on fait si pas de game over et bonne position
        if (Myperso.verficationPosition(direction) === true && sucess_level == false && game_over === false) {
           //avant deplacement
             myMap.terrainActionGlaceActif();   
              myMap.doubleActionActif(direction); 
                myMap.teleportActif(direction); 
             
            //Apres deplacement
            Myperso[direction]();


          
            Myperso.compteur();

            myMap.positionPersoMatrice(direction);

            Myperso.displayCurrentPosition();

            myMap.sucess_level();
            // badPerso.hit();
            

        }


    });




    ///////////////
    // sound
    ///////////////




    //init
    var left_sound = new Howl({
        urls: ['sound/left.mp3', 'sound/left.ogg'],
        sprite: {
            0: [1700, 800],
            1: [2500, 1000],
            2: [3500, 1000]
        }
    });
    var right_sound = new Howl({
        urls: ['sound/right.mp3', 'sound/right.ogg'],
        sprite: {
            0: [3000, 1000],
            1: [4200, 1500],
            2: [5700, 1000]
        }
    });

    var up_sound = new Howl({
        urls: ['sound/up.mp3', 'sound/up.ogg'],
        sprite: {
            0: [1700, 1780],
            1: [3480, 1000],
            2: [4480, 1050]
        }
    });

    var down_sound = new Howl({
        urls: ['sound/down.mp3', 'sound/down.ogg'],
        sprite: {
            0: [1700, 1000],
            1: [2780, 1100],
            2: [4000, 1300]
        }
    });
    //stop all sound 
    function stop_sound() {

        down_sound.stop();
        right_sound.stop();
        up_sound.stop();
        left_sound.stop();
    }

    //start sound
    $('.sound_left').click(function(event) {
        event.preventDefault();
        socket.emit('sound', {
            direction: "left",
            current_room: current_room
        });

    });

    $('.sound_right').click(function(event) {
        event.preventDefault();
        socket.emit('sound', {
            direction: "right",
            current_room: current_room
        });
    });


    $('.sound_up').click(function(event) {
        event.preventDefault();
        socket.emit('sound', {
            direction: "up",
            current_room: current_room
        });
    });

    $('.sound_down').click(function(event) {
        event.preventDefault();
        socket.emit('sound', {
            direction: "down",
            current_room: current_room
        });
    });

    socket.on('sound_send', function(direction) {
        // console.log('direction sound' + direction);
        stop_sound();
        var random_sound = Math.floor(Math.random() * 3);
        // console.log(random_sound);
        switch (direction) {
            case 'right':
                right_sound.play(random_sound);
                break;
            case 'left':
                left_sound.play(random_sound);
                break;
            case 'up':
                up_sound.play(random_sound);
                break;
            case 'down':
                down_sound.play(random_sound);
                break;
        }

    });


    /////////////////////////
    //reconnaissance vocal
    //////////////////////////////////////////////////////////////

    if (annyang) {
        // Let's define a command.
        var commands = {
            'go *direction': function(direction) {
                console.log('go ' + direction);
                if (direction == 'left' || direction == 'up' || direction == 'right' || direction == 'down') {
                    $('.sound_' + direction).trigger("click");
                } else {
                    console.log('wrong direction sound ' + direction);
                }

            }
        };
        // Add our commands to annyang
        annyang.addCommands(commands);

        // Start listening.
        annyang.start();
    }

    /////////////////////////

    //game over
    socket.on('game_over_send', function() {
        
        all_success++
       
        $("<div class='game_over_box center-e'><div><h1>Game Over</h1><p> meuilleur score : " + level +
        "</p><a class='try_again' href=''>Try again</a><form action='' method='POST'><legend>Save score</legend><label for='teamName'>select a team Name</label><input name='teamName' type='text' value='anonymous Team'><input name='score' type='hidden' value="+ level +"><input class='submit_score' type='submit' value='submit score'></form></div></div>").appendTo('body').fadeIn();
        game_over = true;
          if (all_success == 2 ) {
           level = 0;
           all_success = 0; 
        }
       
        $('.try_again').click(function(event) {

            
            event.preventDefault();

            console.log(current_room, 'current_room');
            socket.emit('reset', current_room);


        });

    });

    socket.on('reset_send', function() {
        $('.game_over_box').fadeOut();
       
        reset();


    });


    //sucess
   socket.on('success_send', function() {
       
        all_success++;
        //send to sucess to server create level update 2 4 6 8...
        if (all_success == 2) {
            level++;
      

           if (role == 'aveugle') {
               role = 'guide';
               $('.all_map').removeClass('aveugle');  

            }else{
                role = 'aveugle';
            }
         
        reset();

        all_success = 0;
        console.log(all_success, 'all_success');
        }
        
       
    });


    ////
    //help
    //////////////////////////
    $('.toggle_help_button').click(function(event) {

        event.preventDefault();
        $('.toggle_help').toggleClass('toggle_help_actif');

    });

        /////////////////////////
    // menu style
    ///////////////////////////
    $('.menu a').click(function(event) {
        event.preventDefault();
        console.log(this.innerHTML);
        $('#about').removeClass('active'); 
        $('#scores').removeClass('active'); 
        $('#instructions').removeClass('active'); 
        $('#login').removeClass('active');  
        $('#' + this.innerHTML ).addClass('active'); 

    });

    ///
    var popupCenter = function(url, title, width, height){
        var popupWidth = width || 640;
        var popupHeight = height || 320;
        var windowLeft = window.screenLeft || window.screenX;
        var windowTop = window.screenTop || window.screenY;
        var windowWidth = window.innerWidth || document.documentElement.clientWidth;
        var windowHeight = window.innerHeight || document.documentElement.clientHeight;
        var popupLeft = windowLeft + windowWidth / 2 - popupWidth / 2 ;
        var popupTop = windowTop + windowHeight / 2 - popupHeight / 2;
        var popup = window.open(url, title, 'scrollbars=yes, width=' + popupWidth + ', height=' + popupHeight + ', top=' + popupTop + ', left=' + popupLeft);
        popup.focus();
        return true;
    };

     document.querySelector('.share_twitter').addEventListener('click', function(e){
        e.preventDefault();
        var url = this.getAttribute('data-url');
        var shareUrl = "https://twitter.com/intent/tweet?text=" + encodeURIComponent(document.title) +
            "&via=Serck_Timothee" +
            "&url=" + encodeURIComponent(url);
        popupCenter(shareUrl, "Partager sur Twitter");
    });

    document.querySelector('.share_facebook').addEventListener('click', function(e){
        e.preventDefault();
        var url = this.getAttribute('data-url');
        var shareUrl = "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(url);
        popupCenter(shareUrl, "Partager sur facebook");
    });

    ///accordeon
    $('.ascenseur').next("div").hide();
    $('.ascenseur').click(function() {
        if ( $(this).next("div").is(":hidden")) {
            $('.ascenseur').next("div:visible").slideUp();
            $(this).next("div").slideDown();
        }
    });
    
    //ajax
    // $( ".high_score" ).load( "./inc/db/list_scores.php" );

});