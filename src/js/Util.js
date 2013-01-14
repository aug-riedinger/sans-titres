// shim layer with setTimeout fallback
window.requestAnimFrame = (function() {
	return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
	function(callback) {
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
		} else {
			line = testLine;
		}
	}
	context.fillText(line, x, y);
}


var getParameters = function() {
	var tab = window.location.href.replace(/.*#!/, '').split('&');
	var obj = {};
	for(var i = 0; i < tab.length; i++) {
		var subtab = tab[i].split('=');
		obj[subtab[0]] = subtab[1];
	};
	return obj;
};


var reCenter = function(data, x, z) {
	var locData = data;
	for(var i = 0; i < locData.cubes.length; i++) {
		locData.cubes[i].position.x = locData.cubes[i].position.x - x;
		locData.cubes[i].position.z = locData.cubes[i].position.z - z;
	}
	return locData;
};

var setPosition = function(data, x, z) {
	if(x != undefined || z != undefined) {
		position.x = x || 0;
		position.z = z || 0;
	} else {
		var barix = 0;
		var bariz = 0;
		for(var i = 0; i < data.cubes.length; i++) {
			barix += data.cubes[i].position.x + data.cubes[i].size.dimx / 2;
			bariz += data.cubes[i].position.z + data.cubes[i].size.dimz / 2;
		}
		// position.x = (barix/data.cubes.length);
		position.x = Math.round(barix / data.cubes.length);
		// position.z = (barix/data.cubes.length);
		position.z = Math.round(bariz / data.cubes.length);
	}
	return true;
}

var showTxt = function(face) {
	var txt;
	for(var i = 0; i < room.texts.length; i++) {
		txt = room.texts[i];
		if(txt.src === face.f.src) {
			break;
		}
	}

	$('#artClearView').html(txt);

	// autoResize(face.f.id)
	$('#artClearView').fadeIn(1000);
	$('#artClearView').one('click', function(eventName) {
		remImg();
	});
}

var showImg = function(face) {
	var img;
	for(var i = 0; i < room.images.length; i++) {
		img = room.images[i];
		if(img.src === face.f.src) {
			break;
		}
	}

	$('#artClearView').html(img);
	$('#artClearView').fadeIn(1000);
	$('#artClearView').one('click', function(eventName) {
		remImg();
	});
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
	ctx.fillText(titre, canv.width / 2, 200);
	ctx.font = "normal 14px Calibri";
	ctx.textAlign = 'left';
	wrapText(ctx, content, canv.width / 2 - 150, 250, 300, 18);

	img = new Image();
	img.src = canv.toDataURL();
	img.className = 'txt';

	return img;
};

var barycenter = function(points) {
	var point;
	var x = 0,
	y = 0,
	z = 0;
	if(!points.length) {
		points = [points];
	}
	for(var i = 0; i < points.length; i++) {
		point = points[i];
		x += point.x;
		y += point.y;
		z += point.z;
	}

	return new Point(null, [parseInt(x / points.length, 10), parseInt(y / points.length, 10), parseInt(z / points.length, 10)]);

};

var getEdges = function(faces, dim) {
	var points = [];
	var goodPoints = [];
	var doors = [];
	var face, point;
	var toAdd;
	var cx, cy, cz;
	var ux, uy, uz, vx, vy, vz, cosTheta, sinTheta, theta;

	for(var i = 0; i < faces.length; i++) {
		face = faces[i];
		face.projection();
		if(face.visible) {
			toAdd = {
				p0: true,
				p1: true,
				p2: true,
				p3: true
			};

			for(var j = 0; j < points.length; j++) {
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

	// for (var d=0; d<doors.length; d++) {
	//   var bary = barycenter([doors[i].p2, doors[i].p3]);
	//   points.push({
	//     x: bary.x,
	//     y: bary.y,
	//     z: bary.z,
	//   });
	// }
	cx = cy = cz = 0;

	for(var k = 0; k < points.length; k++) {
		if(points[k].cpt === 1) {
			goodPoints.push(points[k]);
			cx += points[k].x;
			cy += points[k].y;
			cz += points[k].z;
		}
	}

	cx = cx / goodPoints.length;
	cy = cy / goodPoints.length;
	cz = cz / goodPoints.length;


	if(goodPoints.length > 0) {
		point = goodPoints[0];
		for(var k = 0; k < goodPoints.length; k++) {
			var ux = point.x - cx;
			var uy = point.y - cy;
			var uz = point.z - cz;
			var vx = goodPoints[k].x - cx;
			var vy = goodPoints[k].y - cy;
			var vz = goodPoints[k].z - cz;
			if(dim === 'x') {
				// var norm = Math.sqrt((uy*uy + uz*uz)*(vy*vy + vz*vz));
				var cosTheta = (uy * vy + uz * vz);
				var sinTheta = (uy * vz - uz * vy);
			}
			if(dim === 'y') {
				// var norm = Math.sqrt((ux*ux + uz*uz)*(vx*vx + vz*vz));
				var cosTheta = (ux * vx + uz * vz);
				var sinTheta = (uz * vx - ux * vz);
			}
			if(dim === 'z') {
				// var norm = Math.sqrt((ux*ux + uy*uy)*(vx*vx + vy*vy));
				var cosTheta = (ux * vx + uy * vy);
				var sinTheta = (ux * vy - uy * vx);
			}
			var theta = Math.atan(sinTheta / cosTheta);
			if(cosTheta >= 0) {
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

		goodPoints.sort(function(p0, p1) {
			return p0.theta - p1.theta;
		});

	}
	return goodPoints;
};



var getEdges2 = function(faces, dim) {
	var i, j, k;
	var points = [];
	var goodPoints = [];
	var doors = [];
	var face, point;
	var toAdd;
	var cx, cy, cz;
	var ux, uy, uz, vx, vy, vz, cosTheta, sinTheta, theta;

	for(i = 0; i < faces.length; i++) {
		face = faces[i];
		face.projection();
		if(face.visible) {
			// if(!face.p0.behind) {
				points.push(face.p0);
			// }
			// if(!face.p1.behind) {
				points.push(face.p1);
			// }
			// if(!face.p2.behind) {
				points.push(face.p2);
			// }
			// if(!face.p3.behind) {
				points.push(face.p3);
			// }
		}
	}
	var spliced = false;
	// console.log(points.length);

	for (j=0; j< points.length-1; j++) {
		for (k=j+1; k < points.length; k++) {
			if (points[j].x === points[k].x && points[j].y === points[k].y && points[j].z === points[k].z) {
				points.splice(k, 1);
				k -= 1;
				spliced = true;
			}
		}
		if(spliced) {
			points.splice(j, 1);
			j -= 1;
			spliced = false;
		}
	}
	// console.log(points.length);

	cx = cy = cz = 0;

	for(k = 0; k < points.length; k++) {

		// if(points[k].behind) {
		// 	points[k] = points[k].face.pc;
		// }

		cx += points[k].x;
		cy += points[k].y;
		cz += points[k].z;
	}

	cx = cx / points.length;
	cy = cy / points.length;
	cz = cz / points.length;


	if(points.length > 0) {
		point = points[0];
		for(k = 0; k < points.length; k++) {
			ux = point.x - cx;
			uy = point.y - cy;
			uz = point.z - cz;
			vx = points[k].x - cx;
			vy = points[k].y - cy;
			vz = points[k].z - cz;
			if(dim === 'x') {
				// var norm = Math.sqrt((uy*uy + uz*uz)*(vy*vy + vz*vz));
				cosTheta = (uy * vy + uz * vz);
				sinTheta = (uy * vz - uz * vy);
			}
			if(dim === 'y') {
				// var norm = Math.sqrt((ux*ux + uz*uz)*(vx*vx + vz*vz));
				cosTheta = (ux * vx + uz * vz);
				sinTheta = (uz * vx - ux * vz);
			}
			if(dim === 'z') {
				// var norm = Math.sqrt((ux*ux + uy*uy)*(vx*vx + vy*vy));
				cosTheta = (ux * vx + uy * vy);
				sinTheta = (ux * vy - uy * vx);
			}
			theta = Math.atan(sinTheta / cosTheta);
			if(cosTheta >= 0) {
				points[k].theta = theta;
			} else {
				points[k].theta = theta + Math.PI;
			}

			// goodPoints[k].cosTheta = cosTheta;
			// goodPoints[k].sinTheta = sinTheta;
			// goodPoints[k].cx = cx;
			// goodPoints[k].cy = cy;
			// goodPoints[k].cz = cz;
		}

		points.sort(function(p0, p1) {
			return p0.theta - p1.theta;
		});

	}
	return points;
};


var getEdges3 = function(faces, dim) {
	var i, j, k;
	var points = [];
	var face, point;
	var cx, cy, cz, cpt;
	var ux, uy, uz, vx, vy, vz, cosTheta, sinTheta, theta;

	cx = cy = cz = 0;
	cpt = 0;

	for(i = 0; i < faces.length; i++) {
		face = faces[i];
		face.projection();
		if(face.visible) {

			cx += face.f.x;
			cy += face.f.y;
			cz += face.f.z;
			cpt++;

			if(!face.p0.behind) {
				points.push(face.p0);
			}
			if(!face.p1.behind) {
				points.push(face.p1);
			}
			if(!face.p2.behind) {
				points.push(face.p2);
			}
			if(!face.p3.behind) {
				points.push(face.p3);
			}
		}
	}

	cx = cx / cpt||0;
	cy = cy / cpt||0;
	cz = cz / cpt||0;

	points = remMany(points, equalsCoord, 4);

	if(points.length > 0) {
		point = points[0];
		for(k = 0; k < points.length; k++) {
			ux = point.x - cx;
			uy = point.y - cy;
			uz = point.z - cz;
			vx = points[k].x - cx;
			vy = points[k].y - cy;
			vz = points[k].z - cz;
			if(dim === 'x') {
				// var norm = Math.sqrt((uy*uy + uz*uz)*(vy*vy + vz*vz));
				cosTheta = (uy * vy + uz * vz);
				sinTheta = (uy * vz - uz * vy);
			}
			if(dim === 'y') {
				// var norm = Math.sqrt((ux*ux + uz*uz)*(vx*vx + vz*vz));
				cosTheta = (ux * vx + uz * vz);
				sinTheta = (uz * vx - ux * vz);
			}
			if(dim === 'z') {
				// var norm = Math.sqrt((ux*ux + uy*uy)*(vx*vx + vy*vy));
				cosTheta = (ux * vx + uy * vy);
				sinTheta = (ux * vy - uy * vx);
			}
			// console.log()
			theta = Math.atan(sinTheta / cosTheta)||0;
			if(cosTheta >= 0) {
				points[k].theta = theta;
			} else {
				points[k].theta = theta + Math.PI;
			}

			points[k].cosTheta = cosTheta;
			points[k].sinTheta = sinTheta;
			// points[k].cx = cx;
			// points[k].cy = cy;
			// points[k].cz = cz;
		}

		points.sort(function(p0, p1) {
			return p0.theta - p1.theta;
		});

	}
	return points;
};

var remMany = function(array, eqFn, many) {
	var i, j;
	var cpt = [];
	var res = [];
	var present;

	for(i=0; i<array.length; i++) {
		present = false;
		for(j=0; j<res.length; j++) {
			if(eqFn(array[i], res[j])) {
				cpt[j] = cpt[j]+1;
				present = true;
			}
		}
		if(!present) {
			res.push(array[i]);
			cpt.push(1);
		}
	}

	for(i=0; i<res.length; i++) {
		if(cpt[i] >= many) {
			res.splice(i, 1);
			cpt.splice(i, 1);
			i--;
		}
	}

	return res;
};

var equalsCoord = function(point1, point2) {
	return point1.x === point2.x && point1.y === point2.y && point1.z === point2.z;
};

var getCenter = function(faces) {
	var i, j, k;
	var face, point;
	var cx, cy, cz, cpt;

	cx = 0;
	cy = 0;
	cz = 0;
	cpt = 0;

	for(i = 0; i < faces.length; i++) {
		face = faces[i];
		face.projection();
		if(face.visible) {

			cx += face.f.x;
			cy += face.f.y;
			cz += face.f.z;
			cpt++;
		}
	}

	cx = cx / cpt||0;
	cy = cy / cpt||0;
	cz = cz / cpt||0;

	console.log(cx);
	console.log(cy);
	console.log(cz);

	var x = parseInt(cx/params.unit - room.position.x, 10);
	var z = parseInt(cz/params.unit - room.position.z, 10);
	console.log(room.map[room.map.length -1 - z][2*x]);
	console.log(x);
	console.log(z);


};