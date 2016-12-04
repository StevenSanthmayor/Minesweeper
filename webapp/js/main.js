var iSize = 8,
    sDifficulty = "easy",
    sGridCellId = "gridCell";


var Mine = {
    init : function(){
        this.jMine = $("#idMineField tbody");
        this.oMineMap = {};
        this.iFlagCount = 0;

        oDebug.log("Mine initialized");
    },
    createMineGrid : function(iMineSize,sDifficulty){
        this.iSize = iMineSize ? iMineSize : 6;
        var that = this,
            sRow ="";
        this.jMine.empty();
        for(var y=1; y<=this.iSize; y++){
            sRow = "<tr>";
            for(var x=1; x<=this.iSize; x++){
                this.oMineMap[x] = this.oMineMap[x] ?  this.oMineMap[x] : {};
                this.oMineMap[x][y] = this._generateRandom(sDifficulty)=="1" ? true : false;
                if(oDebug.bEnabled){
                    sRow += "<td id='"+sGridCellId+x+""+y+"' data-pos-x='"+x+"' data-pos-y='"+y+"' >"+
                            (this.oMineMap[x][y]? "<img width='32px' src='img/mine.png' />" : "")+
                            "</td>";
                }else{
                    sRow += "<td id='"+sGridCellId+x+""+y+"' data-pos-x='"+x+"' data-pos-y='"+y+"' ></td>";
                }        
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
        this.jGridCells.contextmenu(function(e) {
            e.preventDefault();
            var iX = parseInt($(this).attr("data-pos-x"),10),
                iY = parseInt($(this).attr("data-pos-y"),10);
            that._onFlagMount(iX,iY);
        });
        oDebug.log("Grid Created","success");
    },
    _getNeighbourCells : function(posX,posY){
        /*
        * TL   T   TR
        * L   x,y  R
        * BL   B   BR
        */       
        var aNeighbours = [];
        for( var row = posX - 1; row <= posX + 1; row++)
        {
            for(var col =  posY - 1;  col <= posY + 1; col++)
            {
                if( !(posX == row &&  posY == col) && row>0 && col>0 && row <=8 && col <=8 )
                {
                    aNeighbours.push({
                        "iX" : row,
                        "iY" : col
                    });
                }
            }
        }
        return aNeighbours;     
    },
    getGridWeight : function(x,y){
        var aCells = this._getNeighbourCells(x,y);
        if(this.oMineMap[x][y]){
            oDebug.log("Mine Hit !!","error");
            return -1;
        }
        else{
            var iCount = 0;
            aCells.forEach(function(val,i){
                if(this.oMineMap[aCells[i].iX][aCells[i].iY]){
                    iCount++;
                }
            },this); 
            if(iCount==0){
                this._expandSelection(x,y);
            }   
            oDebug.log("Grid Calculated with weight "+iCount,"success");
            return iCount;
        }
    },
    _expandSelection : function(x,y){
        //Get all valid Neighbours, then tag them ?
        var aCells = this._getNeighbourCells(x,y);
            oValidatedCells = {};

        if(this.oMineMap[x][y]){ //Check for mine
            //Mine hit, do not go further
            return -1;
        }
        else{
            var iCount = 0;
            aCells.forEach(function(val,i){
                if(this.oMineMap[aCells[i].iX][aCells[i].iY]){
                    iCount++;
                }
            },this);
            //Expand neighbour cells, if empty(Chained reaction)
            if(iCount==0){
            $("#"+sGridCellId+x+""+y).empty().addClass("openGrid").append("<p class='depress'></p>");
                aCells.forEach(function(val,i){
                    var iX = aCells[i].iX,
                        iY = aCells[i].iY;
                        if(!this.oMineMap[iX][iY]){
                            if(!$("#"+sGridCellId+iX+iY).hasClass("openGrid")){
                                oDebug.log("Grid "+iX+","+iY+" empty");
                                this._expandSelection(iX,iY); //----> Need to Optimize
                            }           
                        }
                },this);
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
           $("#"+sGridCellId+iXPos+""+iYPos).empty().addClass("openGrid").append("<p class='"+sClass+"' >"+res+"</p>");
        }
        else if(res==0){
            $("#"+sGridCellId+iXPos+""+iYPos).empty().addClass("openGrid").append("<p class='depress'></p>");
        }
        else if(res==-1){
            this._explode();
            return;
        }
        oDebug.log("Selection at x:"+iXPos+" & y:"+iYPos,"warning");
        //Check if game completed ?
        var bComplete = this._isComplete();
        if(bComplete){
             oDebug.log("Game Completed","success");
             $("#completionModal .title").html("Congratulations");
             $("#completionModal .message").html("You have completed the game successfully !!");
             $("#completionModal").removeClass("hidden").addClass("visible");
        }     
    },
    _onFlagMount : function(iXPos,iYPos){
        var jGridCell = $("#"+sGridCellId+iXPos+""+iYPos); 
        if(jGridCell.hasClass("flag") || jGridCell.hasClass("openGrid")){
            jGridCell.empty().removeClass("flag");
            oDebug.log("Removed flag from positon x:"+iXPos+", y:"+iYPos);
        }
        else{
            jGridCell.empty().addClass("flag").append("<img width='32px' src='img/flag.png' />");
            oDebug.log("Added flag at positon x:"+iXPos+", y:"+iYPos);
        }
        this.iFlagCount = $(".flag").length;
        $("#flagCount").html(this.iFlagCount);
    },
    _isComplete : function(){
        for(var y=1; y<=this.iSize; y++){
            for(var x=1; x<=this.iSize; x++){
                if(!($("#"+sGridCellId+x+""+y).hasClass("openGrid") || this.oMineMap[x][y])){
                    return false;
                }
            }
        }
        //Show all Mines
        for(var y=1; y<=this.iSize; y++){
            for(var x=1; x<=this.iSize; x++){
                if(this.oMineMap[x][y]){
                    $("#"+sGridCellId+x+""+y).empty().append("<img width='32px' src='img/mine.png' />");
                }
            }
        }
        return true;
    },
    _explode : function(){
        $("#completionModal .title").html("Mine Hit- Game Over");
        $("#completionModal .message").html("You seem to have hit a mine :(");
        $("#completionModal").removeClass("hidden").addClass("visible");
        var aMineLoc = [];
            i = 0;
        for(var y=1; y<=this.iSize; y++){
            for(var x=1; x<=this.iSize; x++){
                if(this.oMineMap[x][y]){
                   aMineLoc.push("#"+sGridCellId+x+""+y); 
                }
            }    
        }
        
        var aIntr= setInterval(function(){
            if(i<aMineLoc.length){
                $(aMineLoc[i]).empty().append("<img class='explosion' width='2px' src='img/explosion.png' />");
                $(aMineLoc[i]+" img").animate({"width":"32px"});
            }
            else{
                clearInterval(aIntr);
            }
            i++
        },100);
        //Remove all event handlers
        this.jGridCells.off("click");
        this.jGridCells.off("contextmenu");
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
        this.bEnabled = true;
        this.log("Debug Enabled, Mines will be visible");
    },
    log : function(sText, sType){ //sType - normal, error, warning, success
        if(this.bEnabled){
            var slogType = sType ? sType : "normal";
            this.jMine.append("<p class='"+slogType+"'>"+sText+"</p>");
            this.jMine.scrollTop( this.jMine.prop('scrollHeight')); //Scroll to bottom
        }
    },
    clear : function(){
        this.jMine.empty();
    },
    show : function(bExp){
        if(bExp){
            this.bEnabled = true;
            $("#idDebugConsole").css("display","block");
        }
        else{
            this.bEnabled = false;
            $("#idDebugConsole").css("display","none");
        }    
    }
}

//On First Startup
$(document).ready(function(){
    oDebug.init();
    var bDebug = getUrlParameter('debug');  //index.html?debug=true
    if(bDebug && bDebug=="true"){ oDebug.show(true); }
    else{ oDebug.show(false); }
    Mine.init();
    Mine.createMineGrid(iSize,sDifficulty);

    $("#newGameBtn").on("click",function(){
        Mine.init();
        Mine.createMineGrid(iSize,sDifficulty);
    });
    $(".close-modal").on("click",function(){
        oDebug.log("Closing Modal");
        var jModal = $(this).parent();
        jModal.removeClass("visible").addClass("hidden");
    });

});

//Ref: http://stackoverflow.com/questions/19491336/get-url-parameter-jquery-or-how-to-get-query-string-values-in-js
var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};

