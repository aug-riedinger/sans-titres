var render = function (faces, dim, color, color2) {
	var point;
	var points = getEdges(faces, dim);
	if(points.length>0) {
		scr.ctx.beginPath();
		for(var k=0; k<points.length; k++) {
			point = points[k];
			scr.ctx.lineTo(point.X,point.Y);
		}
		scr.ctx.closePath();
		if(color2 === undefined) {
			scr.ctx.fillStyle = color||'white';
		} else {
			var grd = scr.ctx.createLinearGradient(points[0].X, points[0].Y, points[parseInt(points.length/2)].X, points[parseInt(points.length/2)].Y);
			grd.addColorStop(0, color);      
			grd.addColorStop(1, color2);   
			scr.ctx.fillStyle = grd;
		}

		scr.ctx.fill();
		// scr.ctx.stroke();
	}
}


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

	var getEdges2 = function(faces) {
		var face, point;
		var points = [];
		var goodPoints = [];
		var toAdd;
		for (var i=0; i<faces.length; i++) {
			face = faces[i];
			if(face.visible) {
				toAdd = {
					p0: true,
					p1: true,
					p2: true,
					p3: true
				};

				for(var j=0; j< points.length; j++) {
					point = points[j];
					if(face.p0.x === point.x && face.p0.z === point.z) {
						point.cpt++;
						toAdd.p0 = false;
					}
					if(face.p1.x === point.x && face.p1.z === point.z) {
						point.cpt++;
						toAdd.p1 = false;
					}
					if(face.p2.x === point.x && face.p2.z === point.z) {
						point.cpt++;
						toAdd.p2 = false;
					}
					if(face.p3.x === point.x && face.p3.z === point.z) {
						point.cpt++;
						toAdd.p3 = false;
					}
				}	
				if(toAdd.p0) {
					points.push({
						x: face.p0.x,
						z: face.p0.z,
						X: face.p0.X,
						Y: face.p0.Y,
						cpt: 1
					});
				}
				if(toAdd.p1) {
					points.push({
						x: face.p1.x,
						z: face.p1.z,
						X: face.p1.X,
						Y: face.p1.Y,
						cpt: 1
					});
				}
				if(toAdd.p2) {
					points.push({
						x: face.p2.x,
						z: face.p2.z,
						X: face.p2.X,
						Y: face.p2.Y,
						cpt: 1
					});
				}
				if(toAdd.p3) {
					points.push({
						x: face.p3.x,
						z: face.p3.z,
						X: face.p3.X,
						Y: face.p3.Y,
						cpt: 1
					});
				}
			}
		}

		var cx = cz = 0;

		for(var k=0; k< points.length; k++) {
			if(points[k].cpt === 1) {
				goodPoints.push(points[k]);
				cx += points[k].x;
				cz += points[k].z;
				// points.splice(k,1);
			}
		}

		cx = cx/goodPoints.length;
		cz = cz/goodPoints.length;


		if(goodPoints.length>0) {
			// goodPoints[0].theta=0;
			// point = goodPoints.shift();
			point = goodPoints[0];


			for(var k=0; k<goodPoints.length; k++) {
				var ux = point.x - cx;
				var uz = point.z - cz;
				var vx = goodPoints[k].x - cx;
				var vz = goodPoints[k].z - cz;
				// var norm = Math.sqrt((ux*ux + uz*uz)*(vx*vx + vz*vz));
				var cosTheta = (ux*vx + uz*vz);
				var sinTheta = -(ux*vz - uz*vx);
				var theta = Math.atan(sinTheta / cosTheta);
				if(cosTheta>=0) {
					goodPoints[k].theta = theta;
				} else {
					goodPoints[k].theta = theta + Math.PI;
				}
			}

			goodPoints.sort(function(p0,p1) {
				return p0.theta - p1.theta
			});

		}
		return goodPoints;
	}