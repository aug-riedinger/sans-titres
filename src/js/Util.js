// shim layer with setTimeout fallback
window.requestAnimFrame = (function() {
	return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
	function(callback) {
		window.setTimeout(callback, 1000 / 60);
	};
})();

var insertSortTheta = function (arr) {
	for (var i = 1; i < arr.length; i++) {
		var tmp = arr[i],
		j = i;
		while (arr[j - 1] && arr[j - 1].theta > tmp.theta) {
			arr[j] = arr[j - 1];
			--j;
		}
		arr[j] = tmp;
	}

	return arr;
};

var insertSortDistance = function (arr) {
	for (var i = 1; i < arr.length; i++) {
		var tmp = arr[i],
		j = i;
		while (arr[j - 1] && arr[j - 1].distance < tmp.distance) {
			arr[j] = arr[j - 1];
			--j;
		}
		arr[j] = tmp;
	}

	return arr;
};

var canvasToImage = function(canvas) {
	var image = new Image();
	image.src = canvas.toDataURL("image/png");
	return image;
};

var wrapText = function(context, text, x, y, maxWidth, lineHeight) {
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
};


var getParameters = function() {
	var tab = window.location.href.replace(/.*#!/, '').split('&');
	var obj = {};
	for(var i = 0; i < tab.length; i++) {
		var subtab = tab[i].split('=');
		obj[subtab[0]] = subtab[1];
	}
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
	if(x !== undefined || z !== undefined) {
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
};

var showHtml = function(html) {
	$('#artClearView').html(html);
	$('#artClearView').fadeIn(1000);
	$('#artClearView').one('click', function(eventName) {
		remHtml();
	});
};

var remHtml = function() {
	$('#artClearView').fadeOut(1000, function() {
		$('#artClearView').empty();
	});
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

var getEdges = function(faces) {

	if(faces.length === 0) {
		return {
			distance: -99999,
			points: []
		};
	}

	var i, j;
	var face;
	var point;
	var points;
	var minXminY, minXmaxY, maxXmaxY, maxXminY;
	minXminY = minXmaxY = maxXmaxY = maxXminY = faces[0].p0;
	var maxDist = faces[0].distance;
	for(i=0; i<faces.length; i++) {
		face = faces[i];
		face.projection();
		if(face.visible) {

			if(face.distance > maxDist) {
				maxDist = face.distance;
			}

			for(j=0; j<face.points.length; j++) {
				point = face.points[j];
				if(!point.behind) {
					if(point.x < minXminY.x && point.y < minXminY.y) {
						minXminY = point;
					}
					if(point.x < minXmaxY.x && point.y > minXmaxY.y) {
						minXmaxY = point;
					}
					if(point.x > maxXmaxY.x && point.y < maxXmaxY.y) {
						maxXmaxY = point;
					}
					if(point.x > maxXminY.x && point.y > maxXminY.y) {
						maxXminY = point;
					}
				}
			}
		}
	}
	return {
		distance: maxDist,
		points: [minXminY, minXmaxY, maxXmaxY, maxXminY]
	};
};


var getEdges2 = function(faces, dim) {
	var i, j, k;
	var points = [];
	var cptPoints = 0;
	var face, point;
	var cx, cy, cz, cpt;
	var ux, uy, uz, vx, vy, vz, cosTheta, sinTheta, theta;
	var maxDist = 0;

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
				points[cptPoints] = face.p0;
				cptPoints +=1;
			}
			if(!face.p1.behind) {
				points[cptPoints] = face.p1;
				cptPoints +=1;
			}
			if(!face.p2.behind) {
				points[cptPoints] = face.p2;
				cptPoints +=1;
			}
			if(!face.p3.behind) {
				points[cptPoints] = face.p3;
				cptPoints +=1;
			}
		}
	}

	cx = cx / cpt || 0;
	cy = cy / cpt || 0;
	cz = cz / cpt || 0;

	points = remMany(points, equalsCoord, 4);

	if(points.length > 0) {
		point = points[0];
		for(k = 0; k < points.length; k++) {

			if(maxDist < points[k].distance) {
				maxDist = points[k].distance;
			}

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

			theta = Math.atan(sinTheta / cosTheta) || 0;
			if(cosTheta >= 0) {
				points[k].theta = theta;
			} else {
				points[k].theta = theta + Math.PI;
			}

			points[k].cosTheta = cosTheta;
			points[k].sinTheta = sinTheta;
		}

		points = insertSortTheta(points);
		// points.sort(function(p0, p1) {
		// 	return p0.theta - p1.theta;
		// });

}
return {
	distance: maxDist,
	points: points
};
};

var remMany = function(array, eqFn, many) {
	var i, j;
	var cpt = [];
	var res = [];
	var present;

	for(i = 0; i < array.length; i++) {
		present = false;
		for(j = 0; j < res.length; j++) {
			if(eqFn(array[i], res[j])) {
				cpt[j] = cpt[j] + 1;
				present = true;
			}
		}
		if(!present) {
			res.push(array[i]);
			cpt.push(1);
		}
	}

	for(i = 0; i < res.length; i++) {
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

	cx = cx / cpt || 0;
	cy = cy / cpt || 0;
	cz = cz / cpt || 0;

	console.log(cx);
	console.log(cy);
	console.log(cz);

	var x = parseInt(cx / params.unit - room.position.x, 10);
	var z = parseInt(cz / params.unit - room.position.z, 10);
	console.log(room.map[room.map.length - 1 - z][2 * x]);
	console.log(x);
	console.log(z);


};