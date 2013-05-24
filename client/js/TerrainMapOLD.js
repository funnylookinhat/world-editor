/**
 * Terrain Map - Takes Height and Texture map
 * and divides it out so that you can load it all
 * without crashing.
 * Requires:
 *   THREE.LOD
 *   THREE.PlaneGeometry
 *   THREE.ShaderMaterial
 */

// TODO - Pass material and shader.
var TerrainMapOLD = function (parameters) {
  if( typeof parameters == "undefined" ) {
  	parameters = {};
  }

  this._width = null;
  this._depth = null;
  
  // this._levels = parameters.levels && parameters.levels > 0 ? parameters.levels : 4;
  this._tileWidth = parameters.tileWidth && parameters.tileWidth > 0 ? parameters.tileWidth : 50;
  this._tileDepth = parameters.tileDepth && parameters.tileDepth > 0 ? parameters.tileDepth : 50;

  if( typeof parameters.heightMap != "undefined" ) {
    this._heightMapSource = parameters.heightMap;
  } else {
    this._heightMapSource = null;
    this._width = parameters.width && parameters.width > 0 ? parameters.width : 1000;
    this._depth = parameters.depth && parameters.depth > 0 ? parameters.depth : 1000;
  }

  this._tiles = null;
  this._heightMap = null;

  if( this._heightMapSource == null ) {
    //this._init();
  } else {
    // Read in image data with this._init() as callback.
  }

  console.log("Starting: "+this._width+'x'+this._depth);

}

TerrainMapOLD.vertices = [25,15,3];
TerrainMapOLD.distances = [0,500,1000];
TerrainMapOLD.testColors = [
  0x008800,
  0x0000cc,
  0xff0000
];
TerrainMapOLD.distanceFull = 100;

TerrainMapOLD.prototype._init = function () {
  if( this._tiles != null ) {
    throw "TerrainMapOLD cannot be init() more than once.";
  }
  this._tiles = [];
  var mX = Math.floor( this._width / TerrainMapOLD.vertices[0] ) + ( this._width % TerrainMapOLD.vertices[0] == 0 ? 0 : 1 );
  var mZ = Math.floor( this._depth / TerrainMapOLD.vertices[0] ) + ( this._depth % TerrainMapOLD.vertices[0] == 0 ? 0 : 1 );
  for( var iX = 0; iX < mX; iX++ ) {
    this._tiles[iX] = [];
    for( var iZ = 0; iZ < mZ; iZ++ ) {
      this._tiles[iX][iZ] = new TerrainMapOLDTile(
        iX * TerrainMapOLD.vertices[0],
        iZ * TerrainMapOLD.vertices[0],
        TerrainMapOLD.vertices[0],
        TerrainMapOLD.vertices[0],
        this._width,
        this._depth,
        TerrainMapOLD.vertices,
        TerrainMapOLD.distances,
        this._heightMap
      );
    }
  }
}

TerrainMapOLD.prototype.addToScene = function (scene) {
  for( iX in this._tiles ) {
    for( iZ in this._tiles[iX] ) {
      this._tiles[iX][iZ].addToScene(scene);
    }
  }
}

// TODO - Pass material and shader.
// TODO - Pass distance modifier.
var TerrainMapOLDTile = function (x,z,width,depth,totalWidth,totalDepth,vertices,distances,heightMap) {
  this._x = x;
  this._z = z;
  this._width = width;
  this._depth = depth;
  this._totalWidth = totalWidth;
  this._totalDepth = totalDepth;
  this._vertices = vertices;
  this._distances = distances;
  this._heightMap = heightMap;

  this._meshes = [];
  this._lod = new THREE.LOD();

  for( var i = 0; i < this._vertices.length; i++ ) {
    var geometry = new THREE.PlaneGeometry(
      this._width,
      this._depth,
      ( this._vertices[i] - 1 ),
      ( this._vertices[i] - 1 )
    );
    geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );
    this._meshes[i] = new THREE.Mesh(
      geometry,
      new THREE.MeshBasicMaterial({
        color: TerrainMapOLD.testColors[i],
        wireframe: true
      })
    );
    this._meshes[i].updateMatrix();
    this._meshes[i].matrixAutoUpdate = false;
    // console.log('Adding '+i+' with '+this._vertices[i]+' at '+this._distances[i]);
    this._lod.addLevel(this._meshes[i], this._distances[i]);
  }

  this._lod.position.set(
    this._x + this._width / 2 - ( this._totalWidth / 2 ),
    0,
    this._z + this._width / 2 - ( this._totalDepth / 2 )
  );

  if( this._heightMap != null ) {
    // Apply Y Data
  }

  this._fullMesh = null;

  this._calibrateHeights();
}

TerrainMapOLDTile.prototype._calibrateHeights = function () {
  // TODO
}

TerrainMapOLDTile.prototype.addToScene = function ( scene ) {
  scene.add(this._lod);
}

TerrainMapOLD.prototype.updateScene = function ( scene, camera ) {
  for( iX in this._tiles ) {
    for( iZ in this._tiles[iX] ) {
      // this._tiles[iX][iZ].addToScene(scene);
      var distance = this._tiles[iX][iZ]._lod.update(camera);
      /*
      if( distance < TerrainMapOLD.distanceFull &&
          this._fullMesh == null ) {
        scene.remove(this._lod);
        var geometry = new THREE.PlaneGeometry(
          this._width,
          this._depth,
          ( this._width - 1 ),
          ( this._depth - 1 )
        );
        geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );
        this._fullMesh = new THREE.Mesh(
          geometry,
          new THREE.MeshBasicMaterial({
            color: 0x000000,
            wireframe: true
          })
        );
        scene.add(this._fullMesh);
      } else if( this._fullMesh != null ) {
        scene.remove(this._fullMesh);
        scene.add(this._lod);
        this._fullMesh = null;
      }
      */
    }
  }
}



THREE.LOD.prototype.update = function () {

  var v1 = new THREE.Vector3();
  var v2 = new THREE.Vector3();

  return function ( camera ) {

    if ( this.objects.length > 1 ) {

      v1.getPositionFromMatrix( camera.matrixWorld );
      v2.getPositionFromMatrix( this.matrixWorld );

      var distance = v1.distanceTo( v2 );

      this.objects[ 0 ].object.visible = true;

      for ( var i = 1, l = this.objects.length; i < l; i ++ ) {

        if ( distance >= this.objects[ i ].distance ) {

          this.objects[ i - 1 ].object.visible = false;
          this.objects[ i     ].object.visible = true;

        } else {

          break;

        }

      }

      for( ; i < l; i ++ ) {

        this.objects[ i ].object.visible = false;

      }
      return distance;
    }
    return false;
  };

}();
