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
                sRow += "<td data-pos-x='"+j+"' data-pos-y='"+i+"' >"+
                        (this.oMineMap[j][i]? "<img width='32px' src='img/mine.png' />" : "")+
                        "</td>";
            }
            sRow += "</tr>";
            this.jMine.append(sRow);
        }
        //Attach Click Handler
        this.jGridCells =$(this.jMine.find("td"));
        this.jGridCells.on("click",function(){that._onGridClick(this)});
        oDebug.log("Grid Created","success");
    },
    getGridWeight : function(x,y){ //Need to improvise code, very crude logic
        /*
        * TL   T   TR
        * L   x,y  R
        * BL   B   BR
        */
        if(this.oMineMap[x][y]){
            oDebug.log("Mine Hit !!","error");
            return -1;
        }
        else{
            var iCount = 0;
            var oNeighbours = {
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
            /*
            var bTopLeft = ((x-1)>=1)&&(y-1)>=1 ? this.oMineMap[(x-1)][(y-1)] : false;
                bTop = (y-1)>=1  ? this.oMineMap[x][(y-1)] : false;
                bTopRight = ((x+1)<=this.iSize)&&(y-1)>=1 ? this.oMineMap[(x+1)][(y-1)] : false;
                bLeft  = ((x-1)>=1) ? this.oMineMap[x-1][y] : false;
                bRight  = ((x+1)<=this.iSize) ? this.oMineMap[(x+1)][y] : false;
                bBottomLeft = ((x-1)>=1)&&(y+1)<=this.iSize ? this.oMineMap[(x-1)][(y+1)] : false;
                bBottom = (y+1)<=this.iSize ? this.oMineMap[x][(y+1)] : false;
                bBottomRight= ((x+1)<=this.iSize)&&(y+1)<=this.iSize ? this.oMineMap[(x+1)][(y+1)] : false;
            if(bTopLeft){ iCount++; }
            if(bTop){ iCount++; }
            if(bTopRight){ iCount++; }
            if(bLeft){ iCount++; }
            if(bRight){ iCount++; }
            if(bBottomLeft){ iCount++; }
            if(bBottom){ iCount++; }
            if(bBottomRight){ iCount++; }
            */
            for(var i=1; i<=8; i++){
                if(oNeighbours[i].bExists){
                    if(this.oMineMap[oNeighbours[i].iX][oNeighbours[i].iY]){
                        iCount++;
                    }
                }
            }
            oDebug.log("Grid Calculated with weight "+iCount,"success");
            return iCount;
        }
    },
    _onGridClick : function(scope){
        var iXPos = parseInt($(scope).attr("data-pos-x"),10),
            iYPos = parseInt($(scope).attr("data-pos-y"),10);
        var res = this.getGridWeight(iXPos, iYPos),
            sClass = "";
        if(res>0){
           if(res>=3){ sClass="hig"; }
           else if(res==2){ sClass="med"; }
           else{ sClass="low"; }
           $(scope).empty().append("<p class='"+sClass+" openGrid' >"+res+"</p>");

        }
        else if(res==0){
            $(scope).empty().append("<p class='depress openGrid'></p>");
        }
        oDebug.log("Selection at x:"+iXPos+" & y:"+iYPos,"warning");
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
