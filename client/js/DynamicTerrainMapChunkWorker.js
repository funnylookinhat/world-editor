/**
 * Creates the geometry for a DynamicTerrainMapChunk
 */

importScripts('includes/three.min.js');

self._id = null;
self._width = null;
self._depth = null;
self._heightMap = null;
self._heightMapLength = null;

self.onmessage = function (e) {
  if( e.data.action == 'init' ) {
    self._id = e.data.actionData.id;
    self._width = e.data.actionData.width;
    self._heightMap = e.data.actionData.heightMap;
    self._heightMapLength = e.data.actionData.heightapLength;

    // READY.
    self.postMessage({
      action: 'init',
      id: self._id
    });
  } else {
    // Create Geometry
    var width = e.data.actionData.chunkWidth;
    var depth = e.data.actionData.chunkDepth;
    var heightMapWidthZero = e.data.actionData.heightMapWidthZero;
    var heightMapDepthZero = e.data.actionData.heightMapDepthZero;
    var currentGeometryDistanceIndex = e.data.actionData.distanceIndex;
    var mapChunkIndex = e.data.actionData.mapChunkIndex;
    
    var xVertices = Math.floor( width / Math.pow(4,currentGeometryDistanceIndex) );
    var zVertices = Math.floor( depth / Math.pow(4,currentGeometryDistanceIndex) );

    var geoWidth = width;
    var geoDepth = depth;
    var startWidth = heightMapWidthZero;
    var startDepth = heightMapDepthZero;
    var xOffset = 0;
    var zOffset = 0;
    var geoIncrement = Math.pow(4,currentGeometryDistanceIndex);

    
    if( heightMapWidthZero != 0 ) {
      geoWidth += geoIncrement;
      xVertices++;
      xOffset -= geoIncrement / 2;
      startWidth -= geoIncrement;
    }
    
    if( ( heightMapWidthZero + width + geoIncrement ) < self._width ) {
      geoWidth += geoIncrement;
      xVertices++;
      xOffset += geoIncrement / 2;
    }
    
    if( heightMapDepthZero != 0 ) {
      geoDepth += geoIncrement;
      zVertices++;
      zOffset -= geoIncrement / 2;
      startDepth -= geoIncrement;
    }
    
    if( ( heightMapDepthZero + depth + geoIncrement ) < self._depth ) {
      geoDepth += geoIncrement;
      zVertices++;
      zOffset += geoIncrement / 2;
    }
    
   
    var newGeometry = new THREE.PlaneGeometry(
      geoWidth,
      geoDepth,
      xVertices - 1,
      zVertices - 1
    );
    newGeometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );

    // Heightmap test
    var x = 0;
    var z = 0;
    for( var i = 0; i < newGeometry.vertices.length; i++ ) {
      z = Math.floor( i / xVertices );
      x = i - z * xVertices;
      z = z * ( geoDepth / Math.floor( geoDepth / Math.pow(4,currentGeometryDistanceIndex) ) );
      x = x * ( geoWidth / Math.floor( geoWidth / Math.pow(4,currentGeometryDistanceIndex) ) );
      newGeometry.vertices[i].y = self._heightMap[_getHeightMapArrayPosition(Math.floor(startWidth + x), Math.floor(startDepth + z), self._width)];
    }

    var vertices = newGeometry.vertices;

    self.postMessage({
      action: 'build',
      id: self._id,
      mapChunkIndex: mapChunkIndex,
      distanceIndex: currentGeometryDistanceIndex,
      xVertices: xVertices,
      zVertices: zVertices,
      xOffset: xOffset,
      zOffset: zOffset,
      vertices: vertices
    }/*,[vertices]*/);
  }
};

function  _getHeightMapArrayPosition (widthPosition, depthPosition, heightMapWidth) {
  return ( depthPosition * heightMapWidth + widthPosition );
}