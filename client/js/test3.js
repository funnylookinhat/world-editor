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

var mapWidth = 5000;
var mapDepth = 5000;

var renderer = new THREE.WebGLRenderer({
    canvas: canvas
});
renderer.setClearColor( 0xefefef, 1);
//renderer.setClearColorHex ( 0xefefef, 1); // Pre r58
camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
camera.updateProjectionMatrix();
renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);

var cameraDelta = -0.5;
var cameraYDelta = -0.02;

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
	
	var points = mapWidth * mapDepth;

	var geometry = new THREE.BufferGeometry();
	geometry.attributes = {

		position: {
			itemSize: 3,
			array: new Float32Array( points * 3 ),
			numItems: points * 3
		},
		color: {
			itemSize: 3,
			array: new Float32Array( points * 3 ),
			numItems: points * 3
		}

	}

	var positions = geometry.attributes.position.array;
	var colors = geometry.attributes.color.array;

	for ( var i = 0; i < positions.length; i += 3 ) {

		// positions

		var x = Math.floor( mapWidth / i );
		var y = 0;
		var z = ( i % mapWidth );

		positions[ i ]     = x;
		positions[ i + 1 ] = y;
		positions[ i + 2 ] = z;

		colors[ i ]     = 0;
		colors[ i + 1 ] = 0;
		colors[ i + 2 ] = 0;

	}

	geometry.computeBoundingSphere();

	var material = new THREE.MeshBasicMaterial({
		color: 0x000000,
	});

	var mesh = new THREE.Mesh(geometry,material);

	scene.add(mesh);

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