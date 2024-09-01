function Camera(mainCanvas,  svg)
{
	var canvas = mainCanvas;
	var graphics = new Graphics(canvas, svg);
	var canvasW = mainCanvas.width;
	var canvasH = mainCanvas.height;

	var view_target = new Vector(0,0,0);
	var view_distance = 10;
	var view_anglePhi = 0;
	var view_angleTheta = 0;
	var FOV = 90;
	var aspect = canvasW / canvasH;
	var near = 0.1;
	var far = 1000;

	var viewMtx = new Array(4);
	var projMtx = new Array(4);

	canvas.addEventListener('mousemove', onMouseMove, false);
	canvas.addEventListener('mousedown', onMouseDown, false);
	canvas.addEventListener('mouseup', onMouseUp, false);
	canvas.addEventListener('dblclick', onMouseDblClick, false);
	canvas.addEventListener('keydown', onKeyDown, false);
	canvas.addEventListener('keyup', onKeyUp, false);
	canvas.onwheel = onMouseWheel;
	canvas.oncontextmenu = onContextMenu;

	this.onResize = function()
	{
		canvasW = canvas.width;
		canvasH = canvas.height;
		aspect = canvasW / canvasH;

		canvas.width = canvas.width;
		canvas.height = canvas.height;

		updateProjection();

		graphics.onResize();
	}

	function updateProjection()
	{
		var cosX = Math.cos(view_angleTheta * Math.PI / 180);
		var sinX = Math.sin(view_angleTheta * Math.PI / 180);
		var cosY = Math.cos(view_anglePhi * Math.PI / 180);
		var sinY = Math.sin(view_anglePhi * Math.PI / 180);

		var x = new Vector(	        cosY,        0,       -sinY);
		var y = new Vector( -sinY * sinX,	  cosX,	 -cosY*sinX);
		var z = new Vector(  sinY * cosX,     sinX,   cosY*cosX);

		var view_position = mad(z, -view_distance, view_target);

		viewMtx[0] = [ x.x, x.y, x.z, -dot(view_position, x) ];
		viewMtx[1] = [ y.x, y.y, y.z, -dot(view_position, y) ];
		viewMtx[2] = [ z.x, z.y, z.z, -dot(view_position, z) ];

		var yScale = 1 / Math.tan(FOV * Math.PI / 180 * 0.5);
		var xScale = yScale / aspect;
		var F = far;
		var N = near;

		projMtx[0] = [ xScale, 0, 0, 0 ];
		projMtx[1] = [ 0, yScale, 0, 0 ];
		projMtx[2] = [ 0, 0, F / (F-N),	-F*N / (F-N) ];
		projMtx[3] = [ 0, 0, 1, 0 ];
	}

	function transformP(v)
	{
		var v4 = [v.x, v.y, v.z, 1];
		var viewPos = [ dot4(v4, viewMtx[0]), dot4(v4, viewMtx[1]), dot4(v4, viewMtx[2]), 1 ];

		var projPos = [ dot4(viewPos, projMtx[0]), dot4(viewPos, projMtx[1]), dot4(viewPos, projMtx[2]), dot4(viewPos, projMtx[3]) ];

		projPos[0] /= projPos[3];
		projPos[1] /= projPos[3];
		projPos[2] /= projPos[3];

		var screenPos = [ (projPos[0] * 0.5 + 0.5) * canvasW, (-projPos[1] * 0.5 + 0.5) * canvasH, projPos[2], projPos[3] ];

		return screenPos;
	}
	
	this.clear = function(color)
	{
		graphics.clear(color);
	}

	this.drawTarget = function()
	{
		var p = transformP(view_target);
		var s = 2;

		var points = [	[ p[0] - s, p[1] - s, 1, view_distance ],
						[ p[0] + s, p[1] - s, 1, view_distance ],
						[ p[0] + s, p[1] + s, 1, view_distance ],
						[ p[0] - s, p[1] + s, 1, view_distance ] ];

		return graphics.drawLineStrip(points, true, "#000000", 1);
	}

	this.drawLine = function(a,b,color,width,dash,ownerObject)
	{
		return graphics.drawLine(transformP(a), transformP(b), color, width, dash);
	}

	this.drawLineStrip = function(points, closed, color, width, fillColor, dash)
	{
		var pixelPoints = [];

		for (var i = 0; i < points.length; ++i)
		{
			pixelPoints.push(transformP(points[i]));
		}

		return graphics.drawLineStrip(pixelPoints, closed, color, width, dash, fillColor);
	}

	this.drawLines = function(points, color, width, fillColor, dash)
	{
		var pixelPoints = [];

		for (var i = 0; i < points.length; ++i)
		{
			pixelPoints.push(transformP(points[i]));
		}

		return graphics.drawLines(pixelPoints, color, width, dash, fillColor);
	}

	this.drawQuad = function(p, sizeX, sizeY, xAxis, yAxis, color, fillColor, width, dash)
	{
		var points = new Array(4);

		points[0] = mad(xAxis, -sizeX * 0.5, mad(yAxis, +sizeY * 0.5, p));
		points[1] = mad(xAxis, +sizeX * 0.5, mad(yAxis, +sizeY * 0.5, p));
		points[2] = mad(xAxis, +sizeX * 0.5, mad(yAxis, -sizeY * 0.5, p));
		points[3] = mad(xAxis, -sizeX * 0.5, mad(yAxis, -sizeY * 0.5, p));

		return this.drawLineStrip(points, true, color, width, fillColor, dash);
	}

	this.drawCircle = function(p, radius, xAxis, yAxis, color, width, fillColor, segments, dash)
	{
		if (typeof(segments) === "undefined")
			segments = 64;

		var points = new Array(segments);

		for (var i = 0; i < segments; ++i)
		{
			var angle = (i/segments) * Math.PI * 2;
			var cosAngle = Math.cos(angle);
			var sinAngle = Math.sin(angle);
			points[i] = mad(xAxis, cosAngle * radius, mad(yAxis, sinAngle, p));
		}

		return this.drawLineStrip(points, true, color, width, dash, fillColor);
	}

	this.drawCapsule = function(p, halfLength, radius, longAxis, shortAxis, color, width, fillColor, segments, dash)
	{
		if (typeof(segments) === "undefined")
			segments = 32;

		segments *= 2;

		var points = new Array(segments);

		for (var i = 0; i < segments; ++i)
		{
			var angle = Math.PI / 2 + (i/segments) * Math.PI * 2;
			var cosAngle = Math.cos(angle);
			var sinAngle = Math.sin(angle);
			var offset = (i>=segments/2) ? halfLength : -halfLength;
			points[i] = mad(longAxis, offset, mad(longAxis, cosAngle * radius, mad(shortAxis, sinAngle * radius, p)));
		}

		return this.drawLineStrip(points, true, color, width, fillColor, dash);
	}

	this.drawFrustum = function(o, fov, aspect, near, far, xAxis, yAxis, zAxis, color, width, fillColor, dash)
	{
		var p = new Array(8);

		var tanY = Math.tan(fov * 0.5 * Math.PI / 180);
		var tanX = tanY / aspect;

		p[0] = mad(xAxis, -tanX * near, mad(yAxis, +tanY * near, mad(zAxis, near, o)));
		p[1] = mad(xAxis, +tanX * near, mad(yAxis, +tanY * near, mad(zAxis, near, o)));
		p[2] = mad(xAxis, +tanX * near, mad(yAxis, -tanY * near, mad(zAxis, near, o)));
		p[3] = mad(xAxis, -tanX * near, mad(yAxis, -tanY * near, mad(zAxis, near, o)));

		p[4] = mad(xAxis, -tanX * far, mad(yAxis, +tanY * far, mad(zAxis, far, o)));
		p[5] = mad(xAxis, +tanX * far, mad(yAxis, +tanY * far, mad(zAxis, far, o)));
		p[6] = mad(xAxis, +tanX * far, mad(yAxis, -tanY * far, mad(zAxis, far, o)));
		p[7] = mad(xAxis, -tanX * far, mad(yAxis, -tanY * far, mad(zAxis, far, o)));

		this.drawLineStrip([p[0], p[1], p[2], p[3]] , true, color, width, fillColor, dash);
		this.drawLineStrip([p[7], p[6], p[5], p[4]] , true, color, width, fillColor, dash);
		this.drawLineStrip([p[0], p[4], p[5], p[1]] , true, color, width, fillColor, dash);
		this.drawLineStrip([p[1], p[5], p[6], p[2]] , true, color, width, fillColor, dash);
		this.drawLineStrip([p[2], p[6], p[7], p[3]] , true, color, width, fillColor, dash);
		this.drawLineStrip([p[0], p[3], p[7], p[4]] , true, color, width, fillColor, dash);
	}

	this.drawArrow = function(pStart, pEnd, sizeInPixels, color, width, dash)
	{
		return graphics.drawArrow(transformP(pStart), transformP(pEnd), sizeInPixels, color, width, dash);
	}

	this.drawText = function(O,text,color,align, angle, font)
	{
		return graphics.drawText(transformP(O),text,color,align,angle,font);
	}

	this.getMousePos = function(evt)
	{
	//	var p = getMousePosPixels(evt, canvas);

	//	return invTransformP(p);
	}

	var mousePosDragStart;
	var angleThetaDragStart;
	var anglePhiDragStart;
	var viewTargetDragStart;
	var viewDistanceDragStart;
	var rotateSensitivity = 20;
	var wheelSensitivity = 300;
	var zoomSensitivity = 300;

	function onMouseMove(evt)
	{
		if (evt.buttons & 1) // rotate
		{
			var deltaX = evt.clientX - mousePosDragStart.x;
			var deltaY = evt.clientY - mousePosDragStart.y;

			var deltaAngleX = deltaX * Math.PI / 180 * rotateSensitivity;
			var deltaAngleY = -deltaY * Math.PI / 180 * rotateSensitivity;

			view_angleTheta = angleThetaDragStart + deltaAngleY;
			view_anglePhi = anglePhiDragStart + deltaAngleX;

			updateProjection();
		}
		else if (evt.buttons & 4) // pan
		{
			var deltaX = -(evt.clientX - mousePosDragStart.x) / (canvasW / 2) * view_distance / projMtx[0][0];
			var deltaY = (evt.clientY - mousePosDragStart.y) / (canvasH / 2) * view_distance / projMtx[1][1];

			var x = new Vector(viewMtx[0][0], viewMtx[0][1], viewMtx[0][2] );
			var y = new Vector(viewMtx[1][0], viewMtx[1][1], viewMtx[1][2] );
			var z = new Vector(viewMtx[2][0], viewMtx[2][1], viewMtx[2][2] );

			view_target = mad(x, deltaX, mad(y, deltaY, viewTargetDragStart));

			updateProjection();
		}
		else if (evt.buttons & 2) // zoom
		{
			var deltaX = (evt.clientX - mousePosDragStart.x) / zoomSensitivity;
			var deltaY = (evt.clientY - mousePosDragStart.y) / zoomSensitivity;

			var delta = Math.max(deltaX, deltaY);

			view_distance = viewDistanceDragStart * (1 - deltaX);
			view_distance = Math.max(0.1, view_distance);
			updateProjection();
		}
	}

	function onMouseDown(evt)
	{
		mousePosDragStart		= new Vector( evt.clientX, evt.clientY, 0 );
		angleThetaDragStart		= view_angleTheta;
		anglePhiDragStart		= view_anglePhi;
		viewTargetDragStart		= view_target.copy();
		viewDistanceDragStart	= view_distance;
	}

	function onMouseUp(evt)
	{}

	function onMouseDblClick(evt)
	{
		view_target = new Vector(0,0,0);
		updateProjection();
	}

	function onKeyDown(evt)
	{}

	function onKeyUp(evt)
	{}

	function onMouseWheel(evt)
	{
		view_distance *= 1 - evt.wheelDelta / wheelSensitivity;
		view_distance = Math.max(0.1, view_distance);
		updateProjection();
	}
	function onContextMenu(evt)
	{
		return false;
	}

	this.getCanvas			= function() { return canvas;	}
	this.getGraphics		= function() { return graphics;	}
}
