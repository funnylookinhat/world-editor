/**
 * TODO - Generalize and publish ...
 */

var EditorCameraControls = function (parameters) {
  if( typeof parameters == "undefined" ) {
    throw "No parameters provided.";
  }
  if( typeof parameters.camera == "undefined" ) {
    throw "No camera provided.";
  }

  this.camera = parameters.camera;

  this.focus = {
    x: 0,
    y: 0,
    z: 0
  };

  if( typeof parameters.focus != "undefined" ) {
    if( typeof parameters.focus.x != "undefined" &&
        typeof parameters.focus.y != "undefined" &&
        typeof parameters.focus.z != "undefined" ) {
      this.focus.x = parameters.focus.x;
      this.focus.y = parameters.focus.y;
      this.focus.z = parameters.focus.z;
    }
  }

  this.radius = 1.00;
  this.maxRadius = null;
  this.minRadius = 1.00;
  if( typeof parameters.radius != "undefined" ) {
    this.radius = parseFloat(parameters.radius);
  }
  if( typeof parameters.minRadius != "undefined" ) {
    this.minRadius = parseFloat(parameters.minRadius);
  }
  if( typeof parameters.maxRadius != "undefined" ) {
    this.maxRadius = parseFloat(parameters.maxRadius);
  }
  
  this.theta = 0.00;
  this.minTheta = null;
  this.maxTheta = null;
  if( typeof parameters.theta != "undefined" ) {
    this.theta = parseFloat(parameters.theta);
  }
  if( typeof parameters.minTheta != "undefined" ) {
    this.minTheta = parseFloat(parameters.minTheta);
  }
  if( typeof parameters.maxTheta != "undefined" ) {
    this.maxTheta = parseFloat(parameters.maxTheta);
  }
  
  this.phi = 0.00;
  this.minPhi = null;
  this.maxPhi = null;
  if( typeof parameters.phi != "undefined" ) {
    this.phi = parseFloat(parameters.phi);
  }
  if( typeof parameters.minPhi != "undefined" ) {
    this.minPhi = parseFloat(parameters.minPhi);
  }
  if( typeof parameters.maxPhi != "undefined" ) {
    this.maxPhi = parseFloat(parameters.maxPhi);
  }

  this.dragActive = false;
  this.dragPrevious = {
    x: 0,
    y: 0
  };

  this._bindWindowEvents();

}

EditorCameraControls.prototype._updateRadius = function (delta) {
  this.radius += delta;
  if( this.radius < this.minRadius ) {
    this.radius = this.minRadius;
  }
  else if( this.maxRadius != null && 
           this.radius > this.maxRadius ) {
    this.radius = this.maxRadius;
  }
}

EditorCameraControls.prototype._updateAngle = function (dTheta, dPhi) {
  this.theta += ( dTheta * 0.01 );
  this.phi -= ( dPhi * 0.01 );
  if( this.minTheta != null &&
      this.theta < this.minTheta ) {
    this.theta = this.minTheta;
  }
  else if( this.maxTheta != null &&
           this.theta > this.maxTheta ) {
    this.theta = this.maxTheta;
  }
  if( this.minPhi != null &&
      this.phi < this.minPhi ) {
    this.phi = this.minPhi;
  }
  else if( this.maxPhi != null &&
           this.phi > this.maxPhi ) {
    this.phi = this.maxPhi;
  }
}

EditorCameraControls.prototype._startDrag = function (x, y) {
  this.dragActive = true;
  this.dragPrevious.x = x;
  this.dragPrevious.y = y;
}

EditorCameraControls.prototype._stopDrag = function () {
  this.dragActive = false;
}

EditorCameraControls.prototype._processDrag = function (x, y) {
  if( this.dragActive ) {
    this._updateAngle(
      x - this.dragPrevious.x,
      y - this.dragPrevious.y
    );
    this.dragPrevious.x = x;
    this.dragPrevious.y = y;
  }
}

EditorCameraControls.prototype._bindWindowEvents = function () {
  var thisRef = this;

  $(window).bind('mousewheel', function (e, delta, deltaX, deltaY) {
    thisRef._updateRadius((delta * -10));
  })
  .bind('mousedown', function (e) {
    thisRef._startDrag(e.pageX, e.pageY);
  })
  .bind('mouseup', function (e) {
    thisRef._stopDrag();
  })
  .bind('mousemove', function (e) {
    thisRef._processDrag(e.pageX, e.pageY);
  });

}

EditorCameraControls.prototype.startPath = function () {

}

EditorCameraControls.prototype.stopPath = function () {
  
}

EditorCameraControls.prototype.updateCamera = function () {
  this.camera.position.x =
    this.focus.x + 
    this.radius * Math.sin( this.phi ) * Math.cos( this.theta );
  this.camera.position.z =
    this.focus.z + 
    this.radius * Math.sin( this.phi ) * Math.sin( this.theta );
  this.camera.position.y = 
    this.focus.y + 
    this.radius * Math.cos( this.phi );

  this.camera.lookAt(this.focus);
}
