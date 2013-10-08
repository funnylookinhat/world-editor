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

var mapWidth = 250;
var mapDepth = 250;


var cameraDelta = -0.05;
var cameraYDelta = 0.02;


var terrainMap;


function render() {
	camera.position.x += cameraDelta;
	camera.position.z += cameraDelta;
	camera.position.y += cameraYDelta;
	//camera.position.y += ( cameraDelta / 10 );
	if( camera.position.x < ( -0.5 * mapWidth ) ) {
		cameraDelta = 0.05;
		camera.position.x += cameraDelta * 4;
		camera.position.z += cameraDelta * 4;
	} else if ( camera.position.x > ( 0.5 * mapWidth ) ) {
		cameraDelta = -0.05;
		camera.position.x += cameraDelta * 4;
		camera.position.z += cameraDelta * 4;
	}

	if( camera.position.y < 2 ) {
		cameraYDelta = 0.02;
	} else if ( camera.position.y > 20 ) {
		cameraYDelta = -0.02;
	}

	scene.updateMatrixWorld();
	terrainMap.updateScene(scene, camera);
	/*
	scene.traverse( function ( object ) {
	  if ( object instanceof THREE.LOD ) {
	  	object.update( camera );
	  }
	});
    */

	renderer.render(scene, camera);
}


function init() {
	
	terrainMap = new THREE.TerrainMap({
		width: mapWidth,
		depth: mapDepth,
		levels: 3
	});

	terrainMap._init();

	terrainMap.addToScene(scene);

	camera.position.set(Math.floor(( 0.5 * mapWidth )),2,Math.floor(( 0.5 * mapDepth )));
	camera.lookAt({x:0,y:0,z:0});
	
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

init();