function Graphics(canvas_, svg)
{
	var canvas = canvas_;
	var canvasW = canvas.width;
	var canvasH = canvas.height;
	var canvasAspect = canvasW / canvasH;
	var context = (svg==true) ? new C2S(canvasW, canvasH) : canvas_.getContext('2d');

	this.getContext = function()
	{
		return context;
	}

	this.onResize = function()
	{
		context = canvas.getContext('2d');
		canvasW = canvas.width;
		canvasH = canvas.height;
		canvasAspect = canvasW / canvasH;
	}

	//function clipLine(a,b)
	//{
	//	if (a[3] > b[3])
	//		return clipLine(b,a);

	//	if (b[2] <= 0)
	//		return [];

	//	if (a[2] >= 1)
	//		return [];

	//	if (a[2] >= 0 && b[2] <= 1)
	//		return [a,b];

	//	var vA = new Vector(a);
	//	var vB = new Vector(b);
	//	var delta = sub(vB, vA);

	//	var zA = a[3];
	//	var zB = b[3];
	//	var deltaZ = zB - zA;
	//	var p0;
	//	var p1;

	//	if (zA<0)		p0 = mad(delta, -zA/deltaZ, vA);
	//	else			p0 = vA;

	//	if (zB>1)		p1 = mad(delta, (1-zA)/deltaZ, vA);
	//	else			p1 = vB;
		
	//	return [ [p0.x, p0.y, p0.z, 0], [p1.x, p1.y, p1.z, 1] ];
	//}

	this.drawLine = function(a,b,color,width,dash)
	{
		if (typeof(color) === "undefined")
			color = "#000000";

		if (typeof(width) === "undefined")
			width = 1;

		if (typeof(dash) === "undefined")
			dash = [];

		context.lineWidth = width;
		context.strokeStyle = color;
		context.setLineDash(dash);

		context.beginPath();
		context.moveTo(a[0],a[1]);
		context.lineTo(b[0],b[1]);

		if (width > 0)
		{
			context.stroke();
		}
	}
	
	this.drawLineStrip = function(points, closed, color, width, dash, fillColor)
	{
		if (points.length < 2)
			return;

		if (typeof(color) === "undefined")
			color = "#000000";

		if (typeof(width) === "undefined")
			width = 1;

		if (typeof(dash) === "undefined")
			dash = [];

		context.lineWidth = width;
		context.strokeStyle = color;
		context.setLineDash(dash);

		context.beginPath();
		context.moveTo(points[0][0], points[0][1]);

		for (var i = 1; i != points.length; ++i)
		{
			context.lineTo(points[i][0], points[i][1]);
		}

		if (closed)
		{
			context.lineTo(points[0][0], points[0][1]);
		}

		if (fillColor !== undefined)
		{
			context.fillStyle = fillColor;
			context.fill();
		}

		if (width > 0)
		{
			context.stroke();
		}
	}

	this.drawLines = function(points, color, width, dash, fillColor)
	{
		if (points.length < 2)
			return;

		if (typeof(color) === "undefined")
			color = "#000000";

		if (typeof(width) === "undefined")
			width = 1;

		if (typeof(dash) === "undefined")
			dash = [];

		context.lineWidth = width;
		context.strokeStyle = color;
		context.setLineDash(dash);

		context.beginPath();

		for (var i = 0; i < points.length-1; i+=2)
		{
			context.moveTo(points[i][0], points[i][1]);
			context.lineTo(points[i+1][0], points[i+1][1]);
		}

		if (fillColor !== undefined)
		{
			context.fillStyle = fillColor;
			context.fill();
		}

		if (width > 0)
		{
			context.stroke();
		}
	}

	function drawArrow(pStart,pEnd,sizeInPixels, color,width,dash)
	{
		if (typeof(color) === "undefined")
			color = "#000000";

		if (typeof(dash) === "undefined")
			dash = [];

		if (typeof(width) === "undefined")
			width = 1;

		if (sizeInPixels == undefined)
			sizeInPixels = 20;

		var length = sub(pEnd, pStart).length();
		V = sub(pEnd, pStart).unit();

		var B = add(pStart, mul(V, length-sizeInPixels-width/2));
		var E = add(pStart, mul(V,length));
		var T = transpose(V);
		var P0 = add(B, mul(T, 5*sizeInPixels/20 + width/2));
		var P1 = add(B, mul(T, -5*sizeInPixels/20 - width/2));

		context.lineWidth = width;
		context.strokeStyle = color;
		context.fillStyle = color;
		context.setLineDash(dash);

		// Line
		context.beginPath();
		context.moveTo(pStart[0], pStart[1]);
		context.lineTo(B[0], B[1]);
		context.stroke();

		// Arrow head
		context.beginPath();
		context.lineWidth = 1;
		context.setLineDash([]);
		context.moveTo(E[0], E[1]);
		context.lineTo(P0[0], P0[1]);
		context.lineTo(P1[0], P1[1]);
		context.lineTo(E[0], E[1]);
		context.stroke();
		context.fill();
	}

	function drawText(O,text,color,align,angle,font)
	{
		if (typeof(color) === "undefined")
			color = "#000000";

		if (typeof(align) === "undefined")
			align = "center";

		if (font === undefined)
			font = "bold 16px Arial";


		context.translate(O[0], O[1]);

		if (angle !== undefined)
		{
			context.rotate(-angle);// * Math.PI / 180);
		}

		context.font = font;
		context.textAlign = align;
		context.fillStyle = color;

		context.fillText(text, 0, 0);

		if (angle !== undefined)
		{
			context.rotate(angle);// * Math.PI / 180);
		}

		context.translate(-O[0], -O[1]);
	}
		
	this.clear = function(color)
	{
		if (color == undefined)
		{
			color = "rgba(255,255,255,1)";
		}

		context.clearRect(0,0,canvasW,canvasH);
		context.fillStyle = color;
		context.fillRect(0,0,canvasW,canvasH);
	}
	
	this.measureText = function(text, font)
	{
		if (font == undefined)
		{
			font = "16px 'Open Sans'";
		}

		context.font = font;

		var p = { 
					x: context.measureText(text).width,
					y: context.measureText("M").width
				}
		
		return p;
	}
}
