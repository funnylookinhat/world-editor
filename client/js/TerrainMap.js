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

THREE.TerrainMap.prototype._initGeometry = function (callback) {
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

THREE.TerrainMap.prototype.width = function() {
	return this._width;
}

THREE.TerrainMap.prototype.depth = function() {
	return this._depth;
}