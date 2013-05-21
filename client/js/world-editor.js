/**
 * World Editor JS
 */

var WorldEditor = function (parameters) {
  
  if( typeof parameters == "undefined" ) {
  	parameters = {};
  }

  if( typeof parameters.canvas == "undefined" ) {
  	this.canvas = document.createElement('canvas');
  	document.getElementById('render').appendChild(this.canvas);
  } else {
  	this.canvas = parameters.canvas;
  }

  this.SCREEN_WIDTH = window.innerWidth;
  this.SCREEN_HEIGHT = window.innerHeight;

  // Init Editor
  // Init Controls
  // 
  this.scene = new THREE.Scene();
  
  this.camera = new THREE.PerspectiveCamera(
  	45,
  	this.SCREEN_WIDTH / this.SCREEN_HEIGHT,
  	1,
  	50000
  );
  this.camera.position.set(5000,2500,5000);
  this.camera.lookAt({x:0,y:0,z:0});
  /*
  this.cameraControls = new EditorCameraControls({
    camera: this.camera,
    focus: {
      x: 0,
      y: 0,
      z: 0
    },
    minPhi: ( 0.01 ),
    maxPhi: ( Math.PI / 2 ),
    phi: ( 1 ),
    radius: 1000
  });
  */
  
  this.renderer = new THREE.WebGLRenderer({
  	canvas: this.canvas
  });
  this.renderer.setClearColor ( 0xefefef, 1);
  
  // Some editor variables.
  this.terrainDetail = null;
  this.terrainGeometry = null;
  this.terrainMesh = null;
  this.terrain = null;
  this.heightMap = null;
  this.textureMap = null;

  this._windowResized();

  this._bindWindowEvents();

  // this._loadWorld();

  // this.render();
}

// Some statics for now.
WorldEditor.worldWidth = 5000;  // 5000 Meters
WorldEditor.worldHeight = 5000; // 5000 Meters
WorldEditor.worldQuality = 1.0;   // 4 Vertices per Meter

// This should be replaced with a dynamic selection of textures, etc.
WorldEditor.generateTerrainMaterial = function () {
  return new THREE.MeshBasicMaterial({
    color: 0x000000,
    wireframe: false
  });
}

WorldEditor.prototype._windowResized = function () {
  this.SCREEN_WIDTH = window.innerWidth;
  this.SCREEN_HEIGHT = window.innerHeight;

  this.camera.aspect = this.SCREEN_WIDTH / this.SCREEN_HEIGHT;
  this.camera.updateProjectionMatrix();

  this.renderer.setSize(this.SCREEN_WIDTH, this.SCREEN_HEIGHT);

  // Update tool positions
}

WorldEditor.prototype._bindWindowEvents = function () {
  // Setup requestAnimFrame
  // Thanks Paul Irish.
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
  
  var thisRef = this;
  $(window).resize( function () {
    thisRef._windowResized();
  });
}

WorldEditor.prototype._clearEditor = function () {
  if( this.terrain != null ) {
    this.scene.remove( this.terrain );
    this.terrainGeometry = null;
    this.terrainMesh = null;
    this.terrain = null;
    this.heightMap = null;
    this.textureMap = null;
  }
}

WorldEditor.prototype.loadWorld = function(something) {
  this._clearEditor();
  if( typeof something == "undefined" ||
      something == null ) {
    this._loadBlankWorld();
  } else {
    // Something
  }
}

WorldEditor.prototype._loadBlankWorld = function(something) {
  this.terrainDetail = new THREE.LOD();
  for( var i = 1; i <= 5; i++ ) {
    var geometry = new THREE.PlaneGeometry(
      WorldEditor.worldWidth,
      WorldEditor.worldHeight,
      Math.round(WorldEditor.worldWidth * WorldEditor.worldQuality / Math.pow(10,i)),
      Math.round(WorldEditor.worldHeight * WorldEditor.worldQuality / Math.pow(10,i))
    );
    geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );
    var mesh = new THREE.Mesh(
      geometry,
      WorldEditor.generateTerrainMaterial()
    );
    mesh.updateMatrix();
    mesh.matrixAutoUpdate = false;
    this.terrainDetail.addLevel(Math.pow(10,i), mesh);
  }
  /*
  this.terrainGeometry = new THREE.PlaneGeometry( 
    WorldEditor.worldWidth, 
    WorldEditor.worldHeight, 
    WorldEditor.worldWidth * WorldEditor.worldQuality, 
    WorldEditor.worldHeight * WorldEditor.worldQuality
  );
  this.terrainGeometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );
  this.terrainMesh = new THREE.Mesh(
    this.terrainGeometry,
    WorldEditor.generateTerrainMaterial()
  );
  this.terrainMesh.position.set(
    WorldEditor.worldWidth / 2,
    0,
    WorldEditor.worldHeight / 2
  );
  this.scene.add(this.terrainMesh);
  */
  this.terrainDetail.position.set(
    ( -1 * WorldEditor.worldWidth / 2 ),
    0,
    ( -1 * WorldEditor.worldHeight / 2 )
  );
  console.log(this.terrainDetail.position.x+','+this.terrainDetail.position.y+','+this.terrainDetail.position.z);
  this.scene.add(this.terrainDetail);

  /*
  this.scene.add(new THREE.Mesh(
    new THREE.SphereGeometry( 1000, 10, 10 ),
    new THREE.MeshBasicMaterial({
      color: 0x000000,
      wireframe: true
    })
  ));
  */
  var geo = new THREE.PlaneGeometry(
    WorldEditor.worldWidth,
    WorldEditor.worldHeight,
    Math.round(WorldEditor.worldWidth * WorldEditor.worldQuality / Math.pow(10,2)),
    Math.round(WorldEditor.worldHeight * WorldEditor.worldQuality / Math.pow(10,2))
  );
  geo.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );
  this.scene.add(new THREE.Mesh(
    geo,
    new THREE.MeshBasicMaterial({
      color: 0x000000,
      wireframe: true
    })
  ));
}

WorldEditor.prototype._render = function () {
  //this.cameraControls.updateCamera();
  this.scene.updateMatrixWorld();
  var thisRef = this;
  this.scene.traverse( function ( object ) {
    if ( object instanceof THREE.LOD ) {
      object.update( thisRef.camera );
    }
  });

  this.renderer.render(this.scene, this.camera);
}

WorldEditor.prototype.render = function () {
  var thisRef = this;
  (function renderLoop(){
    requestAnimFrame(renderLoop);
    thisRef._render();
  })();
}