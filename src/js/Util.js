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


var getParameters = function(href) {
	var tab = href.replace(/.*#!/, '').split('&');
	var obj = {};
	for(var i = 0; i < tab.length; i++) {
		var subtab = tab[i].split('=');
		obj[subtab[0]] = subtab[1];
	}
	return obj;
};

var showArtInfo = function(artFace) {
	$('#artTitle').html('« '+artFace.f.info.titre+' »'  || '');
	$('#artSerie').html(artFace.f.info.ensemble||'');
	$('#artAuthor').html(artFace.f.info.artiste || '');
	$('#artDescription').html(artFace.f.info.description  || '');
	$('#artInfo').fadeIn(1000, function() {
		setTimeout(function() {
			$('#artInfo').fadeOut(1000);
		}, 4000);
	});
};

var showHtml = function(html) {
	$('#artClearView').append(html);
	$('#artClearView').append('<div id="back">RETOUR</div>');
	$('#artClearView').fadeIn(1000);
	$('#artClearView').one('click', function(eventName) {
		remHtml();
	});
};

var remHtml = function() {
	$('#back').fadeOut(1000);
	$('#artClearView').fadeOut(1000, function() {
		$('#artClearView').empty();
	});
};


var getEdges = function(faces, dim, colors) {

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
	var minDim, maxDim;
	var maxDist;
	var moyDist = 0;
	var nbVisible = 0;
	for(i=0; i<faces.length; i++) {
		face = faces[i];
		face.projection();
		if(face.visible) {

			if(!minDim && !maxDim && !maxDist) {
				minDim = maxDim = faces[i];
				maxDist = faces[i].distance;
			}

			nbVisible +=1;
			moyDist +=face.distance;

			if (dim === 'left' || dim === 'right') {
				if(face.f.z < minDim.f.z) {
					minDim = face;
				}
				if(face.f.z > maxDim.f.z) {
					maxDim = face;
				}
				
			}
			if (dim === 'top' || dim === 'bottom') {
				if(face.f.x < minDim.f.x) {
					minDim = face;
				}
				if(face.f.x > maxDim.f.x) {
					maxDim = face;
				}
				
			}
		}
	}

	if(!minDim && !maxDim && !maxDist) {
		return {
			distance: -99999,
			points: []
		};
	}

	if(dim === 'top' || dim === 'left') {
		return {
			type: dim,
			color: colors[dim],
			distance: moyDist/nbVisible,
			points: [minDim.p3, minDim.p0, maxDim.p1, maxDim.p2]
		};
	}
	if(dim === 'bottom' || dim === 'right') {
		return {
			type: dim,
			color: colors[dim],
			distance: moyDist/nbVisible,
			points: [minDim.p1, minDim.p2, maxDim.p3, maxDim.p0]
		};
	}

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