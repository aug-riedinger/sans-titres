// shim layer with setTimeout fallback
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       || 
  window.webkitRequestAnimationFrame || 
  window.mozRequestAnimationFrame    || 
  window.oRequestAnimationFrame      || 
  window.msRequestAnimationFrame     || 
  function( callback ){
    window.setTimeout(callback, 1000 / 60);
  };
})();

function canvasToImage(canvas) {
  var image = new Image();
  image.src = canvas.toDataURL("image/png");
  return image;
}

function wrapText(context, text, x, y, maxWidth, lineHeight) {
  var words = text.split(' ');
  var line = '';

  for(var n = 0; n < words.length; n++) {
    var testLine = line + words[n] + ' ';
    var metrics = context.measureText(testLine);
    var testWidth = metrics.width;
    if(testWidth > maxWidth) {
      context.fillText(line, x, y);
      line = words[n] + ' ';
      y += lineHeight;
    }
    else {
      line = testLine;
    }
  }
  context.fillText(line, x, y);
}


var getParameters = function() {
  var tab = window.location.href.replace(/.*#!/, '').split('&');
  var obj = {};
  for (var i=0;i<tab.length;i++) {
    var subtab = tab[i].split('=');
    obj[subtab[0]] = subtab[1];
  };
  return obj;
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


  var showImg = function(src) {
    var img = new Image();
    img.src = params.path+src;
    img.className = 'art';
    $('#artClearView').html(img);
    $('#artClearView').fadeIn(1000);
  // $('#artClearView').on('click',function(eventName) {
  //   remImg();
  // });
};

var remImg = function() {
  $('#artClearView').fadeOut(1000, function() {
    $('#artClearView').empty();
  });
  // $('#artClearView').off('click',function(eventName) {
  //   remImg();
  // });
};


var drawCanvas = function(data) {
  var canv = document.createElement('canvas');
  var ctx = canv.getContext('2d');
  var img;

  canv.width = 640;
  canv.height = 428;

  var titre = data.titre;
  var content = data.content;

  ctx.beginPath();
  ctx.rect(0, 0, canv.width, canv.height);
  ctx.fillStyle = params.wallColor || '#f9f9f9';
  ctx.fill();
  ctx.moveTo(170, 80);
  ctx.font = "bold 24px Calibri";
  ctx.textAlign = 'center';
  ctx.fillText(titre, canv.width/2, 200);
  ctx.font = "normal 14px Calibri";
  ctx.textAlign = 'left';
  wrapText(ctx, content, canv.width/2 - 150, 250, 300, 18);

  img = new Image();
  img.src = canv.toDataURL();
  img.className = 'txt';

  return img;
};


var getEdges = function(faces, dim) {
  var points = [];
  var goodPoints = [];
  var face, point;
  var toAdd;
  var cx, cy, cz;
  var ux, uy, uz, vx, vy, vz, cosTheta, sinTheta, theta;

  for (var i=0; i<faces.length; i++) {
    face = faces[i];
    face.projection();
    if(face.visible) {
      toAdd = {
        p0: true,
        p1: true,
        p2: true,
        p3: true
      };

      for(var j=0; j< points.length; j++) {
        point = points[j];
        if(face.p0.x === point.x && face.p0.y === point.y && face.p0.z === point.z) {
          point.cpt++;
          toAdd.p0 = false;
        }
        if(face.p1.x === point.x && face.p1.y === point.y && face.p1.z === point.z) {
          point.cpt++;
          toAdd.p1 = false;
        }
        if(face.p2.x === point.x && face.p2.y === point.y && face.p2.z === point.z) {
          point.cpt++;
          toAdd.p2 = false;
        }
        if(face.p3.x === point.x && face.p3.y === point.y && face.p3.z === point.z) {
          point.cpt++;
          toAdd.p3 = false;
        }
      } 
      if(toAdd.p0) {
        points.push({
          x: face.p0.x,
          y: face.p0.y,
          z: face.p0.z,
          X: face.p0.X,
          Y: face.p0.Y,
          cpt: 1
        });
      }
      if(toAdd.p1) {
        points.push({
          x: face.p1.x,
          y: face.p1.y,
          z: face.p1.z,
          X: face.p1.X,
          Y: face.p1.Y,
          cpt: 1
        });
      }
      if(toAdd.p2) {
        points.push({
          x: face.p2.x,
          y: face.p2.y,
          z: face.p2.z,
          X: face.p2.X,
          Y: face.p2.Y,
          cpt: 1
        });
      }
      if(toAdd.p3) {
        points.push({
          x: face.p3.x,
          y: face.p3.y,
          z: face.p3.z,
          X: face.p3.X,
          Y: face.p3.Y,
          cpt: 1
        });
      }
    }
  }

  cx = cy = cz = 0;

  for(var k=0; k< points.length; k++) {
    if(points[k].cpt === 1) {
      goodPoints.push(points[k]);
      cx += points[k].x;
      cy += points[k].y;
      cz += points[k].z;
    }
  }

  cx = cx/goodPoints.length;
  cy = cy/goodPoints.length;
  cz = cz/goodPoints.length;


  if(goodPoints.length>0) {
    point = goodPoints[0];
    for(var k=0; k<goodPoints.length; k++) {
      var ux = point.x - cx;
      var uy = point.y - cy;
      var uz = point.z - cz;
      var vx = goodPoints[k].x - cx;
      var vy = goodPoints[k].y - cy;
      var vz = goodPoints[k].z - cz;
      if(dim === 'x') {
          // var norm = Math.sqrt((uy*uy + uz*uz)*(vy*vy + vz*vz));
          var cosTheta = (uy*vy + uz*vz);
          var sinTheta = (uy*vz - uz*vy);
        }
        if(dim === 'y') {
          // var norm = Math.sqrt((ux*ux + uz*uz)*(vx*vx + vz*vz));
          var cosTheta = (ux*vx + uz*vz);
          var sinTheta = (uz*vx - ux*vz);
        }
        if(dim === 'z') {
          // var norm = Math.sqrt((ux*ux + uy*uy)*(vx*vx + vy*vy));
          var cosTheta = (ux*vx + uy*vy);
          var sinTheta = (ux*vy - uy*vx);
        }
        var theta = Math.atan(sinTheta / cosTheta);
        if(cosTheta>=0) {
          goodPoints[k].theta = theta;
        } else {
          goodPoints[k].theta = theta + Math.PI;
        }

        // goodPoints[k].cosTheta = cosTheta;
        // goodPoints[k].sinTheta = sinTheta;
        // goodPoints[k].cx = cx;
        // goodPoints[k].cy = cy;
        // goodPoints[k].cz = cz;
      }

      goodPoints.sort(function(p0,p1) {
        return p0.theta - p1.theta
      });

    }
    return goodPoints;
  } 