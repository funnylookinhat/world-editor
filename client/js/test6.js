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
  1000
);


var renderer = new THREE.WebGLRenderer({
    canvas: canvas
});
renderer.setClearColor( 0xccccff, 1);
camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
camera.updateProjectionMatrix();
renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
renderer.autoClearColor = false;

var cameraShift = 0;
var cameraCheck = false;
var cameraDelta = 0.0;//-0.5;
var cameraY = 2;

var cameraCycle = 2;
var cameraAngle = 0;

var a = 0.01;
var time;

var water


function render() {
  
  cameraShift += Math.abs(cameraDelta*2);
  if( ! cameraCheck &&
  		cameraShift > 100 ) {
  	cameraCheck = true;
  }
  camera.position.x += cameraDelta;
  camera.position.z += cameraDelta;
  camera.position.y = cameraY;

  water.material.uniforms.time.value = new Date().getTime() / 100;

  renderer.render(scene, camera);
  
  a += 0.01;
}

function init() {
  
  camera.position.set(
    500,
    cameraY,
    500
  );
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

function windowResize () {
  SCREEN_WIDTH = window.innerWidth;
  SCREEN_HEIGHT = window.innerHeight;
  camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
  camera.updateProjectionMatrix();
  renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT);
}

window.addEventListener('resize', windowResize, false );

var waterGeometry = new THREE.PlaneGeometry( 5000, 5000, 2, 2 );
waterGeometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );

water = new THREE.Mesh(
	waterGeometry,
	new THREE.ShaderMaterial({
		uniforms: {
			time: { type: 'f', value: 0 }
		},
		attributes: {
			displacement: { type: 'f', value: [] }
		},
		vertexShader: document.getElementById( 'waterVertexShader' ).textContent,
		fragmentShader: document.getElementById( 'waterFragmentShader' ).textContent,
		transparent: true
	})
);

water.dynamic = true;
water.position.set(0,0,-2);
scene.add(water);

/*
var dirtGeometry = new THREE.PlaneGeometry( 5000, 5000, 2, 2 );
dirtGeometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );

var dirt = new THREE.Mesh(
	dirtGeometry,
	new THREE.MeshBasicMaterial({
    color: 0x6c2700,
  })
);

dirt.position.set(0,0,-10);

scene.add(dirt);
*/

init();