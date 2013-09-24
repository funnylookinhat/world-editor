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

// Image Stuff
var cvs = document.createElement('canvas');
var ctx = cvs.getContext('2d');

var mapData = [];
var mapWidth = 0;
var mapHeight = 0;

var heightImage = new Image;

function imageLoaded(image) {
	console.log('TYPE: '+typeof image);
	cvs.width = image.width;
	cvs.height = image.height;
	ctx.drawImage( image, 0, 0);
	var heightDataW = image.width;
	var heightDataH = image.height;
	var heightData = ctx.getImageData(0,0,heightDataW,heightDataH);
	var heightDataRGBA = heightData.data;

	// Loop Pixels
	var pixelLength = heightDataW * heightDataH * 4;
	var r, g, b, a;
	var min = false;
	var max = false;
	var total = 0;
	console.log(heightDataRGBA.length+' =?= '+pixelLength);
	for( var pixel = 0; pixel < pixelLength; pixel += 4 ) {
		r = heightDataRGBA[ pixel + 0 ];
		g = heightDataRGBA[ pixel + 1 ];
		b = heightDataRGBA[ pixel + 2 ];
		a = heightDataRGBA[ pixel + 3 ];
		mapData.push(
			r +
			g +
			b + 
			a
		);
		if( min == false ||
			min > mapData[mapData.length - 1] ) {
			min = mapData[mapData.length - 1];
		}
		if( max == false ||
			max < mapData[mapData.length - 1] ) {
			max = mapData[mapData.length - 1];
		}
		total += mapData[mapData.length - 1];
	}

	var average = total / ( heightDataW * heightDataH );

	// Normalize
	for( i in mapData ) {
		mapData[i] = mapData[i] - average;
	}

	console.log("Min Value: "+min);
	console.log("Max Value: "+max);
	console.log("Avg Value: "+average);

	mapWidth = heightDataW;
	mapHeight = heightDataH;

	init();
}

//heightImage.onload = imageLoaded(heightImage);
/*(function() {
	imageLoaded(heightImage);
});*/


heightImage.onload = function() {
	cvs.width = heightImage.width;
	cvs.height = heightImage.height;
	ctx.drawImage( heightImage, 0, 0);
	var heightDataW = heightImage.width;
	var heightDataH = heightImage.height;
	var heightData = ctx.getImageData(0,0,heightDataW,heightDataH);
	var heightDataRGBA = heightData.data;

	// Loop Pixels
	var pixelLength = heightDataW * heightDataH * 4;
	var r, g, b, a;
	var min = false;
	var max = false;
	var total = 0;
	console.log(heightDataRGBA.length+' =?= '+pixelLength);
	for( var pixel = 0; pixel < pixelLength; pixel += 4 ) {
		r = heightDataRGBA[ pixel + 0 ];
		g = heightDataRGBA[ pixel + 1 ];
		b = heightDataRGBA[ pixel + 2 ];
		a = heightDataRGBA[ pixel + 3 ];
		mapData.push(
			r +
			g +
			b + 
			a
		);
		if( min == false ||
			min > mapData[mapData.length - 1] ) {
			min = mapData[mapData.length - 1];
		}
		if( max == false ||
			max < mapData[mapData.length - 1] ) {
			max = mapData[mapData.length - 1];
		}
		total += mapData[mapData.length - 1];
	}

	var average = total / ( heightDataW * heightDataH );

	// Normalize
	for( i in mapData ) {
		mapData[i] = mapData[i] - average;
	}

	console.log("Min Value: "+min);
	console.log("Max Value: "+max);
	console.log("Avg Value: "+average);
	console.log("Dimensions: "+heightDataW+'x'+heightDataH);

	mapWidth = heightDataW;
	mapHeight = heightDataH;

	init();
}


var cameraDelta = -1;

function render() {
	camera.position.x += cameraDelta;
	camera.position.z += cameraDelta;
	camera.position.y += ( cameraDelta / 10 );
	if( camera.position.x < ( -1 * mapWidth ) ) {
		cameraDelta = 1;
	} else if ( camera.position.x > ( mapWidth ) ) {
		cameraDelta = -1;
	}
	renderer.render(scene, camera);
}

function init() {
	var mapGeometry = new THREE.PlaneGeometry(
		mapWidth,
		mapHeight,
		mapWidth - 1,
		mapHeight - 1
	);
	// Flatten
	mapGeometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );

	for( var i = 0; i < mapGeometry.vertices.length; i++ ) {
		mapGeometry.vertices[i].y = mapData[i] / 10;
	}
	
	var mapMaterial = new THREE.MeshBasicMaterial({
		color: 0x000000,
		wireframe: true
	});

	var uniforms = {
		heightmap: { type: "t", value: THREE.ImageUtils.loadTexture('/storage/height-test-small.png') },
		textureRepeat: {
			type: 'f',
			value: 1
		}
	};
	
	var terrainMaterial = new THREE.ShaderMaterial({
		uniforms: uniforms,
		vertexShader: document.getElementById( 'testVertexShader' ).textContent,
		fragmentShader: document.getElementById( 'testFragmentShader' ).textContent
	});

	// Wireframe
	var mapMesh = new THREE.Mesh(mapGeometry,mapMaterial);
	// Shader
	// var mapMesh = new THREE.Mesh(mapGeometry,terrainMaterial);

	mapMesh.position.set(0,0,0);
	
	scene.add(mapMesh);

	camera.position.set(Math.floor(mapWidth * 2),Math.floor(mapWidth * .2)+Math.floor(mapHeight * .2),Math.floor(mapHeight * 2));
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

// Start the process.
heightImage.src = "/storage/height-test-small.png";