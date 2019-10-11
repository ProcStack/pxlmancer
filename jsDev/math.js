function launchFullscreen(element) {
	if(element.requestFullscreen) {
		element.requestFullscreen();
	}else if(element.mozRequestFullScreen) {
		element.mozRequestFullScreen();
	}else if(element.webkitRequestFullscreen) {
		element.webkitRequestFullscreen();
	}else if(element.msRequestFullscreen) {
		element.msRequestFullscreen();
	}
}

function undoOption(mode){
	var canvas, draw;
	if(mode==1){
		undoToCanvas=curCanvas;
		undoToLayer=curLayer;
		if(currentOnly==1){
			movePast(curCanvas,"pastDraw",1,"source-over",0);
			canvas=document.getElementById("pastDraw");
			draw=canvas.getContext("2d");
		}else{
			canvas=document.getElementById(undoToCanvas);
			draw=canvas.getContext("2d");
		}
	}else{
		canvas=document.getElementById(undoToCanvas);
		draw=canvas.getContext("2d");
	}
	var cur=draw.getImageData(0,0,sW,sH);
	var undoCan=document.getElementById("undoDraw");
	var undoDraw=undoCan.getContext("2d");
	if(mode==0){ // Grab undo
		undo=undoDraw.getImageData(0,0,sW,sH);
		draw.putImageData(undo,0,0);
		undoDraw.putImageData(cur,0,0);
	}else{ // Push to undo
		undoDraw.putImageData(cur,0,0);
	}
	//Update thumbnail
	updateLayerCanvas(undoToLayer);
	if(tileUpdate==1){
		updateTiles();
	}
}

function pushCanvas(inCanvas,outCanvas){
	var cW=$("#"+inCanvas).width();
	var cH=$("#"+inCanvas).height();
	var canvas=document.getElementById(inCanvas);
	var draw=canvas.getContext("2d");
	var cur=draw.getImageData(0,0,cW,cH);
	var pushCan=document.getElementById(outCanvas);
	var pushDraw=pushCan.getContext("2d");
	pushDraw.putImageData(cur,0,0);
}

function clearScreen(canvasID) {
	var canvas=document.getElementById(canvasID);
	var draw=canvas.getContext("2d");
	var cW=$("#"+canvasID).width();
	var cH=$("#"+canvasID).height();
	draw.clearRect(0,0,cW,cH);
	canvas.width=1;
	canvas.width=cW;
}
function resetRefresh(mode){
	var cW=$("#"+curCanvas).width();
	var cH=$("#"+curCanvas).height();
	if(mode==1){
		refreshWindowStore=refreshWindow;
		refreshWindow=[cW,cH,0,0];
	}else if(mode==2){
		refreshWindowTool=refreshWindow;
	}else{
		refreshWindow=[cW,cH,0,0];
	}
}
function movePast(drawCanvas,pastCanvas,alphaMult,comp,maskCheck){
	var canvas=document.getElementById(drawCanvas);
	var pastCan=document.getElementById(pastCanvas);
	var pastDraw=pastCan.getContext("2d");
	if(maskCheck==1 && $("#"+curLayer).attr('mask')==1){
		var canvasDraw=canvas.getContext("2d");
		canvasDraw.globalCompositeOperation="destination-in";
		canvasDraw.drawImage(pastCan,0,0);
	}
	if(selectToolVis==1){
		var maskCan=document.getElementById('selectMaskCanvas');
		var canvasDraw=canvas.getContext("2d");
		canvasDraw.globalCompositeOperation="destination-in";
		canvasDraw.drawImage(maskCan,0,0);
	}
	pastDraw.globalAlpha = alphaMult;
	//if(comp != 'source-over'){
	pastDraw.globalCompositeOperation=comp;
	//}
	pastDraw.drawImage(canvas,0,0);
}
function mergeCanvas(toCanvas, fromCanvas, mode, alpha){ //I NEED TO IMPLIMENT A METHOD FOR NON COLOR BLEND METHODS ... ugh
	var draw;
	var current;
	var pastCan;
	var pastDraw;
	var past;
	var pix;
	var pastPix;
	var mather;
	if( mode == 0 || mode == 1 ){
		canvas=document.getElementById(toCanvas);
		draw=canvas.getContext("2d");
		current=draw.getImageData(0,0,sW,sH);
		pastCan=document.getElementById(fromCanvas);
		pastDraw=pastCan.getContext("2d");
		past=pastDraw.getImageData(0,0,sW,sH);
		pix = current.data;
		pastPix = past.data;

		
		for (var i=0; i<pix.length; i+=4) {
			if(alpha!=1){
				pastPix[i+3]*=alpha;
			}
			if(pastPix[i+3]>0 || pix[i+3]>0){
				if(pastPix[i+3]==255){
					pix[i]=pastPix[i];
					pix[i+1]=pastPix[i+1];
					pix[i+2]=pastPix[i+2];
					pix[i+3]=pastPix[i+3];
				}else{
					if(pix[i+3]>0 && pastPix[i+3]>0){
						mather=pastPix[i+3]/255;
						pix[i]=(pastPix[i]-pix[i])*mather+(pix[i]);
						pix[i+1]=(pastPix[i+1]-pix[i+1])*mather+(pix[i+1]);
						pix[i+2]=(pastPix[i+2]-pix[i+2])*mather+(pix[i+2]);
						pix[i+3]=Math.min(255,Math.max(0,pix[i+3]+pastPix[i+3]));
					}else if(pix[i+3]==0 && pastPix[i+3]>0){
						pix[i]=pastPix[i];
						pix[i+1]=pastPix[i+1];
						pix[i+2]=pastPix[i+2];
						pix[i+3]=pastPix[i+3];
					}else if(pix[i+3]>0 && pastPix[i+3]==0){
						pix[i]=pix[i];
						pix[i+1]=pix[i+1];
						pix[i+2]=pix[i+2];
						pix[i+3]=pix[i+3];
					}
				}
			}
		}
	}
	if( mode == 0 ){
		draw.putImageData(current,0,0);
		//pastDraw.putImageData(past,0,0);
	}
	if( mode == 1 ){
		var save=document.getElementById('saveCanvas');
		var drawSave=save.getContext("2d");
		drawSave.putImageData(current,0,0);
		//drawSave.putImageData(past,0,0);
	}
	if( mode == 2 ){
		canvas=document.getElementById(toCanvas);
		draw=canvas.getContext("2d");
		try{
			current=draw.getImageData(0,0,refreshWindowStore[2]-refreshWindowStore[0],refreshWindowStore[3]-refreshWindowStore[1]);
		}catch(err){
			current=draw.getImageData(0,0,sW,sH);
		}
		pastCan=document.getElementById(fromCanvas);
		pastDraw=pastCan.getContext("2d");
		past=pastDraw.getImageData(0,0,sW,sH);
		//past=pastDraw.getImageData(refreshWindowStore[0],refreshWindowStore[1],refreshWindowStore[2],refreshWindowStore[3]);
		pix = current.data;
		pastPix = past.data;
		var px,py, wd;
		for (var i=0; i<pix.length; i+=4){
				wd=(refreshWindowStore[2]-refreshWindowStore[0]);
				px=((i/4)%wd) + refreshWindowStore[0];
				py=Math.floor((i/4)/wd) + refreshWindowStore[1];
				px=(py*sW+px)*4;
				pix[i]=(pastPix[px]);
				pix[i+1]=(pastPix[px+1]);
				pix[i+2]=(pastPix[px+2]);
				pix[i+3]=(pastPix[px+3]);
		}
		draw.putImageData(current,0,0);
	}
}
function trailOptions(){
	trailPos=dragPos;
}

function hund(val){
	return Math.floor(val*100)/100;
}
function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(Math.min(255, Math.max(0,Math.round(r)))) + componentToHex(Math.min(255, Math.max(0,Math.round(g)))) + componentToHex(Math.min(255, Math.max(0,Math.round(b))));
}

function toHSV(RGB){
	var H,S,V;
	var r=RGB[0];
	var g=RGB[1];
	var b=RGB[2];
	var minv=Math.min(r,g,b);
	var maxv=Math.max(r,g,b);
	V=maxv;
	var d=Math.max(1,maxv-minv);
	if(maxv != 0){
		S=d/maxv;
	}else{
		S=0;
		H=-1;
		return [H,S,V];
	}
	if(r == maxv){
		H=(g-b)/d;
	}else if(g == maxv){
		H=2+(b-r)/d;
	}else{
		H=4+(r-g)/d;
	}
	H *= 60;
	if(H < 0){
		H += 360;
	}
	return [H,S,V];
}

function toRGB(HSV){
	var R,G,B;
	var H=HSV[0];
	var S=HSV[1];
	var V=HSV[2];
	if(S == 0){
		R=G=B=V;
		return [R,G,B];
	}
	H/=60;
	var i=Math.floor(H);
	var f=H-i;
	var p=V*(1-S);
	var q=V*(1-S*f);
	var t=V*(1-S*(1-f));
	if(i == 0){
		R=V;
		G=t;
		B=p;
	}else if(i == 1){
		R=q;
		G=V;
		B=p;
	}else if(i == 2){
		R=p;
		G=V;
		B=t;
	}else if(i == 3){
		R=q;
		G=p;
		B=V;
	}else if(i == 4){
		R=t;
		G=p;
		B=V;
	}else{
		R=V;
		G=p;
		B=q;
	}
	return [R,G,B];
}

function getColor(seed){
	var R,G,B,A,rand;
	if($("#cs_red_val").val()==-1){
		R=((Math.sin(seed/4.5+clickCount))*50+225);
		G=((Math.sin(seed/6+clickCount))*50)+100;
		B=((Math.sin(seed/8+500+clickCount)*.5+.5)*30)+30;
	}else if($("#cs_red_val").val()==-2){
		R=((Math.sin(seed/7+clickCount)*.5+.5)*40+50);
		G=((Math.sin(seed/4.5+clickCount))*50)+225;
		B=((Math.sin(seed/6+500+clickCount)*.5+.5)*50)+90;
	}else if($("#cs_red_val").val()==-3){
		R=((Math.sin(seed/8+clickCount)*.5+.5)*60+10);
		G=((Math.sin(seed/6+clickCount))*60)+120;
		B=((Math.sin(seed/4.5+500+clickCount))*55)+220;
	}else{
		R=parseInt($("#cs_red_val").val());
		G=parseInt($("#cs_green_val").val());
		B=parseInt($("#cs_blue_val").val());
	}
	rand=parseFloat($("#cs_random_val").val());
	R+=Math.sin(clickCount+rand+seed/7+Math.sin(clickCount/5.5+rand+seed/6.5+25))*rand;
	G+=Math.sin(clickCount+rand+seed/5.5-Math.sin(clickCount/7.6+rand+seed/4.2+124))*rand;
	B+=Math.sin(clickCount+rand+seed/6.3+Math.cos(clickCount/5.5+rand+seed/7.8)+3523)*rand;
	R=Math.min(255,Math.max(0,Math.floor(R)));
	G=Math.min(255,Math.max(0,Math.floor(G)));
	B=Math.min(255,Math.max(0,Math.floor(B)));
	A=$("#be"+diaVal+"_effectPercent_val").val();
	return [R,G,B,A];
}
function sampleCanvas(canvas,mPos){
	var pos=$("#"+canvas).offset();
	var canH=$("#"+canvas).height();
	var canW=$("#"+canvas).width();
	var sampleX,sampleY;
	if(mPos[0]==-1){
		sampleX=mouseX;
		sampleY=mouseY;
		sampleX=sampleX-pos.left;
		sampleY=Math.max(0,sampleY-pos.top-1);
	}else{
		sampleX=mPos[0];
		sampleY=mPos[1];
	}
	var activeCanvas=document.getElementById(canvas);
	var canCtx=activeCanvas.getContext("2d");
	var draw=canCtx.getImageData(0,0,canW,canH);
	var drawPix = draw.data;
	
	var pixel=(sampleY*canW+sampleX)*4;
	if(drawPix[pixel+3] > 0){
		var value=[];
		value[0]=drawPix[pixel];
		value[1]=drawPix[pixel+1];
		value[2]=drawPix[pixel+2];
		value[3]=drawPix[pixel+3];
		return value;
	}else{
		return [-1,-1,-1,-1];
	}
}

function drawGeo(loc,eCount,size,color,alpha,filled,flip,canvas,comp){
	var x=loc[0];
	var y=loc[1];
	var R=color[0];
	var G=color[1];
	var B=color[2];
	hex=rgbToHex(Math.floor(R),Math.floor(G),Math.floor(B) );
	var csW=$("#"+canvas).width();
	var csH=$("#"+canvas).height();
	
	if(comp==1 && 0){
		var tempCanvas=document.createElement("canvas");
		tempCanvas.width=csW;
		tempCanvas.height=csH;
		var draw=tempCanvas.getContext('2d');
		var curCanvas=document.getElementById(canvas);
		var canvasDraw=curCanvas.getContext("2d");
	}else{
		docCanvas=document.getElementById(canvas);
		draw=docCanvas.getContext('2d');
	}
	var runCount=1;
	var flippers=[1,1];
	if(flip>0){
		if(flip==1){
			runCount=2;
			flippers=[1,1, -1,1];
		}else if(flip==2){
			runCount=2;
			flippers=[1,1, 1,-1];
		}else if(flip==4){
			runCount=2;
			flippers=[1,1, -1,-1];
		}else if(flip==3){
			runCount=4;
			flippers=[1,1, -1,1, 1,-1, -1,-1];
		}
	}
	draw.globalAlpha=alpha;
	for(var c=0;c<runCount;c+=1){
		draw.beginPath();
		draw.lineWidth=Math.max(1,filled);
		if(filled==-1){
			draw.fillStyle=hex;
		}else{
			draw.strokeStyle=hex;
		}
		if(eCount<=2){
			if(eCount==1){
				var grad=draw.createRadialGradient((x-sW/2)*flippers[c*2]+sW/2,(y-sH/2)*flippers[c*2+1]+sH/2,1,(x-sW/2)*flippers[c*2]+sW/2,(y-sH/2)*flippers[c*2+1]+sH/2,size/2);
				grad.addColorStop(0,'rgba('+Math.floor(color[0])+','+Math.floor(color[1])+','+Math.floor(color[2])+',1)');
				if(color.length>4){
					grad.addColorStop(1,'rgba('+Math.floor(color[3])+','+Math.floor(color[4])+','+Math.floor(color[5])+',0)');
				}else{
					grad.addColorStop(1,'rgba('+Math.floor(color[0])+','+Math.floor(color[1])+','+Math.floor(color[2])+',0)');
				}
				draw.fillStyle=grad;
			}else if(eCount==2){
				var grad=draw.createRadialGradient((x-sW/2)*flippers[c*2]+sW/2,(y-sH/2)*flippers[c*2+1]+sH/2,1,(x-sW/2)*flippers[c*2]+sW/2,(y-sH/2)*flippers[c*2+1]+sH/2,size/2);
				grad.addColorStop(0,'rgba('+Math.floor(color[0])+','+Math.floor(color[1])+','+Math.floor(color[2])+',0)');
				if(color.length>4){
					grad.addColorStop(1,'rgba('+Math.floor(color[3])+','+Math.floor(color[4])+','+Math.floor(color[5])+',1)');
				}else{
					grad.addColorStop(1,'rgba('+Math.floor(color[0])+','+Math.floor(color[1])+','+Math.floor(color[2])+',1)');
				}
				draw.fillStyle=grad;
			}
			draw.arc((x-sW/2)*flippers[c*2]+sW/2,(y-sH/2)*flippers[c*2+1]+sH/2,size/2,0,Math.PI*2);
		}else{
			if(loc.length>2){
				if(eCount==3){
					draw.moveTo((x-sW/2)*flippers[c*2]+sW/2,(y-sH/2)*flippers[c*2+1]+sH/2);
					//draw.moveTo(x,y);
					for(var v=2; v<loc.length; v+=2){
						draw.lineTo((loc[v]-sW/2)*flippers[c*2]+sW/2,(loc[v+1]-sH/2)*flippers[c*2+1]+sH/2);
					}
					draw.lineJoin = 'round';
					if(size==1 && filled!=-1){
						draw.closePath();
					}else{
						draw.lineJoin = 'miter';
					}
				}else{
					draw.lineJoin = 'round';
					draw.moveTo((x-sW/2)*flippers[c*2]+sW/2,(y-sH/2)*flippers[c*2+1]+sH/2);
					for(var v=2; v<loc.length; v+=4){
						draw.quadraticCurveTo((loc[v]-sW/2)*flippers[c*2]+sW/2,(loc[v+1]-sH/2)*flippers[c*2+1]+sH/2, (loc[v+2]-sW/2)*flippers[c*2]+sW/2,(loc[v+3]-sH/2)*flippers[c*2+1]+sH/2);
					}
					if(size==1){
						draw.quadraticCurveTo((loc[loc.length-2]-sW/2)*flippers[c*2]+sW/2,(loc[loc.length-1]-sH/2)*flippers[c*2+1]+sH/2, (loc[0]-sW/2)*flippers[c*2]+sW/2,(loc[1]-sH/2)*flippers[c*2+1]+sH/2);
					}
					/*
					draw.moveTo(x,y);
					for(var v=2; v<loc.length; v+=4){
						draw.quadraticCurveTo(loc[v],loc[v+1], loc[v+2],loc[v+3]);
					}
					if(size==1){
						draw.quadraticCurveTo(loc[loc.length-2],loc[loc.length-1], loc[0],loc[1]);
					}*/
					if(size==1 && filled!=-1){
						draw.closePath();
					}else{
						draw.lineJoin = 'miter';
					}
				}
			}
		}
		if(comp==1){
			/*if($("#"+curLayer).attr('mask')==1){
				canvasDraw.globalCompositeOperation="destination-in";
				tempCanvas.drawImage(,0,0);
				draw.clearRect(0,0,csW,csH);
				draw.drawImage(canvasDraw,0,0);
			}*/
			draw.globalCompositeOperation=compMethod;
		}
		if(filled==-1){
			draw.fill();
		}else{
			draw.stroke();
		}
		/*if(comp==1){
			canvasDraw.drawImage(tempCanvas,0,0);
			tempCanvas='';
			canvasDraw='';
		}*/
	}
}

function drawLine(points,width,color,alpha,arcType,canvas,dash){
	var hex,docCanvas,draw;
	var R=color[0];
	var G=color[1];
	var B=color[2];	
	hex=rgbToHex(Math.floor(R),Math.floor(G),Math.floor(B) );
	if(typeof(canvas)==="string"){
		docCanvas=document.getElementById(canvas);
		draw=docCanvas.getContext('2d');
	}else{
		draw=canvas;
	}
	
	
	draw.beginPath();
	if(dash[0]!=-1){
		draw.globalAlpha=alpha/2;
	}
	draw.strokeStyle=hex;
	draw.lineWidth=width;
	draw.moveTo(points[0],points[1]);
	for(var x=2; x<(points.length); x+=2){
		draw.lineTo(points[x],points[x+1]);
	}
	if(arcType==0){
		arcType='round';
	}else if(arcType==1){
		arcType='miter';
	}else if(arcType==2){
		arcType='bevel';
	}else{
		arcType='round';
	}
	draw.lineJoin = arcType;
	draw.lineCap = arcType;
	draw.stroke();
	if(dash[0]!=-1){
		
		draw.globalAlpha=alpha;
		draw.setLineDash(dash);
		draw.stroke();
	}
}

function drawGuide(canvas, minMax, color, dash){
	drawRefresh=[minMax[0],minMax[1], minMax[0],minMax[3], minMax[2],minMax[3], minMax[2],minMax[1], minMax[0],minMax[1]];
	drawLine(drawRefresh,2,color,.55,1,canvas,dash);
}

function drawRect(canvas, minMax){
		docCanvas=document.getElementById(canvas);
		draw=docCanvas.getContext('2d');
		
		var color=getColor(dragTotal);
		R=color[0];
		G=color[1];
		B=color[2];
		A=color[3];
		hex=rgbToHex(Math.floor(R),Math.floor(G),Math.floor(B) );
		color=getColor(dragTotal+1);
		toHex=rgbToHex(Math.floor(color[0]),Math.floor(color[1]),Math.floor(color[2]) );
		
		draw.globalAlpha=A;
		draw.fillStyle=hex;
		draw.fillRect(minMax[0],minMax[1], (minMax[2]-minMax[0]),(minMax[3]-minMax[1]));
	
}
function setCanvasToColor(canvas,hex){
	var cW=$("#"+canvas).width();
	var cH=$("#"+canvas).height();
	var controls=document.getElementById(canvas);
	var draw=controls.getContext('2d');
	draw.beginPath();
	draw.rect(0,0,cW,cH);
	draw.fillStyle=hex;
	draw.fill();
}
// A method of drawing lines I thought would be fun, but haven't thought of since 2015
// Draw arcs around the points when the mouse is sampled
// Creating exact arcs between points, rather than quadratic arcs between points
function circleCenter(A, B, C) {
	var yDa = B[2] - A[2];
	var xDa = B[1] - A[1];
	var yDb = C[2] - B[2];
	var xDb = C[1] - B[1];
	var center = [0,0];
	var aSlope = yDa/xDa;
	var bSlope = yDb/xDb;
	center[1] = (aSlope*bSlope*(A[2] - C[2]) + bSlope*(A[1] + B[1]) - aSlope*(B[1]+C[1]) )/(2* (bSlope-aSlope) );
	center[2] = -1*(center[1] - (A[1]+B[1])/2)/aSlope + (A[2]+B[2])/2;
	return center;
}
// Created to make smoother arcs with the Mimic Mouse without needing to load jquery UI
// Which is another roughly 100k, size I didn't feel was needed to load
// Not like this site is cheap to load anyway... But this affords me better blending through custom math
function findQCurve(p1,p2,p3){
	var a, b, c;
	var math1=new Array();
	var math2=new Array();
	var math3=new Array();
	//Find a,b,c in -> y=ax^2+bx+c
	//Math1 & Math 2 Array entries -> [0]=y  [1]=a  [2]=b
	//Math3 Array entries -> [0]=y  [1]=a
	//-----------------------------------------
	//Remove c for math1, y=ax^2+b
	math1[0]=p1[1]-p2[1]; // Y
	math1[1]=(p1[0]*p1[0])-(p2[0]*p2[0]); // a
	math1[2]=(p1[0])-(p2[0]); // b
	//Remove c for math2,  y=ax^2+b
	math2[0]=p2[1]-p3[1]; // Y
	math2[1]=(p2[0]*p2[0])-(p3[0]*p3[0]); // a
	math2[2]=(p2[0])-(p3[0]); // b
	//Remove b from equation,  y=ax^2
	math3[0]=(math1[0]*math2[2])+(math2[0]*(-math1[2])) // Y
	math3[1]=(math1[1]*math2[2])+(math2[1]*(-math1[2])) // a
	a=math3[0]/math3[1];
	b=(math1[0]-a)/math1[1];
	c=p1[1]-(a*(p1[0]*p1[0])+b);
	return [a,b,c]
}
function findQPoint(x,a,b,c){
	return (a*(x*x)+b*x+c);
}

function waitFor(run,func){
	if(run==0){	
		holdForRunning=0;
		holdForDiv='';
	}
	if(holdForElementCheck==0 || run<5){
		run+=1;
		setTimeout(function(){waitFor(run,func);},50);
	}else{
		if(run>=5){
			eval(func);
		}
	}
}

function cmdDoubleClick(div,length,func,run){ // Double click event
	var attrVal=$("#"+div).attr('doubleClick');
	if(typeof attrVal === typeof undefined){ // Check if div has doubleClick attr, add if not
		attrVal=0;
		$("#"+div).attr('doubleClick',0);
	}else{
		attrVal=parseInt(attrVal);
	}
	if(run==0 && attrVal == 0){	// Set double click to 1 in first pass
		holdForElementCheck=1;
		holdForDiv='';
		$("#"+div).attr('doubleClick',1);
	}else{ // If double click has been activated previously, kill function loop, run command
		if(attrVal==1){
			holdForElementCheck=0;
		}
	}
	if(run<length && holdForElementCheck==1){
		run+=1;
		setTimeout(function(){cmdDoubleClick(div,length,func,run);},30);
	}else{
		if($("#"+div).length){
			$("#"+div).attr('doubleClick',0); // Reset double click
		}
		if(holdForElementCheck==0 && run==1){ // This will only run on the second click, not the first click loop
			eval(func);
		}
	}
}	

function pushToCanvas(from,to){
	var lW=$("#"+to).width();
	var lH=$("#"+to).height();
	try{
		var canvas=document.getElementById(from);
		var pushCan=document.getElementById(to);
		var pushDraw=pushCan.getContext("2d");
		pushDraw.clearRect(0,0,lW,lH);
		pushDraw.drawImage(canvas,0,0,lW,lH);
	}catch(err){
		var tmpName=tempWindow('Site error - No canvas "'+from+'" or "'+to+'" found.',[-1,-1],'',15,1,0,0);
	}
}

function toCanvasSpace(mX,mY){
	var curPercX=mX/sW;
	var curPercY=mY/sH;
	var usX=sW*(curScale);
	var usY=sH*(curScale);
	var sPosX=(curPercX*(sW*curScale)-$('#documentLayers').position().left*((curScale)))/(curScale);
	var sPosY=(curPercY*(sH*curScale)-$('#documentLayers').position().top*((curScale)))/(curScale);
	mX=((sPosX/usX)*sW);
	mY=((sPosY/usY)*sH);
	return [mX,mY];
}
function toScreenSpace(mX,mY){
	var curPercX=mX/sW;
	var curPercY=mY/sH;
	var usX=sW*(curScale);
	var usY=sH*(curScale);
	var sPosX=(curPercX*(sW*curScale)-$('#documentLayers').position().left*((curScale)))/(curScale);
	var sPosY=(curPercY*(sH*curScale)-$('#documentLayers').position().top*((curScale)))/(curScale);
	mX=((sPosX/usX)*sW);
	mY=((sPosY/usY)*sH);
	return [mX,mY];
}

function printArray(add,array){
	var printer=add+" - [";
	for(var x=0; x<array.length;++x){
		var origx=$("#geoDrawSpline_"+x).attr("origX");
		var origy=$("#geoDrawSpline_"+x).attr("origY");
		if(!isNaN(origx)){
			origx=parseInt(parseFloat(origx)*100)/100;
			origy=parseInt(parseFloat(origy)*100)/100;
			printer+=origx+", ";
			printer+=origy;
			if(x!=array.length-1){
				printer+=", ";
			}
		}
	}
	printer+="]";
	console.log(printer);
}