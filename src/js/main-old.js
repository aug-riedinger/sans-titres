var camera, scene, renderer;
var material, mesh, plane, planeMesh;
var controls;
var wall1, wall2, wall3, wall4;
var mesh1, mesh2, mesh3, mesh4;

var clock = new THREE.Clock();

init();
animate();

function init() {

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.z = 800;

    controls = new THREE.FirstPersonControls( camera );

    controls.movementSpeed = 70;
    controls.lookSpeed = 0.05;
    controls.noFly = true;
    controls.lookVertical = false;


    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2( 0x000000, 0.0035 );

    light = new THREE.DirectionalLight( 0xffffff );
    light.position.set( 0, 0.5, 1 ).normalize();
    scene.add( light );

    material = new THREE.MeshBasicMaterial( { color: 0x000000, } );


    wall1 = new THREE.CubeGeometry( 1000, 200, 10 );
    mesh1 = new THREE.Mesh( wall1, material );
    mesh1.position = {
        x : -500,
        y : -500
    };
    scene.add( mesh1 );

    wall2 = new THREE.CubeGeometry( 1000, 200, 10 );
    mesh2 = new THREE.Mesh( wall2, material );
    mesh2.rotation.z = -Math.PI/2;
    mesh2.position = {
        x : 500,
        y : -500
    };
    scene.add( mesh2 );

    wall3 = new THREE.CubeGeometry( 1000, 200, 10 );
    mesh3 = new THREE.Mesh( wall3, material );
    mesh3.position = {
        x : -500,
        y : 500
    };
    scene.add( mesh3 );

    wall4 = new THREE.CubeGeometry( 1000, 200, 10 );
    mesh4 = new THREE.Mesh( wall4, material );
    mesh2.rotation.z = -Math.PI/2;
    mesh4.position = {
        x : 500,
        y : 500
    };
    scene.add( mesh4 );



    // plane = new THREE.Plane(500,500, 20, 20)
    // planeMesh = new THREE.Mesh(plane,material);

    // scene.add(planeMesh);

    var planeGeo = new THREE.PlaneGeometry(1000, 1000, 0, 0);
    var planeMat = new THREE.MeshLambertMaterial({color: 0xFFFFFF});
    var plane = new THREE.Mesh(planeGeo, planeMat);
    plane.rotation.x = -Math.PI/2;
    // plane.position.y = -25;
    plane.receiveShadow = true;
    scene.add(plane);


    renderer = new THREE.CanvasRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );

    // enable shadows on the renderer
    renderer.shadowMapEnabled = true;

    document.body.appendChild( renderer.domElement );

}

function animate() {

        // note: three.js includes requestAnimationFrame shim

        // mesh.rotation.x += 0.01;
        // mesh.rotation.y += 0.02;
        var delta = clock.getDelta(),
        time = clock.getElapsedTime() * 5;

        controls.update( delta );


        renderer.render( scene, camera );

        requestAnimationFrame( animate );
    }

    function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );

        controls.handleResize();

    }