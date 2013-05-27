/**
 * THREE.Playground
 */

THREE.Playground = function (parameters) {
	this._SCREEN_WIDTH = window.innerWidth;
	this._SCREEN_HEIGHT = window.innerHeight;

	// Add CSS First
	var css = [];
	css.push('* {');
	css.push('-moz-box-sizing: border-box;');
	css.push('-webkit-box-sizing: border-box;');
	css.push('box-sizing: border-box;');
	css.push('outline: none;');
	css.push('font-family: "Arial";');
	css.push('}');
	css.push('html, body {');
	css.push('width: 100%;');
	css.push('height: 100%;');
	css.push('margin: 0px;');
	css.push('padding: 0px;');
	css.push('background: #414141;');
	css.push('}');
	css.push('canvas {');
	css.push('z-index: 1;');
	css.push('}');

	this._style = document.body.createElement('style');
	this._style.textContent = css.join("\n");
	document.body.appendChild(this._style);

	if( parameters.canvas ) {
		this._canvas = parameters.canvas;
	} else {
		this._canvas = document.body.createElement('canvas');
		document.body.appendChild(this._canvas);
	}

	this._renderer = new THREE.WebGLRenderer(this._canvas);
	this._renderer.setSize(this._SCREEN_WIDTH, this._SCREEN_HEIGHT);
	this._renderer.setClearColor( ( parameters.clearColor ? parameters.clearColor : 0xefefef ) );

	this._scene = new THREE.Scene();

	this._camera = new THREE.PerspectiveCamera( 
		45, 
		this._SCREEN_WIDTH / this._SCREEN_HEIGHT, 
		1, 
		( parameters.cameraDistance ? parameters.cameraDistance : 5000 ) 
	);

	window.addEventListener('resize', this._windowResize, false );
}

THREE.Playground.prototype._windowResize = function () {
	this._SCREEN_WIDTH = window.innerWidth;
	this._SCREEN_HEIGHT = window.innerHeight;

	this._camera.aspect = this._SCREEN_WIDTH / this._SCREEN_HEIGHT;
	this._camera.updateProjectionMatrix();

	this._renderer.setSize( this._SCREEN_WIDTH, this._SCREEN_HEIGHT);
}

THREE.Playground.prototype.render = fucnction () {
	this._renderer.render(this._scene, this._camera);
}

THREE.Playground.prototype.renderer = function () {
	return this._renderer;
}

THREE.Playground.prototype.scene = function () {
	return this._scene;
}

THREE.Playground.prototype.camera = function () {
	return this._camera;
}