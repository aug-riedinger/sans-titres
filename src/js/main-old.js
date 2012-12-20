var origin, camPos, vect;

var params = {
    path: "images/",
    unit : 300,
    height : 300,
    threshold : 500,
    focalLength : 1000
};

var position = {};

// var texture = {
//  wall : drawWall(),
//  door : drawDoor()
// };

// var cpt = 0;

var room;
// var Room = function () {
    // ======== private vars ========
    var faces = [];
    var scr, target, targetold, faceOver;


    var faceMaker = {
        'top' : function(_x, _z) {
            var f = {
                x: params.unit * _x,  
                y: 0,    
                z: params.unit * _z + 3/2*params.unit,    
                rx: 0,  
                ry: 0, 
                w: params.unit, 
                h: params.height,
                image: drawWall(params.unit, params.height,'yellow'),
                select: false
            };
            return new Face(params.path, f);            
        },
        'bottom' : function(_x, _z) {
            var f = {
                x: params.unit * _x,    
                y: 0,    
                z: params.unit * _z - 3/2*params.unit,  
                rx:0,  
                ry:-2,  
                w: params.unit, 
                h: params.height,
                image: drawWall(params.unit, params.height,'green'),
                select: false
            };
            return new Face(params.path, f);            
        },
        'left' : function(_x, _z) {
            var f = {
                x: params.unit * _x - params.unit/2,  
                y: 0,    
                z: params.unit * _z,    
                rx:0,  
                ry:1,  
                w: params.unit, 
                h: params.height,
                image: drawWall(params.unit, params.height,'blue'),
                select: false
            };
            return new Face(params.path, f);            
        },
        'right' : function(_x, _z) {
            var f = {
                x: params.unit * _x + params.unit/2,  
                y: 0,    
                z: params.unit * _z,    
                rx:0,  
                ry:-1, 
                w: params.unit, 
                h: params.height,
                image: drawWall(params.unit, params.height,'orange'),
                select: false
            };
            return new Face(params.path, f);            
        },
        'ceiling' : function(_x, _z) {
            var f = {
                x: params.unit * _x + params.unit/2,  
                y: - params.height/2,    
                z: params.unit * _z + params.unit/2,
                rx:-1,  
                ry:0,  
                w: params.unit, 
                h: params.unit, 
                image: drawWall(params.unit,params.unit),
                select: false
            };
            return new Face(params.path, f);            
        },
        'floor' : function(_x, _z) {
            var f = {
                x: params.unit * _x + params.unit/2,  
                y: params.height/2,    
                z: params.unit * _z + params.unit/2,
                rx:1,  
                ry:0,  
                w: params.unit, 
                h: params.unit, 
                src:"floor-tx.png",    
                select: false
            };
            return new Face(params.path, f);            
        } 
    }

    var cubeMaker = {
    'T' : function(room,_x,_z) { // Top Left
        var top = faceMaker.top(_x,_z);
        faces.push(top);
        var left = faceMaker.left(_x,_z);
        faces.push(left);
    },
    't' : function(room,_x,_z) { // Top Right
        var top = faceMaker.top(_x,_z);
        faces.push(top);
        var right = faceMaker.right(_x,_z);
        faces.push(right);
    },
    'B' : function(room,_x,_z) { // Bottom Left
        var bottom = faceMaker.bottom(_x,_z);
        faces.push(bottom);
        var left = faceMaker.left(_x,_z);
        faces.push(left);
    },
    'b' : function(room,_x,_z) { // Bottom Right
        var bottom = faceMaker.bottom(_x,_z);
        faces.push(bottom);
        var right = faceMaker.right(_x,_z);
        faces.push(right);
    },
    '-' : function(room,_x,_z) { // Top
        var top = faceMaker.top(_x,_z);
        faces.push(top);
    },
    '_' : function(room,_x,_z) { // Bottom
        var bottom = faceMaker.bottom(_x,_z);
        faces.push(bottom);
    },
    '|' : function(room,_x,_z) { // Left
        var left = faceMaker.left(_x,_z);
        faces.push(left);
    },
    '!' : function(room,_x,_z) { // Right
        var right = faceMaker.right(_x,_z);
        faces.push(right);
    },
    '.' : function() {}
}

var Cube = function(id,constr) {


        this.id = id;
        this.dimx = constr.size.dimx;
        this.dimz = constr.size.dimz;

        this.x = constr.position.x*params.unit || 0;
        this.y = constr.position.y*params.unit || 0;
        this.z = constr.position.z*params.unit || 0;

        var i=0;
        var tempFace;

        //         Wall 0
        //      o..........
        //      o    1    .
        //      o         .
        //      o 0     2 .   4\5
        //      o    3    .
        //      o..........
        //   z↑
        //    |
        //    0---→
        //        x

        if(constr.walls[i].type != 'none') {
            var f = {
                id: this.id+':'+i, 
                x:this.x,  
                y:this.y,    
                z:this.z+params.unit*this.dimz/2,    
                rx:0,  
                ry:1, 
                w: params.unit*this.dimz, 
                h: params.height,
                select: false
            };
            if(constr.walls[i].type == 'wall') {
                f.image = drawWall(f.w, f.h);
            } else {
                if(constr.walls[i].type == 'door') {
                    f.image = drawDoor(f.w,f.h);
                    if(constr.walls[i].toRoom) {
                        $.getJSON('/rooms/room'+constr.walls[i].toRoom+'.json', function(data) {
                            room.adj.push(new Room(reCenter(data,position.x,position.z)));
                        });
                    }
                }
            }

            tempFace = new Face(params.path, f);

            faces.push(tempFace);

            $.each(constr.walls[i].arts,$.proxy(function(ind,art) {
                new Art(this,art);
            },tempFace));
        }
        i++;

        //         Wall 1
        //      ooooooooooo
        //      .    1    .
        //      .         .
        //      . 0     2 .   4\5
        //      .    3    .
        //      ...........
        //   z↑
        //    |
        //    0---→
        //        x

        if(constr.walls[i].type != 'none') {
            var f = {
                id: this.id+':'+i, 
                x:this.x+params.unit*this.dimx/2,    
                y:this.y,    
                z:this.z+params.unit*this.dimz,  
                rx:0,  
                ry:0,  
                w: params.unit*this.dimx, 
                h: params.height,
                select: false
            };
            if(constr.walls[i].type == 'wall') {
                f.image = drawWall(f.w, f.h);
                // f.image = texture.wall;
            } else {
                if(constr.walls[i].type == 'door') {
                    f.image = drawDoor(f.w,f.h);

                    if(constr.walls[i].toRoom) {
                        $.getJSON('/rooms/room'+constr.walls[i].toRoom+'.json', function(data) {
                            room.adj.push(new Room(reCenter(data,position.x,position.z)));
                        });
                    }
                }
            }

            tempFace = new Face(params.path, f);

            faces.push(tempFace);

            $.each(constr.walls[i].arts,$.proxy(function(ind,art) {
                new Art(this,art);
            },tempFace));
        }
        i++;

        //         Wall 2
        //      ..........o
        //      .    1    o
        //      .         o
        //      . 0     2 o   4\5
        //      .    3    o
        //      ..........o
        //   z↑
        //    |
        //    0---→
        //        x

        if(constr.walls[i].type != 'none') {
            var f = {
                id: this.id+':'+i, 
                x:this.x+ params.unit*this.dimx,  
                y:this.y,    
                z:this.z+ params.unit*this.dimz/2,    
                rx:0,  
                ry:-1, 
                w: params.unit*this.dimz, 
                h: params.height,
                select: false
            };
            if(constr.walls[i].type == 'wall') {
                f.image = drawWall(f.w, f.h);
                // f.image = texture.wall;
            } else {
                if(constr.walls[i].type == 'door') {
                    f.image = drawDoor(f.w,f.h);

                    if(constr.walls[i].toRoom) {
                        $.getJSON('/rooms/room'+constr.walls[i].toRoom+'.json', function(data) {
                            room.adj.push(new Room(reCenter(data,position.x,position.z)));
                        });
                    }
                }
            }

            tempFace = new Face(params.path, f);

            faces.push(tempFace);

            $.each(constr.walls[i].arts,$.proxy(function(ind,art) {
                new Art(this,art);
            },tempFace));
        }
        i++;

        //         Wall 3
        //      ...........
        //      .    1    .
        //      .         .
        //      . 0     2 .   4\5
        //      .    3    .
        //      ooooooooooo
        //   z↑
        //    |
        //    0---→
        //        x

        if(constr.walls[i].type != 'none') {
            var f = {
                id: this.id+':'+i, 
                x:this.x+params.unit*this.dimx/2,    
                y:this.y,    
                z:this.z,  
                rx:0,  
                ry:-2,  
                w: params.unit*this.dimx, 
                h: params.height,
                select: false
            };
            if(constr.walls[i].type == 'wall') {
                f.image = drawWall(f.w, f.h);
                // f.image = texture.wall;
            } else {
                if(constr.walls[i].type == 'door') {
                    f.image = drawDoor(f.w,f.h);

                    if(constr.walls[i].toRoom) {
                        $.getJSON('/rooms/room'+constr.walls[i].toRoom+'.json', function(data) {
                            room.adj.push(new Room(reCenter(data,position.x,position.z)));
                        });
                    }
                }
            }

            tempFace = new Face(params.path, f);

            faces.push(tempFace);

            $.each(constr.walls[i].arts,$.proxy(function(ind,art) {
                new Art(this,art);
            },tempFace));
        }
        i++;

        //         Wall 4
        //      ...........
        //      .    1    .
        //      .         .
        //      . 0     2 .   4\5
        //      .    3    .
        //      ...........
        //   z↑
        //    |
        //    0---→
        //        x

        var f = {
            id: this.id+':'+i, 
            src:"floor-tx.png",    
            x:this.x+params.unit*this.dimx/2,  
            y:this.y+params.height/2,    
            z:this.z+params.unit*this.dimz/2, 
            rx:1,  
            ry:0,  
            w: params.unit*this.dimx, 
            h: params.unit*this.dimz, 
            select: false
        };
        faces.push(
            new Face(params.path, f)
            );

        i++;
        //         Wall 5
        //      ...........
        //      .    1    .
        //      .         .
        //      . 0     2 .   4\5
        //      .    3    .
        //      ...........
        //   z↑
        //    |
        //    0---→
        //        x

        var f = {
            id: this.id+':'+i, 
            image: drawWall(params.unit*this.dimx,params.unit*this.dimz),
            x:this.x+params.unit*this.dimx/2,  
            y:this.y-params.height/2,    
            z:this.z+params.unit*this.dimz/2,
            rx:-1,  
            ry:0,  
            w: params.unit*this.dimx, 
            h: params.unit*this.dimz, 
            select: false
        };
        faces.push(
            new Face(params.path, f)
            );

        return this;

    };





    // ======== update pointer style (PC)  ========
    var pointer = function () {
        // ---- on mouse over ----  
        target = false;
        var i = 0, f;
        while ( f = faces[i++] ) {
            if (f.visible) {
                if (
                    f.img.pointerInside(
                        scr.mouseX,
                        scr.mouseY,
                        f.p0, f.p1, f.p2, f.p3
                        )
                    ) target = f;   
            } else break;
    }
    if (target && target.f.select != false && !scr.drag) {
        faceOver = target;
        scr.container.style.cursor = "pointer";
    } else { 
        // scr.container.style.cursor = "move";
        // scr.container.style.cursor = "url('images/left.png'), move";

        if(scr.mouseX<scr.width/5) {
            scr.container.style.cursor = "url('images/left.png'), move";
        } else {
            if(scr.mouseX> scr.width - scr.width/5) {
                scr.container.style.cursor = "url('images/right.png'), move";
            } else {
                scr.container.style.cursor = "default";
            }
        }

    }
};
    // ======== onclick ========
    var click = function () {
        pointer();
        // ---- target image ----
        if (target && target.f.select != false) {
            if (target == targetold) {
                // ---- reset scene ----
                showImg(target.f.full);
            } else {
                targetold = target;
                target.locked = false;
                // ---- target redirection ----
                if (target.f.target != "") {
                    //                                                      What for ?
                    var i = 0, f;
                    while ( f = faces[i++] ) {
                        if (f.f.id && f.f.id == target.f.target) {
                            console.log('condition impossible ?');
                            target = f;
                            targetold = f;
                            if (f.hidden) {
                                f.hidden = false;
                                f.locked = true;
                                targetold = false;
                            }
                            break;
                        }
                    }
                } else {
                    console.log('condition impossible ?');
                }
                // ---- move camera ----
                target.pc.projection();
                camera.targetToFace(target);
                // target.on()
            }
        }
    };
    ////////////////////////////////////////////////////////////////////////////
    var init = function (json) {
        // ---- init script ----
        scr = new ge1doot.screen.InitEvents({
            container: "screen",
            canvas: "canvas",
            click: click,
            move: pointer
        });
        // ---- create faces ----
        getRoom(getParameters().room||1);

        origin = new Point(null, [0,0,0]);
        px = new Point(null, [200,0,0]);
        py = new Point(null, [0,200,0]);
        pz = new Point(null, [0,0,200]);

        vx = new Vector(origin,px);
        vy = new Vector(origin,py);
        vz = new Vector(origin,pz);

        // ---- engine start ----
        run();
    };


    ////////////////////////////////////////////////////////////////////////////
    // ===== main loop =====
    var run = function () {
        // ---- clear screen ----
        scr.ctx.clearRect(0,0, scr.width, scr.height);
        // ---- 3D projection ----
        var i = 0, f;
        while ( f = faces[i++] ) {
            f.projection();
        }
        // ---- faces depth sorting ----
        faces.sort(function (p0, p1) {
            return p1.distance - p0.distance;
        });

        // ---- drawing ----
        var i = 0, f;
        while ( f = faces[i++] ) {
            if (f.visible) {
                // ---- draw image ----
                if (f.type == 'art') {
                    f.img.draw3D(f.p0, f.p1, f.p2, f.p3);   
                }
                if (f.type == 'wall') {

                }
                // if (f.locked && scr.drag) f.locked = false;
                // if (f === faceOver) faceOver.border();
            } else break;
        }

        vx.draw('green');
        vy.draw('yellow');
        vz.draw('orange');

        // ---- camera ----
        camera.move();
        // ---- loop ----



        requestAnimFrame(run);
    };
    // return {    
        ////////////////////////////////////////////////////////////////////////////
        // ---- onload event ----
        // var loadImages = function (json) {
        //  window.addEventListener('load', function () {
        //      setTimeout(function () {
        //      }, 500);
        //  }, false);
        // };
    //  }
// }

var getRoom = function(id) {
    $.getJSON('/newrooms/room'+id+'.json', function(data, textStatus) {
        // if(!(position.hasOwnProperty('x') || position.hasOwnProperty('z'))) {
        //  setPosition(data, getParameters().x, getParameters().z);
        // }
        room = new Room(data);
    });
};

var reCenter = function(data,x,z) {
    var locData = data;
    for(var i=0;i<locData.cubes.length;i++) {
        locData.cubes[i].position.x = locData.cubes[i].position.x - x;
        locData.cubes[i].position.z = locData.cubes[i].position.z - z;
    }
    return locData;
};

var setPosition = function(data,x,z) {
    if(x != undefined || z != undefined) {
        position.x = x||0;
        position.z = z||0;
    } else {
        var barix = 0;
        var bariz = 0;
        for(var i=0;i<data.cubes.length;i++) {
            barix += data.cubes[i].position.x + data.cubes[i].size.dimx/2;
            bariz += data.cubes[i].position.z + data.cubes[i].size.dimz/2 ;
        }
        // position.x = (barix/data.cubes.length);
        position.x = Math.round(barix/data.cubes.length);
        // position.z = (barix/data.cubes.length);
        position.z = Math.round(bariz/data.cubes.length);
    }       
    return true;
}

var getFaceById = function(_id) {
    for (var i in faces) {
        if (faces[i].f.id == _id) {
            return faces[i];
        }
    }
    return null;
};

var showImg = function(src) {
    var img = new Image();
    img.src = params.path+src;
    img.className = 'art';
    $('#artClearView').html(img);
    $('#artClearView').fadeIn(1000);
    $('#artClearView').on('click',function(eventName) {
        remImg();
    });
};

var remImg = function() {
    $('#artClearView').fadeOut(1000, function() {
        $('#artClearView').empty();
    });
    camera.center();
    targetold = false;
    $('#artClearView').off('click',function(eventName) {
        remImg();
    });

}




init();