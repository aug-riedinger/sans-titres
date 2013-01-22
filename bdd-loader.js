var fs = require('fs');

var arts = [];
var art;
var rooms = [];
var room;
var i;

var handleRoom = function(room) {
    var h, w, i;
    var charType, next, artId;
    var artsConstr;
    var res = [];
    var sideShifted;

    for(h = 0; h < room.map.length; h++) {
        z = room.map.length - (h + 1);
        for(w = 0; w < room.map[h].length; w += 2) {
            x = w / 2;
            charType = room.map[h][w];
            next = room.map[h][w + 1];
            artId = next.replace(/^[^a-zA-Z0-9]$/, '');

            artsConstr = getArtConstr(room.arts, artId);

            for (i=0; i< artsConstr.length; i++) {
                sideShifted = sideShift(artsConstr[i].side || charType);
                res.push({
                    artId: artsConstr[i].id,
                    room: room.id,
                    src: artsConstr[i].src||artsConstr[i].thumb,
                    type: artsConstr[i].type,
                    info: artsConstr[i].info,
                    x: 0.5 + room.position.x + x + (artsConstr.x||0)/1000 + sideShifted.x,
                    z: 0.5 + room.position.z + z + (artsConstr.z||0)/1000 + sideShifted.z
                });
            }

        }
    }

    if(room.sounds) {
        for (i = 0; i < room.sounds.length; i++) {
            res.push({
                artId: room.sounds[i].id,
                room: room.id,
                src: room.sounds[i].mp3,
                type: 'sound',
                info: room.sounds[i].info,
                x: 0.5 + room.position.x + room.map[0].length/4,
                z: 0.5 + room.position.z + room.map.length/2
            });
        }   
    }

    return res;
};

var sideShift = function(charType) {
    if(charType === '-') {
        return {
            x: 0,
            z: 0.5
        };
    }
    if(charType === '|') {
        return {
            x: -0.5,
            z: 0
        };
    }
    if(charType === '_') {
        return {
            x: 0,
            z: -0.5
        };
    }
    if(charType === '!') {
        return {
            x: 0.5,
            z: 0
        };
    }
    return {
        x: 0,
        z:0
    };
};

var getArtConstr = function(artsConstr, artId) {
    var artConstr;
    var artConstrs = [];
    for(var i = 0; i < artsConstr.length; i++) {
        artConstr = artsConstr[i];
        if(artConstr.id[0] === artId) {
            artConstrs.push(artConstr);
        }
    }
    return artConstrs;
};

for (i = 1; i < 12; i++) {
    room = require('./src/numero0/room'+i+'.json');
    rooms.push(room);
}

for(i = 0; i<rooms.length; i++) {
    arts = arts.concat(handleRoom(rooms[i]));
}


fs.writeFile("./src/numero0/artList.json", JSON.stringify(arts, null, 4), function(err) {
    if(err) {
        console.log(err);
    } else {
        console.log("The file was saved!");
    }
}); 