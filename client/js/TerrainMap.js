/**
 * TerrainMap.js
 * Port / Learning Opportunity from insominx - Michael Guerrero
 * Source: http://realitymeltdown.com/WebGL/js/TerrainGeometry.js
 */

// Constructor
THREE.TerrainMap = function (parameters) {
	if( typeof parameters == "undefined" ) {
		parameters = {};
	}
	this._width = parameters.width ? parameters.width : 1000;	// X
	this._depth = parameters.depth ? parameters.depth : 1000;	// Z
	this._widthVertices = parameters.widthVertices ? parameters.widthVertices : this._width;
	this._depthVertices = parameters.depthVertices ? parameters.depthVertices : this._depth;

	this._geometry = null;
	this._heightMap = null;
}

/**
 * About this._heightMap
 * A Float32Array representing the terrain height for each vertex.
 * Updating should cascade a change into BufferGeometry.
 * Index = x + z * this._width
 */

// Statics
THREE.TerrainMap.staticValue = null;

// Initialize ( only called once )

// Initializes a blank ( flat ) terrain.
THREE.TerrainMap.prototype.initFlat = function (callback) {
	if( this._heightMap != null ) {
		throw "TerrainMap can only be initialized once.";
	}

	/*
	this._heightMapBuffer = new ArrayBuffer(this._width * this._depth * 4);
	this._heightMap = new Float32Array(this._heightMapBuffer);
	*/
	this._heightMap = new Float32Array(this._width * this._depth);
	this._heightMapLength = this._width * this._depth;

	for( var i = 0; i < this._heightMapLength; i++ ) {
		this._heightMap[i] = 0.00;
	}

	this._initGeometry(callback);
}

/**
 * Initialize with an RGBA image.
 * imageSource = URL of RGBA image.
 * TODO - RGBA MAP
 */
THREE.TerrainMap.prototype.initWithImage = function (imageSource, rgbaMap, callback) {
	if( this._geometry != null ) {
		throw "BufferGeometry can only be initialized once.";
	}
	if( typeof imageSource == "undefined" ) {
		throw "Invalid image source provided.";
	}
	if( typeof rgbaMap == "undefined" ) {
		rgbaMap = [1,1,1,1];
	}
	
	var heightMapImage = new Image;
	var _this = this;

	heightMapImage.onload = (function() {
		_this._onImageLoad(heightMapImage, rgbaMap, callback);
	});
	
	heightMapImage.src = imageSource;
}

THREE.TerrainMap.prototype._onImageLoad = function (image, rgbaMap, callback) {
	if( this._heightMap != null ) {
		throw "TerrainMap can only be initialized once.";
	}
	this._width = image.width;
	this._depth = image.height;
	this._widthVertices = this._width;
	this._depthVertices = this._depth;

	/*
	this._heightMapBuffer = new ArrayBuffer(this._width * this._depth * 2);
	this._heightMap = new Float32Array(this._heightMapBuffer);
	*/
	this._heightMap = new Float32Array(this._width * this._depth);
	this._heightMapLength = this._width * this._depth;

	// Get our image data in RGBA Array.
	var imageDataCanvas = document.createElement('canvas');
	imageDataCanvas.width = this._width;
	imageDataCanvas.height = this._depth;
	var imageDataContext = imageDataCanvas.getContext('2d');
	imageDataContext.drawImage(image, 0, 0);
	var imageData = imageDataContext.getImageData(0, 0, this._width, this._depth);

	this._parseImageData(imageData.data, rgbaMap, callback);
}

THREE.TerrainMap.prototype._parseImageData = function (imageData, rgbaMap, callback) {
	var r,g,b,a;
	for( var i = 0; i < imageData.length; i += 4 ) {
		r = imageData[ i + 0 ];
		g = imageData[ i + 1 ];
		b = imageData[ i + 2 ];
		a = imageData[ i + 3 ];
		this._heightMap[ i / 4 ] = 
			r * rgbaMap[0] +
			g * rgbaMap[1] +
			b * rgbaMap[2] +
			a * rgbaMap[3];
	}

	this._initGeometry(callback);
}

THREE.TerrainMap.prototype._initPlaneGeometry = function (callback) {
	if( this._geometry != null ) {
		throw "BufferGeometry can only be initialized once.";
	}

	if( this._heightMap == null ) {
		throw "Cannot be initialized without a heightmap.";
	}

	// TODO!
	console.log("Generating PlaneGeometry: "+this._width+'x'+this._depth+' with vertices '+this._widthVertices+'x'+this._depthVertices);
	console.log("Total height points: "+this._heightMap.length);

	// For Testing
	this._geometry = new THREE.PlaneGeometry(
		this._width,
		this._depth,
		this._widthVertices - 1,
		this._depthVertices - 1
	);
	this._geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );

	// Apply this._heightMap
	for( var i = 0; i < this._geometry.vertices.length; i++ ) {
		this._geometry.vertices[i].y = this._heightMap[i];
	}

	callback();

}

THREE.TerrainMap.prototype._initGeometry = function (callback) {

	var numberOfVerts = this._widthVertices * this._depthVertices;

	// 2 tris per grid rectangle
	var triangles = ( this._widthVertices - 1 ) * ( this._depthVertices - 1 ) * 2;

	this._geometry = new THREE.BufferGeometry();
	// SLOW SLOW SLOW
	//this._geometry.dynamic = true;
	this._geometry.attributes = {
		index: {
			itemSize: 1,
			array: new Uint16Array(triangles * 3),
			numItems: triangles * 3
		},
		position: {
			itemSize: 3,
			array: new Float32Array(numberOfVerts * 3),
			numItems: numberOfVerts * 3
		},
		normal: {
			itemSize: 3,
			array: new Float32Array(numberOfVerts * 3),
			numItems: numberOfVerts * 3
		},
		uv: {
			itemSize: 2,
			array: new Float32Array(numberOfVerts * 2),
			numItems: numberOfVerts * 2
		}
	}

	// break geometry into
	// chunks of 21,845 triangles (3 unique vertices per triangle)
	// for indices to fit into 16 bit integer number
	// floor(2^16 / 3) = 21845
	// floor((65535 / 3)) = 21845

	var chunkSize = 21845;
	//chunkSize = 16;

	var indices = this._geometry.attributes.index.array;

	var positions = this._geometry.attributes.position.array;
	var normals = this._geometry.attributes.normal.array;
	var uvs = this._geometry.attributes.uv.array;
	var colors = this._geometry.attributes.color;

	var defaultColor = new THREE.Color(1.0, 0.0, 0.0);

	var startX = -this._width * 0.5;
	var startZ = -this._depth * 0.5;
	var tileX = this._width / (this._widthVertices - 1);
	var tileZ = this._depth / (this._depthVertices - 1);

	for (var i = 0; i < this._depthVertices; ++i) {
		for (var j = 0; j < this._widthVertices; ++j) {

			var index = (i * this._widthVertices + j) * 3;

			positions[index + 0] = startX + j * tileX;
			positions[index + 1] = this._heightMap[i * this._widthVertices + j ];
			//positions[index + 1] = filled in later from height map;
			positions[index + 2] = startZ + i * tileZ;

			var uvIndex = (i * this._widthVertices + j) * 2;
			uvs[uvIndex + 0] = j / (this._widthVertices - 1);
			uvs[uvIndex + 1] = 1.0 - i / (this._depthVertices - 1);

			//colors[index + 0] = colors[index + 1] = colors[index + 2] = 1.0;
		}
	}

	this._geometry.offsets = [];

	var lastChunkRow = 0;
	var lastChunkVertStart = 0;

	// For each rectangle, generate its indices
	for (var i = 0; i < ( this._depthVertices - 1 ); ++i) {

		var startVertIndex = i * this._widthVertices;

		// If we don't have space for another row, close
		// off the chunk and start the next
		if ((startVertIndex - lastChunkVertStart) + this._widthVertices * 2 > chunkSize) {

			var newChunk = {
				start: lastChunkRow * ( this._widthVertices - 1 ) * 6,
				index: lastChunkVertStart,
				count: (i - lastChunkRow) * ( this._widthVertices - 1 ) * 6
			};

			this._geometry.offsets.push(newChunk);

			lastChunkRow = i;
			lastChunkVertStart = startVertIndex;
		}


		for (var j = 0; j < ( this._widthVertices - 1 ); ++j) {

			var index = (i * ( this._widthVertices - 1 ) + j) * 6;
			var vertIndex = (i * this._widthVertices + j) - lastChunkVertStart;

			indices[index + 0] = vertIndex;
			indices[index + 1] = vertIndex + this._widthVertices;
			indices[index + 2] = vertIndex + 1;
			indices[index + 3] = vertIndex + 1;
			indices[index + 4] = vertIndex + this._widthVertices;
			indices[index + 5] = vertIndex + this._widthVertices + 1;
		}
	}

	var lastChunk = {
		start: lastChunkRow * ( this._widthVertices - 1 ) * 6,
		index: lastChunkVertStart,
		count: ( ( this._depthVertices - 1 ) - lastChunkRow) * ( this._widthVertices - 1 ) * 6
	};

	//this._geometry.offsets.push(lastChunk);
	this._geometry.computeBoundingSphere();

	callback();
}

THREE.TerrainMap.prototype.width = function () {
	return this._width;
}

THREE.TerrainMap.prototype.depth = function () {
	return this._depth;
}

THREE.TerrainMap.prototype.height = function (x,z) {
	if( x < 0 || x > this._width ||
		z < 0 || z > this._depth )
		return false;

	var x1 = x;
	var x2 = x;
	if( x != Math.floor(x) ) {
		x1 = Math.floor(x);
		x2 = Math.ceil(x);
	}
	var z1 = z;
	var z2 = z;
	if( z != Math.floor(z) ) {
		z1 = Math.floor(z);
		z2 = Math.ceil(z);
	}

	return (
		(
			this._heightMap[( x1 + z1 * this._width )] +
			this._heightMap[( x2 + z1 * this._width )] +
			this._heightMap[( x1 + z2	 * this._width )] +
			this._heightMap[( x2 + z2 * this._width )]
		) / 4
	);

	if( ! this._heightMap[( x + z * this._width )] ) {
		return false;
	}
	return this._heightMap[( x + z * this._width )];
}

THREE.TerrainMap.prototype.setHeight = function(x,z,y) {
	this._heightMap[x + z * this._widthVertices] = y;
	var positions = this._geometry.attributes.position.array;
	var index = ( x + z * this._widthVertices ) * 3;
	positions[index + 1] = this._heightMap[x + z * this._widthVertices];
}