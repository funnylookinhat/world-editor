// Boring Stuff
var canvas = document.createElement('canvas');
document.getElementById('render').appendChild(canvas);
var SCREEN_WIDTH = window.innerWidth;
var SCREEN_HEIGHT = window.innerHeight;
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(
  45,
  SCREEN_WIDTH / SCREEN_HEIGHT,
  1,
  5000
);

var renderer = new THREE.WebGLRenderer({
    canvas: canvas
});
renderer.setClearColor( 0xefefef, 1);
//renderer.setClearColorHex ( 0xefefef, 1); // Pre r58
camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
camera.updateProjectionMatrix();
renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
renderer.autoClearColor = false;


var cameraDelta = -0.05;

var terrainmesh;

var a = 1;

function render() {
	camera.position.x += cameraDelta;
	camera.position.z += cameraDelta;
	/*
	var h = terrainMap.height(
		( camera.position.x + terrainMap.width() / 2 ),
		( camera.position.z + terrainMap.depth() / 2 ));
	if( h ) {
		camera.position.y = h + 1;
	}
	*/
	// camera.position.y += ( cameraDelta / 10 );

	if( camera.position.x < ( -0.5 * terrainMap.width() &&
		cameraDelta < 0 ) ) {
		cameraDelta = 0.05;
	} else if ( camera.position.x > ( 0.5 * terrainMap.width() ) && 
				cameraDelta > 0 ) {
		cameraDelta = -0.05;
	}
	renderer.render(scene, camera);

	// Test Update Terrain Height
	/*
	for( var i = 0; i < terrainmesh.geometry.vertices.length; i++ ) {
		if( i < 10000 ) {
			terrainmesh.geometry.vertices[i].y += 0.5;
		}
	}
	terrainmesh.geometry.verticesNeedUpdate = true;
	*/

	// Test Mountain
	var x = 0;
	var z = 0;
	var y = 0;
	var d = 0;
	var xMid = terrainMap.width() / 2;
	var zMid = terrainMap.depth() / 2;
	for( var i = 0; i < ( terrainMap.width() * terrainMap.depth() ); i++ ) {
		x = Math.floor( i / terrainMap.width() );
		z = Math.floor( i % terrainMap.width() );
		d = Math.sqrt( Math.pow( ( x - xMid ) , 2 ) + Math.pow( ( z - zMid ) , 2 ));
		if( d <= 100 ) {
			y = a * Math.sqrt( 500 - d );
		} else if( d <= 500 ) {
			y = a * ( 500 - d );
		} else {
			y = 0;
		}
		terrainMap.setHeight(x,z,y);
//		terrainmesh.geometry.vertices[i].y = y;
	}
	terrainmesh.geometry.verticesNeedUpdate = true;
	a += 0.1;
	console.log(y);
	
}

function init() {
	/*
	terrainmesh = new THREE.Mesh(
		terrainMap._geometry,
		new THREE.MeshBasicMaterial({
			color: 0x000000,
			wireframe: true
		})
	);
	*/

	// TEst
	var material = new THREE.GenericTerrainMaterial();
	terrainmesh = new THREE.Mesh(
		terrainMap._geometry,
		material.generateMaterial()
	);

	terrainmesh.position.set(0,0,0);
	
	scene.add(terrainmesh);

	camera.position.set(
		Math.floor(terrainMap.width() * 0.5),
		5,//\\Math.floor(terrainMap.width() * 0.3) + Math.floor(terrainMap.depth() * 0.3),
		Math.floor(terrainMap.depth() * 0.5)
	);
	camera.lookAt({x:0,y:0,z:0});
	//camera.lookAt({x:0,y:camera.position.y,z:0});
	console.log(camera.position.x+','+camera.position.y+','+camera.position.z);

	(function renderLoop(){
	  requestAnimFrame(renderLoop);
	  render();
	})();
}


window.requestAnimFrame = (function(){
	return  window.requestAnimationFrame  || 
	window.webkitRequestAnimationFrame    || 
	window.mozRequestAnimationFrame       || 
	window.oRequestAnimationFrame         || 
	window.msRequestAnimationFrame        || 
	function( callback ){
		window.setTimeout(callback, 1000 / 60);
	};
})();

// Start
var terrainMap = new THREE.TerrainMap({
	width: 1000,
	depth: 1000
});
terrainMap.initFlat(init);
//terrainMap.initWithImage("/storage/height-test-small.png",[0.1,0.1,0.1,0.1],init);

