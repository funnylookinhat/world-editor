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

var cameraDelta = -1;

var terrainmesh;

function render() {
	camera.position.x += cameraDelta;
	camera.position.z += cameraDelta;
	camera.position.y += ( cameraDelta / 10 );
	if( camera.position.x < ( -1 * terrainMap.width() ) ) {
		cameraDelta = 1;
	} else if ( camera.position.x > ( terrainMap.width() ) ) {
		cameraDelta = -1;
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
}

function init() {
	
	terrainmesh = new THREE.Mesh(
		terrainMap._geometry,
		new THREE.MeshBasicMaterial({
			color: 0x000000,
			wireframe: true
		})
	);

	terrainmesh.position.set(0,0,0);
	
	scene.add(terrainmesh);

	camera.position.set(Math.floor(terrainMap.width() * 2),Math.floor(terrainMap.width() * .4)+Math.floor(terrainMap.depth() * .4),Math.floor(terrainMap.depth() * 2));
	camera.lookAt({x:0,y:0,z:0});
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
	width: 250,
	depth: 250
});
terrainMap.initFlat(init);
//terrainMap.initWithImage("/storage/height-test-small.png",[0.1,0.1,0.1,0.1],init);

