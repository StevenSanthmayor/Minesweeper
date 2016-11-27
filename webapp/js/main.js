var iSize = 8,
    sDifficulty = "easy";


var Mine = {
    init : function(){
        this.jMine = $("#idMineField tbody");
        this.oMineMap = {};

        oDebug.log("Mine initialized");
    },
    createMineGrid : function(iMineSize,sDifficulty){
        this.iSize = iMineSize ? iMineSize : 6;
        var that = this,
            sRow ="";
        this.jMine.empty();
        for(var i=1; i<=this.iSize; i++){
            sRow = "<tr>";
            for(var j=1; j<=this.iSize; j++){
                this.oMineMap[j] = this.oMineMap[j] ?  this.oMineMap[j] : {};
                this.oMineMap[j][i] = this._generateRandom(sDifficulty)=="1" ? true : false;
                sRow += "<td id='gridCell"+j+""+i+"' data-pos-x='"+j+"' data-pos-y='"+i+"' >"+
                        (this.oMineMap[j][i]? "<img width='32px' src='img/mine.png' />" : "")+
                        "</td>";
            }
            sRow += "</tr>";
            this.jMine.append(sRow);
        }
        //Attach Click Handler
        this.jGridCells =$(this.jMine.find("td"));
        this.jGridCells.on("click",function(){
            var iX = parseInt($(this).attr("data-pos-x"),10),
                iY = parseInt($(this).attr("data-pos-y"),10);
            that._onGridClick(iX,iY);
        });
        oDebug.log("Grid Created","success");
    },
    _getNeighbourCells : function(x,y){
        return {
                "1" : { //Top-Left
                    "sPos":"TL",
                    "iX":(x-1),
                    "iY":(y-1),
                    "bExists" :((x-1)>=1)&&((y-1)>=1)? true : false
                },
                "2" : { //Top
                    "sPos":"T",
                    "iX":x,
                    "iY":(y-1),
                    "bExists" :(y-1)>=1? true : false
                },
                "3" : { //Top-Right
                    "sPos":"TR",
                    "iX":x+1,
                    "iY":y-1,
                    "bExists" :((x+1)<=this.iSize)&&(y-1)>=1? true : false
                },
                "4" : { //Left
                    "sPos":"L",
                    "iX":(x-1),
                    "iY":y,
                    "bExists" :(x-1)>=1? true : false
                },
                "5" : { //Right
                    "sPos":"R",
                    "iX":(x+1),
                    "iY":y,
                    "bExists" :((x+1)<=this.iSize)? true : false
                },
                "6" : { //Bottom-Left
                    "sPos":"BL",
                    "iX":(x-1),
                    "iY":(y+1),
                    "bExists" :((x-1)>=1)&&(y+1)<=this.iSize? true : false
                },
                "7" : { //Bottom
                    "sPos":"B",
                    "iX":x,
                    "iY":(y+1),
                    "bExists" :(y+1)<=this.iSize? true : false
                },
                "8" : { //Bottom-Right
                    "sPos":"BR",
                    "iX":(x+1),
                    "iY":(y+1),
                    "bExists" :((x+1)<=this.iSize)&&(y+1)<=this.iSize? true : false
                }
            };
    },
    getGridWeight : function(x,y){ //Need to improvise code, very crude logic
        /*
        * TL   T   TR
        * L   x,y  R
        * BL   B   BR
        */
        var oCells = this._getNeighbourCells(x,y);
        if(this.oMineMap[x][y]){
            oDebug.log("Mine Hit !!","error");
            return -1;
        }
        else{
            var iCount = 0;
            for(var i=1; i<=8; i++){
                if(oCells[i].bExists){
                    if(this.oMineMap[oCells[i].iX][oCells[i].iY]){
                        iCount++;
                    }
                }
            } 
            if(iCount==0){
                this._expandSelection(x,y);
            }   
            oDebug.log("Grid Calculated with weight "+iCount,"success");
            return iCount;
        }
    },
    _expandSelection : function(x,y){
        //Get all valid Neighbours, then tag them ?
        var oCells = this._getNeighbourCells(x,y);
            oValidatedCells = {};

        if(this.oMineMap[x][y]){ //Check for mine
            //Mine hit, do not go further
            return -1;
        }
        else{
            var iCount = 0;
            for(var i=1; i<=8; i++){ 
                if(oCells[i].bExists){
                    if(this.oMineMap[oCells[i].iX][oCells[i].iY]){
                        iCount++;
                    }
                }
            }
            //Expand neighbour cells, if empty(Chained reaction)
            if(iCount==0){
            $("#gridCell"+x+""+y).empty().addClass("openGrid").append("<p class='depress'></p>");
               for(var i=1; i<=8; i++){
                    if(oCells[i].bExists){
                        var iX = oCells[i].iX,
                            iY = oCells[i].iY;
                        if(!this.oMineMap[oCells[i].iX][oCells[i].iY]){
                            if(!$("#gridCell"+iX+iY).hasClass("openGrid")){
                                oDebug.log("Grid "+iX+","+iY+" empty");
                                this._expandSelection(iX,iY); //----> Need to Optimize
                            }           
                        }
                    }
                } 
            }
        }           
    },
    _onGridClick : function(iXPos,iYPos){
        var res = this.getGridWeight(iXPos, iYPos),
            sClass = "";
        if(res>0){
           if(res>=4){ sClass="crit"; }
           else if(res>=3){ sClass="hig"; }
           else if(res==2){ sClass="med"; }
           else{ sClass="low"; }
           $("#gridCell"+iXPos+""+iYPos).empty().addClass("openGrid").append("<p class='"+sClass+"' >"+res+"</p>");

        }
        else if(res==0){
            $("#gridCell"+iXPos+""+iYPos).empty().addClass("openGrid").append("<p class='depress'></p>");
        }
        else if(res==-1){
            this._explode();
        }
        oDebug.log("Selection at x:"+iXPos+" & y:"+iYPos,"warning");
    },
    _explode : function(){
        var aMineLoc = [];
            i = 0;
        for(var y=1; y<=this.iSize; y++){
            for(var x=1; x<=this.iSize; x++){
                if(this.oMineMap[x][y]){
                   aMineLoc.push("#gridCell"+x+""+y); 
                }
            }    
        }
        
        var aIntr= setInterval(function(){
            if(i<aMineLoc.length){
                $(aMineLoc[i]).empty().append("<img class='explosion' width='32px' src='img/explosion.png' />");
            }
            else{
                clearInterval(aIntr);
            }
            i++
        },300);
    },
    _generateRandom : function(sDifficulty){
        var sLevel = sDifficulty ? sDifficulty : "easy";
        if(sLevel=="easy"){
            var rand012 = this._weightedRand({0:0.8, 1:0.2});
        }
        else if(sLevel=="normal"){
            var rand012 = this._weightedRand({0:0.7, 1:0.3});
        }
        else{ //Hard
            var rand012 = this._weightedRand({0:0.4, 1:0.6});
        }
        return rand012(); // random in distribution...
    },
    _weightedRand :function(spec) {
        //Ref:http://stackoverflow.com/questions/8435183/generate-a-weighted-random-number
        var i, j, table=[];
        for (i in spec) {
            // The constant 10 below should be computed based on the
            // weights in the spec for a correct and optimal table size.
            // E.g. the spec {0:0.999, 1:0.001} will break this impl.
            for (j=0; j<spec[i]*10; j++) {
                table.push(i);
            }
        }
        return function() {
            return table[Math.floor(Math.random() * table.length)];
        }
    }
};

var oDebug = {
    init : function(){
        this.jMine = $("#idDebugConsole");
    },
    log : function(sText, sType){ //sType - normal, error, warning, success
        var slogType = sType ? sType : "normal";
        this.jMine.append("<p class='"+slogType+"'>"+sText+"</p>");
        this.jMine.scrollTop( this.jMine.prop('scrollHeight')); //Scroll to bottom
    },
    clear : function(){
        this.jMine.empty();
    }
}

//Startup
$(document).ready(function(){
    oDebug.init();
    Mine.init();
    Mine.createMineGrid(iSize,sDifficulty);
});
