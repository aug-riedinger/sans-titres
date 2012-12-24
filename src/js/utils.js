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


  // ======== update pointer style (PC)  ========
  var pointer = function () {
    // ---- on mouse over ----  
    target = false;
    var i = 0, f;
    while ( f = faces[i++] ) {
      if (f.visible && f.img) {
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
          //                            What for ?
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

}