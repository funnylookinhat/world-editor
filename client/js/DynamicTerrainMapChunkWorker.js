/**
 * Creates the geometry for a DynamicTerrainMapChunk
 */

importScripts('includes/three.min.js');

/* self.addEventListener('message', */
self.onmessage = function (e) {
  var data = e.data;
  var currentGeometryDistanceIndex = data.currentGeometryDistanceIndex;
  var width = data.width;
  var depth = data.depth;
  var heightMap = data.heightMap;
  var heightMapWidth = data.heightMapWidth;
  var heightMapWidthZero = data.heightMapWidthZero;
  var heightMapDepthZero = data.heightMapDepthZero;

  var xVertices = Math.floor( width / Math.pow(4,currentGeometryDistanceIndex) );
  var zVertices = Math.floor( depth / Math.pow(4,currentGeometryDistanceIndex) );

  var newGeometry = new THREE.PlaneGeometry(
    width,
    depth,
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
    z = z * ( depth / Math.floor( depth / Math.pow(4,currentGeometryDistanceIndex) ) );
    x = x * ( width / Math.floor( width / Math.pow(4,currentGeometryDistanceIndex) ) );
    newGeometry.vertices[i].y = heightMap[_getHeightMapArrayPosition(heightMapWidthZero + x, heightMapDepthZero + z, heightMapWidth)];
  }

  self.postMessage({geometry: newGeometry});
};//, false);

function  _getHeightMapArrayPosition (widthPosition, depthPosition, heightMapWidth) {
  return ( depthPosition * heightMapWidth + widthPosition );
}