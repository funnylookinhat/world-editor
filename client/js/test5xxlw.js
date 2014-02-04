// Boring Stuff

if( typeof useWorkers == "undefined" ) {
  var useWorkers = false;
}

var canvas = document.createElement('canvas');
document.getElementById('render').appendChild(canvas);
var SCREEN_WIDTH = window.innerWidth;
var SCREEN_HEIGHT = window.innerHeight;
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(
  45,
  SCREEN_WIDTH / SCREEN_HEIGHT,
  1,
  2500
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
var cameraDelta = 2.0;//-0.5;
var cameraY = 200;

var cameraCycle = 1;
var cameraAngle = 0;

var a = 0.01;
var time;

var water;

function render() {
  
  cameraShift += Math.abs(cameraDelta*2);
  if( ! cameraCheck &&
  		cameraShift > 50 ) {
  	cameraCheck = true;
  	terrainMap.checkGeometry(function() {
      cameraShift = 0;
      cameraCheck = false;
  	});
  }
  camera.position.x += cameraDelta;
  camera.position.z += cameraDelta;
  camera.position.y = cameraY;

  water.material.uniforms.time.value = ( ( new Date().getTime() / 1000 ) % 10 );

  if( cameraCycle == 1 ) {
    if( camera.position.x < ( -0.5 * terrainMap.width() &&
      cameraDelta < 0 ) ) {
      cameraDelta = cameraDelta * -1
    } else if ( camera.position.x > ( 0.5 * terrainMap.width() ) && 
                cameraDelta > 0 ) {
      cameraCycle = 1;
      cameraDelta = cameraDelta * -1;
    }
  } else {
    if( cameraAngle < ( Math.PI * 2 ) ) {
      cameraAngle += cameraDelta * 0.01;
      camera.position.x = Math.sin(cameraAngle) * terrainMap.width() * 0.7;
      camera.position.z = Math.cos(cameraAngle) * terrainMap.width() * 0.7;
      camera.lookAt({x:0,y:0,z:0});
    } else {
      cameraCycle = 1;
      camera.position.x = ( 0.5 * terrainMap.width() );
      
    }
  }

  renderer.render(scene, camera);
  
  a += 0.01;
}

setInterval(function() {
	console.log('CAMERA: '+camera.position.x+','+camera.position.y+','+camera.position.z);
},1000);

function init() {
  console.log('Terrain ready! WxD: '+terrainMap.width()+'x'+terrainMap.depth());
  camera.position.set(
    Math.floor(terrainMap.position().x + terrainMap.width() * 0.5),
    cameraY,
    Math.floor(terrainMap.position().z + terrainMap.depth() * 0.5)
  );
  camera.lookAt({x:0,y:0,z:0});

  terrainMap.checkGeometry();

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

function windowResize () {
  SCREEN_WIDTH = window.innerWidth;
  SCREEN_HEIGHT = window.innerHeight;
  camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
  camera.updateProjectionMatrix();
  renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT);
}

window.addEventListener('resize', windowResize, false );

var genericTerrainMaterial = new THREE.GenericTerrainMaterial();
var material = genericTerrainMaterial.generateMaterial();
/*
material = new THREE.MeshBasicMaterial({
  color: 0x333333,
  wireframe: true
});
*/
// Start
var terrainMap = new THREE.DynamicTerrainMap();
terrainMap.init({
  scene: scene,
  camera: camera,
  material: material,
  imageUrl: 'storage/height-test-4700.png',
  imageScale: 1.0,
  flatWidth: 5000,	
  flatDepth: 5000,
  position: {x: 0, y: 0, z: 0},
  debugMode: false,
  useWorkers: useWorkers ? true : false
},init);


var waterGeometry = new THREE.PlaneGeometry( 5000, 5000, 2, 2 );
waterGeometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );
for( var i = 0; i < waterGeometry.vertices.length; i++ ) {
  waterGeometry.vertices[i].y = 0.5;
}
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
water.position.set(0,0,1);
scene.add(water);

//terrainMap.initWithImage("/storage/height-test-small.png",[0.1,0.1,0.1,0.1],init);

