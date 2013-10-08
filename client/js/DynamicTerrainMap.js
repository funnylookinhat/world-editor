/**
 * Dynamic Terrain Map
 * This should divide a large terrain into manageable chunks
 * and automatically switch out low and high detail maps depending on
 * camera position.
 */

THREE.DynamicTerrainMap = function () {
  this._width = null;
  this._depth = null;
  this._map = null;
  this._heightMap = null;
  this._heightMapLength = null;
  this._material = null;
  this._camera = null;
  this._scene = null;
  this._position = null;
}

// Statics
THREE.DynamicTerrainMap._mapChunkSize = 100;

THREE.DynamicTerrainMap.prototype = {
  
  constructor: THREE.DynamicTerrainMap,

  /**
   * options parameters:
   * heightmap based on an image
   *   imageUrl - a heightmap rgba image
   *   imageScale - Multiplier for RGBA values ( Base 255 )
   * OR a flat terrain
   *   flatWidth
   *   flatDepth
   * ALSO INCLUDE
   *   material - The terrain material w/ shaders, etc.
   *   camera - If you want automatic terrain updating
   *   scene
   */
  init: function (options, mainCallback) {
    if( this._width != null ||
        this._depth != null ) {
      return;
    }

    this._scene = options.scene ? options.scene : null;
    this._camera = options.camera ? options.camera : null;
    this._material = options.material ? options.material : null;

    // The "center" position
    this._position = options.position ? options.position : {x:0,y:0,z:0};

    if( this._scene == null || 
        this._material == null ) {
      return;
    }

  	if( options.imageUrl ) {
      options.imageScale = options.imageScale ? options.imageScale : 1;
  	  this._loadImageHeightMap(options.imageUrl,options.imageScale,mainCallback);
  	} else {
      options.flatWidth = options.flatWidth ? options.flatWidth : 1000;
      options.flatDepth = options.flatDepth ? options.flatDepth : options.flatWidth;
      this._createFlatHeightMap(options.flatWidth,options.flatDepth,mainCallback);
    }
  },

  width: function () {
    return this._width;
  },

  depth: function () {
    return this._depth;
  },

  position: function () {
    return this._position;
  },

  getHeight: function (x,z) {
    if( ! this._heightMap[this._getHeightMapArrayPosition(x,z)] ) {
      return false;
    }
    return this._heightMap[this._getHeightMapArrayPosition(x,z)];
  },

  setHeight: function (x,z,height) {
    if( ! this._heightMap[this._getHeightMapArrayPosition(x,z)] ) {
      return;
    }
    this._heightMap[this._getHeightMapArrayPosition(x,z)] = height;
  },

  increaseHeight: function (x,z,dHeight) {
    if( ! this._heightMap[this._getHeightMapArrayPosition(x,z)] ) {
      return;
    }
    dHeight = dHeight ? dHeight : 1;
    this._heightMap[this._getHeightMapArrayPosition(x,z)] += Math.abs(dHeight);
  },

  decreaseHeight: function (x,z,dHeight) {
    if( ! this._heightMap[this._getHeightMapArrayPosition(x,z)] ) {
      return;
    }
    dHeight = dHeight ? dHeight : 1;
    this._heightMap[this._getHeightMapArrayPosition(x,z)] -= Math.abs(dHeight);
  },

  checkGeometry: function(mainCallback) {
    for( var i = 0; i < this._map.length; i++ ) {
      this._map[i].checkGeometry();
    }

    if( mainCallback ) mainCallback();
  },

  _loadImageHeightMap: function (imageUrl, imageScale, callback) {
    var self = this;
    var heightMapImage = new Image;
    
    // We could make this something like _parseImageHeightMapData
    heightMapImage.onload = (function() {
      self._width = heightMapImage.width;
      self._depth = heightMapImage.height;

      console.log(heightMapImage.width+','+heightMapImage.height);

      self._heightMapLength = self._width * self._depth;
      self._heightMap = new Float32Array(self._heightMapLength);
      console.log("TOTAL COUNT: "+self._heightMapLength);

      var heightMapImageDataCanvas = document.createElement('canvas');
      heightMapImageDataCanvas.width = self._width;
      heightMapImageDataCanvas.height = self._depth;
      var heightMapImageDataContext = heightMapImageDataCanvas.getContext('2d');
      heightMapImageDataContext.drawImage(heightMapImage, 0, 0);
      var heightMapImageData = heightMapImageDataContext.getImageData(0, 0, self._width, self._depth);

      var r,g,b,a;
      for( var i = 0; i < heightMapImageData.data.length; i += 4 ) {
        r = heightMapImageData.data[ i + 0 ];
        g = heightMapImageData.data[ i + 1 ];
        b = heightMapImageData.data[ i + 2 ];
        a = heightMapImageData.data[ i + 3 ];
        self._heightMap[ i / 4 ] = imageScale * 
          (
            r * 1 + // Math.pow(255,0) +
            g * 1 + // Math.pow(255,1) +
            b * 1 + // 1 + // Math.pow(255,2) +
            a * 1 // Math.pow(255,3)
          );
      }
      self._generateMap(callback);
    });

    heightMapImage.src = imageUrl;
  },

  _createFlatHeightMap: function (width, depth, callback) {
    this._width = width;
    this._depth = depth;

    this._heightMapLength = this._width * this._depth;
    this._heightMap = new Float32Array(this._heightMapLength);

    for( var i = 0; i < this._heightMapLength; i++ ) {
      this._heightMap[i] = 0; // Ground level.
    }

    this._generateMap(callback);
  },

  _generateMap: function (callback) {
    this._map = [];
    var widthStart = this._position.x - Math.floor( this._width / 2 );
    var depthStart = this._position.z - Math.floor( this._depth / 2 );
    for( var j = 0; j < Math.ceil(this._width / THREE.DynamicTerrainMap._mapChunkSize); j++ ) {
      for( var k = 0; k < Math.ceil(this._depth / THREE.DynamicTerrainMap._mapChunkSize); k++ ) { 
        var mapChunk = new THREE.DynamicTerrainMapChunk();
        mapChunk.init({
          width: ( j * THREE.DynamicTerrainMap._mapChunkSize + THREE.DynamicTerrainMap._mapChunkSize > this._width )
               ? ( this._width - j * THREE.DynamicTerrainMap._mapChunkSize )
               : THREE.DynamicTerrainMap._mapChunkSize,
          depth: ( k * THREE.DynamicTerrainMap._mapChunkSize + THREE.DynamicTerrainMap._mapChunkSize > this._depth )
               ? ( this._depth - k * THREE.DynamicTerrainMap._mapChunkSize )
               : THREE.DynamicTerrainMap._mapChunkSize,
          position: {
            x: ( widthStart + j * THREE.DynamicTerrainMap._mapChunkSize ),
            y: this._position.y,
            z: ( depthStart + k * THREE.DynamicTerrainMap._mapChunkSize )
          },
          heightMap: this._heightMap,
          heightMapLength: this._heightMapLength,
          heightMapWidth: this._width,
          heightMapDepth: this._depth,
          heightMapWidthZero: ( j * THREE.DynamicTerrainMap._mapChunkSize ),
          heightMapDepthZero: ( k * THREE.DynamicTerrainMap._mapChunkSize ),
          material: this._material,
          camera: this._camera,
          scene: this._scene
        });
        this._map.push(mapChunk);
      }
    }

    // Our callback should fire once we're ready to start throwing meshes in and out.
    callback();
  },

  _getHeightMapArrayPosition: function (widthPosition, depthPosition) {
    return ( depthPosition * this._width + widthPosition );
  },

  _getMapArrayPosition: function (widthPosition, depthPosition) {
    return ( 
      ( Math.floor(this._width / THREE.DynamicTerrainMap._mapChunkSize) * Math.floor(depthPosition / THREE.DynamicTerrainMap._mapChunkSize) ) +
      Math.floor(widthPosition / THREE.DynamicTerrainMap._mapChunkSize) 
    );
  }

}