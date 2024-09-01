function Vector(x,y,z)
{
  this.x = x || 0;
  this.y = y || 0;
  this.z = z || 0;
}

Vector.prototype.copy = function()
{
	return new Vector(this.x, this.y, this.z);
}

Vector.prototype.neg = function() 
{
	return new Vector(-this.x, -this.y, -this.z);
}

Vector.prototype.unit = function() 
{
	var L = Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z);
	return new Vector(this.x/L, this.y/L, this.z/L);
}

Vector.prototype.norm = function() 
{
	var L = Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z);
	return new Vector(this.x/L, this.y/L, this.z/L);
}

Vector.prototype.length = function() 
{
	return Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z);
}

Vector.prototype.lengthSqr = function() 
{
	return (this.x*this.x + this.y*this.y + this.z*this.z);
}

function add(a,b) 
{
	if (typeof(a) === "object")
	{
		if (typeof(b) === "object")
		{
			return new Vector(a.x + b.x, a.y + b.y, a.z + b.z);
		}
		else
		{
			return new Vector(a.x + b, a.y + b, a.z + b);
		}
	}
	else
	{
		if (typeof(b) === "object")
		{
			return new Vector(a + b.x, a + b.y, a + b.z);
		}
		else
		{
			return (a + b);
		}
	}
}

function addv()
{
	if (arguments.length==0)
		return 0;
	else if (arguments.length==1)
		return arguments[0];

	var result = arguments[0];

	for (var i=1; i!=arguments.length; ++i)
	{
		result = add(result, arguments[i]);
	}

	return result;
}

function sub(a,b) 
{
	if (typeof(a) === "object")
	{
		if (typeof(b) === "object")
		{
			return new Vector(a.x - b.x, a.y - b.y, a.z - b.z);
		}
		else
		{
			return new Vector(a.x - b, a.y - b, a.z - b);
		}
	}
	else
	{
		if (typeof(b) === "object")
		{
			return new Vector(a - b.x, a - b.y, a - b.z);
		}
		else
		{
			return (a - b);
		}
	}
}

function mul(a,b) 
{
	if (typeof(a) === "object")
	{
		if (typeof(b) === "object")
		{
			return new Vector(a.x * b.x, a.y * b.y, a.z * b.z);
		}
		else
		{
			return new Vector(a.x * b, a.y * b, a.z * b);
		}
	}
	else
	{
		if (typeof(b) === "object")
		{
			return new Vector(a * b.x, a * b.y, a * b.z);
		}
		else
		{
			return (a * b);
		}
	}
}

function div(a,b) 
{
	if (typeof(a) === "object")
	{
		if (typeof(b) === "object")
		{
			return new Vector(a.x / b.x, a.y / b.y, a.z / b.z);
		}
		else
		{
			return new Vector(a.x / b, a.y / b, a.z / b);
		}
	}
	else
	{
		if (typeof(b) === "object")
		{
			return new Vector(a / b.x, a / b.y, a / b.z);
		}
		else
		{
			return (a / b);
		}
	}
}

function dot(a,b) 
{
	if ( !(typeof(a) === "object") || !(typeof(b) === "object") )
		return;

	return (a.x * b.x + a.y * b.y + a.z * b.z);
}

function dot4(a,b) 
{
	return (a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3]);
}

function cross(a,b)
{
	if ( !(typeof(a) === "object") || !(typeof(b) === "object") )
		return;

	return	new Vector(	a.y * b.z - a.z * b.y,
						a.z * b.x - a.x * b.z,
						a.x * b.y - a.y * b.x );
}

function min(a,b) 
{
	if (typeof(a) === "object")
	{
		if (typeof(b) === "object")
		{
			return new Vector(Math.min(a.x, b.x), Math.min(a.y, b.y), Math.min(a.z, b.z));
		}
		else
		{
			return new Vector(Math.min(a.x, b), Math.min(a.y, b), Math.min(a.z, b));
		}
	}
	else
	{
		if (typeof(b) === "object")
		{
			return new Vector(Math.min(a, b.x), Math.min(a, b.y), Math.min(a, b.z));
		}
		else
		{
			return Math.min(a, b);
		}
	}
}

function max(a, b)
{
	if (typeof(a) === "object")
	{
		if (typeof(b) === "object")
		{
			return new Vector(Math.max(a.x, b.x), Math.max(a.y, b.y), Math.max(a.z, b.z));
		}
		else
		{
			return new Vector(Math.max(a.x, b), Math.max(a.y, b), Math.max(a.z, b));
		}
	}
	else
	{
		if (typeof(b) === "object")
		{
			return new Vector(Math.max(a, b.x), Math.max(a, b.y), Math.max(a, b.z));
		}
		else
		{
			return Math.max(a, b);
		}
	}
}

function clamp(v, lower, upper)
{
	return min(max(v, lower), upper);
}

function saturate(v)
{
	return min(max(v, 0), 1);
}

function avg(a, b)
{
	if ( !(typeof(a) === "object") || !(typeof(b) === "object") )
		return;

	return mul(add(a,b), 0.5);
}

function quantize(v, q)
{
	return mul(floor(div(v, q)), q);
}

function distance(a, b)
{
	if ( !(typeof(a) === "object") || !(typeof(b) === "object") )
		return;

	return sub(a,b).length();
}

function distanceSqr(a, b)
{
	if ( !(typeof(a) === "object") || !(typeof(b) === "object") )
		return;

	return sub(a,b).lengthSqr();
}

function equal(a, b)
{
	if (typeof(a) === "object")
	{
		if (typeof(b) === "object")
		{
			return (a.x == b.x) && (a.y == b.y) && (a.z == b.z);
		}
		else
		{
			return (a.x == b) && (a.y == b) && (a.z == b);
		}
	}
	else
	{
		if (typeof(b) === "object")
		{
			return (a == b.x) && (a == b.y) && (a == b.z);
		}
		else
		{
			return (a == b);
		}
	}

	return false;
}

function length(v)
{
	if ( !(typeof(v) === "object") )
		return;

	return Math.sqrt(dot(v,v));
}

function lengthSqr(v)
{
	if ( !(typeof(v) === "object") )
		return;

	return dot(v,v);
}

function normalize(v)
{
	if ( !(typeof(v) === "object") )
		return;

	return div(v, length(v));
}

function reflect(v,n)
{
	if ( !(typeof(v) === "object") || !(typeof(n) === "object") )
		return;
	
	n = normalize(n);
	
	return sub(v, mul(n, dot(v,n) * 2));
}

function mad(v, s, b)
{
	return add(mul(v,s),b);
}

function lerp(a, b, t)
{
	return mad(sub(b,a), t, a);
}

function floor(v)
{
	if ( !(typeof(v) === "object") )
		return;

	return new Vector(Math.floor(v.x), Math.floor(v.y), Math.floor(v.z));
}

function ceil(v)
{
	if ( !(typeof(v) === "object") )
		return;

	return new Vector(Math.ceil(v.x), Math.ceil(v.y), Math.ceil(v.z));
}

function round(v)
{
	if ( !(typeof(v) === "object") )
		return;

	return new Vector(Math.round(v.x), Math.round(v.y), Math.round(v.z));
}

function abs(v)
{
	if ( !(typeof(v) === "object") )
		return Math.abs(v);

	return new Vector(Math.abs(v.x), Math.abs(v.y), Math.abs(v.z));
}

function lineClosestPoint(point, pointA, pointB)
{
	var lineV = sub(pointB, pointA);
	var lineLength = length(lineV);
	var lineDir = div(lineV, lineLength);

	var AP = sub(point, pointA);

	var projLength = dot(AP, lineDir);

	projLength = Math.max(0, Math.min(lineLength, projLength));

	return mad(projLength, lineDir, pointA);
}

function intersectRayLine(rayStart, rayDir, pointA, pointB, rayRadius)
{
	if (rayRadius == undefined || rayRadius<0)
		rayRadius = 0;

	var lineV = sub(pointB, pointA);
	var lineLength = length(lineV);
	var lineDir = div(lineV, lineLength);
	var lineNorm = transpose(lineDir).neg();
	
	var result = {N:lineNorm, P:rayStart, hit:false, tRay:0, tLine:0};
		
	var height = dot(sub(rayStart, pointA), lineNorm) - rayRadius;
	
	var tRay = height / (-dot(rayDir, lineNorm));

	// don't allow impacts behind the ray start...but make some allowance for rays with a radius 
	// (this helps with resting bouncing balls)
	if ( tRay<-rayRadius)
		return result;

	var I = add(rayStart, mul(rayDir, tRay));
	
	if (rayRadius>0)
	{
		I = add(I, mul(lineNorm, -rayRadius));
	}

	var tLine = dot(sub(I, pointA), lineDir) / lineLength;
	
	if ( (tLine>1) || (tLine<0) )
		return result;
	
	result.hit = true;
	result.tLine = tLine;
	result.tRay = tRay;
	result.P = I;
	
	return result;
}

function intersectRayRay(rayStart, rayDir, otherRayStart, otherRayDir)
{
	var lineNorm = transpose(otherRayDir).neg();
	
	var result = {N:lineNorm, P:rayStart, hit:false, tRay:0, tLine:0};
		
	L = dot( sub(rayStart, otherRayStart), lineNorm);
	
	var tRay = L / (-dot(rayDir, lineNorm));

	if ( tRay<0 )
		return result;

	var I = add(rayStart, mul(rayDir, tRay));
	
	var tLine = dot(sub(I, otherRayStart), otherRayDir);
	
	result.hit = true;
	result.tLine = tLine;
	result.tRay = tRay;
	result.P = I;
	
	return result;
}

var pseudoRandom = {};

(function()
{
	pseudoRandom.seed = 0;

	pseudoRandom.setSeed = function(seed)
	{
		pseudoRandom.seed = seed;
	}

	pseudoRandom.random = function(seed)
	{
		if (seed !== undefined)
		{
			pseudoRandom.seed = seed;
		}

		var x = Math.sin(pseudoRandom.seed++) * 10000;
		return x - Math.floor(x);
	}

})();