var floorRenderer2 = function () {
	var point;
	var points = getEdges();
	scr.ctx.beginPath();
	for(var k=0; k<points.length; k++) {
		point = points[k];
		scr.ctx.lineTo(point.X,point.Y);
	}
	scr.ctx.closePath();
	scr.ctx.fillStyle = '#80827d';
		// var grd = scr.ctx.createLinearGradient(face0.p1.X, face0.p1.Y, face1.p0.X, face1.p0.Y);
		// grd.addColorStop(0, '#A1A1A1');      
		// grd.addColorStop(1, '#f9f9f9');   
		// scr.ctx.fillStyle = grd;

		scr.ctx.fill();
		scr.ctx.stroke();

	}


	var getEdges = function() {
		var face, point;
		var points = [];
		var goodPoints = [];
		var sortedPoints = [];
		var toAdd;
		for (var i=0; i<room.floors.length; i++) {
			face = room.floors[i];
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

		for(var k=0; k< points.length; k++) {
			if(points[k].cpt === 1) {
				goodPoints.push(points[k]);
				// points.splice(k,1);
			}
		}
		if(goodPoints.length>0) {
			goodPoints[0].theta=0;
			point = goodPoints.shift();
			// point = goodPoints[0];


			for(var k=0; k<goodPoints.length; k++) {
				var ux = goodPoints[k].x - point.x;
				var uz = goodPoints[k].z - point.z;
				var vx = -1000  -point.x;
				var vz = -1000 -point.z;
				var upvx = ux + vx;
				var upvz = uz + vz;
				var norm = Math.sqrt((ux*ux + uz*uz)*(vx*vx + vz*vz));
				var cosTheta = (ux*vx + uz*vz) / norm;
				var sinTheta = -(ux*vz - uz*vx) / norm;
				var cosTheta2 = (ux*upvx + uz*upvz);
				var sinTheta2 = (ux*upvz - uz*upvx);
				var theta = Math.atan(sinTheta / cosTheta);
				var theta2 = Math.atan(sinTheta2 / cosTheta2);
				// goodPoints[k].theta = theta2 * 2;
				if(sinTheta>=0) {
					if(cosTheta>=0) {
						goodPoints[k].theta = theta;
					} else {
						goodPoints[k].theta = theta + Math.PI;
					}
				} else {
					if(cosTheta<=0) {
						goodPoints[k].theta = theta + Math.PI;
					} else {
						goodPoints[k].theta = theta + Math.PI*3/2;
					}
				}

				goodPoints[k].cosTheta = cosTheta;
				goodPoints[k].sinTheta = sinTheta;

			}
				// console.log(Math.atan(goodPoints[k].theta));
				// goodPoints[k].theta = (ux*vx + uz*vz) / norm;

				// goodPoints.shift();

				goodPoints.sort(function(p0,p1) {
					return p0.theta - p1.theta
				});

				goodPoints.unshift(point);
			}
			return goodPoints;
		}