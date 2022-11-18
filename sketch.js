let mapIndex = []
let initialNearbySetup = true
let cellSize = 20
let firstClick = true

//class responsible for creating and rendering the board
//difficulty: string (easy, normal or hard) 
class Board {

    constructor(difficulty) {        

        switch (difficulty) {
            case "hard":
                this.mineNumber = 99
                this.width = 30
                this.height = 16
                break
            case "medium":
                this.mineNumber = 40
                this.width = 15
                this.height = 13
                break       
            case "easy":
                this.mineNumber = 10
                this.width = 8
                this.height = 8
                break 
        }
    }
    
    /**
     * Generate a "map" by using the provided x & y coordinates in the difficulty
     */
    mapGeneration(){
        for (let i = 0; i < this.width; i++) {
    
            mapIndex.push([])
            for (let j = 0; j < this.height; j++) {
    
                //Cell information
                mapIndex[i].push({
                    x: i,
                    y: j,
                    isActive: false,
                    isMine: false,
                    isFirst: false,
                    nearbyMines: 0,
                    group: undefined,
                    flag: false
                })            
            }
        }
    }

    /**
     * Defines where mines should go by running a loop that chooses a random cell, if the cell is not a mine
     * it's flagged as a mine, else it adds 1 to the loop counter.
     * Might need a rework for a custom difficulty so it doesnt loop too many times if the mine/empty cell ratio is too high
     */
    minePlacement() {
        let noEmptySpaces = false
        
        for (let i = 0; i < this.mineNumber; i++){
            let xCell = round(random(0, this.width-1))
            let yCell = round(random(0, this.height-1))
    
            if(mapIndex[xCell][yCell].isMine || mapIndex[xCell][yCell].isFirst){
                i--
            }else {
                mapIndex[xCell][yCell].isMine = true
                this.totalMines++
            }
        }

        // define the number of nearby mine on every cell
        for (let i = 0; i < this.width; i++){
            for(let j = 0; j < this.height; j++){
                this.checkNear(i,j,false)
            }
        }

        let firstCicle = true
        let currentGroup = 1
        while (!noEmptySpaces){

            let counter = 0
            for (let i = 0; i < this.width; i++){
                for(let j = 0; j < this.height; j++){                    
                    if (mapIndex[i][j].nearbyMines == 0 && !mapIndex[i][j].isMine && mapIndex[i][j].group == undefined){
                        if (firstCicle){
                            mapIndex[i][j].group = currentGroup
                            //console.log(`Group:${mapIndex[i][j].group} x:${i+1} y:${j+1}`);
                            firstCicle = false                      
                        }else if (j > 0 && i == 0){
                            if (mapIndex[i][j-1].group == currentGroup){
                                mapIndex[i][j].group = currentGroup
                                //console.log(`Group:${mapIndex[i][j].group} x:${i+1} y:${j+1}`);
                            }   
                        }else if (j > 0 && i > 0){
                            if (mapIndex[i][j-1].group == currentGroup || mapIndex[i-1][j].group == currentGroup){
                                mapIndex[i][j].group = currentGroup
                                //console.log(`Group:${mapIndex[i][j].group} x:${i+1} y:${j+1}`);
                            }  
                        } else if (j == 0 & i > 0){
                            if (mapIndex[i-1][j].group == currentGroup){
                                mapIndex[i][j].group = currentGroup
                                //console.log(`Group:${mapIndex[i][j].group} x:${i+1} y:${j+1}`);
                            } 
                        }
                    } else {
                        counter++
                    }
                }
            }
            firstCicle = true

            currentGroup++          

            if(counter == 480 || currentGroup > 100){
                noEmptySpaces = true
            }
        }

    }

    /**
     * aligns text in the middle of a cell, recieves the top left position pf a cell
     * @param {Text} textInput  Text to be aligned
     * @param {Number} xPos     horizontal position of the cell
     * @param {Number} yPos     vertical position of the cell
     */
    textCenterCell(textInput, xPos, yPos){
        fill("black")
        textAlign(CENTER, CENTER)
        textSize(this.height)
        text(textInput, (xPos*cellSize)+cellSize*0.1, yPos*cellSize+cellSize*0.6,cellSize) 
    }

    /**
     * check adjecent cells for mines, if any adds to the mine counter,
     * on click it also opens adjecent empty cells
     * @param {Interger} xPos       Horizontal index of the cell.
     * @param {Interger} yPos       Vertical Index of the cell.
     * @param {Boolean} isClick     If it's used on a click or not.
     * @returns                     True if any empty cells were found
     */
    checkNear(xPos, yPos, isClick){
        let mineNearby = false
        let cellDirection = []
        mapIndex[xPos][yPos].nearbyMines = 0
        
        //setup for directions to check for mines
        //0: up, 1: up-right, 2: right, 3: down-right
        //4: down, 5: down-left, 6: left, 7: up-left
        if (xPos == this.width-1) {
            cellDirection = 
            [mapIndex[xPos][yPos-1], mapIndex[xPos][yPos+1], mapIndex[xPos-1][yPos+1],
            mapIndex[xPos-1][yPos], mapIndex[xPos-1][yPos-1]]   
        } else if (xPos == 0) {
            cellDirection = 
            [mapIndex[xPos][yPos-1], mapIndex[xPos+1][yPos-1],mapIndex[xPos+1][yPos],
            mapIndex[xPos+1][yPos+1], mapIndex[xPos][yPos+1]]
        } else {
            cellDirection = 
            [mapIndex[xPos][yPos-1], mapIndex[xPos+1][yPos-1],mapIndex[xPos+1][yPos],
            mapIndex[xPos+1][yPos+1], mapIndex[xPos][yPos+1], mapIndex[xPos-1][yPos+1],
            mapIndex[xPos-1][yPos], mapIndex[xPos-1][yPos-1]] 
        }

        //run only on clicks
        cellDirection.map(e => {
            //if there are adjecent mines
            if (e != undefined && e.isMine){
                mapIndex[xPos][yPos].nearbyMines++
            //if the adjecent cell is empty (only run on  clicks)
            } else if (e != undefined && !e.isMine && e.nearbyMines == 0 && isClick){
                e.isActive = true
                mineNearby = true
            }
        })

        return mineNearby
    }

    /**
     * draws every square in the board by looping width by height
     */
    draw(){
        for (let i = 0; i < this.width; i++) {
            for (let j = 0; j < this.height; j++) {
                //check if the cell has been clicked (.isActive)
                if (mapIndex[i][j].isActive) {  
                    if (mapIndex[i][j].isMine){
                        this.textCenterCell("x", i, j)
                    } else if (mapIndex[i][j].nearbyMines != 0) {
                        this.textCenterCell(mapIndex[i][j].nearbyMines, i, j)
                    }

                    noFill()
                
                //check if the cell is a mine or is flagged
                } else {
                    if (mapIndex[i][j].isMine){
                        this.textCenterCell("x", i, j)
                    } else if (mapIndex[i][j].nearbyMines != 0) {
                        this.textCenterCell(mapIndex[i][j].nearbyMines, i, j)
                    }
                    if (!mapIndex[i][j].flag)
                    fill("blue")     
                    else if (mapIndex[i][j].flag)
                    fill("red")          
                }

                rect(i*cellSize,j*cellSize,cellSize,cellSize)
            }
        }
    }
}

/**
 * check mouse X/Y position to see if it's the same as the area defined
 * @param {Interger} xPos  Horizontal position of the cell being checked
 * @param {Interger} yPos  Vertical position of the cell being checked
 * @param {Interger} xArea Horizontal size of the cell
 * @param {Interger} yArea (optional)Vertical size of the cell, if empty it uses xArea instead
 */
function mouseCollision(xPos, yPos, xArea, yArea) {

    if (yArea != undefined){        
        if(mouseX > xPos*xArea && mouseX <= (xPos*xArea)+xArea) {

            if(mouseY > yPos*yArea && mouseY <= (yPos*yArea)+yArea){

                return true   
            }
        }
    } else {
        if(mouseX > xPos*xArea && mouseX <= (xPos*xArea)+xArea) {
            
            if(mouseY > yPos*xArea && mouseY <= (yPos*xArea)+xArea){

                return true   
            }
        }
    }    
    return false
}

//mouse click functions
function mousePressed() {
    //on right click it "opens" a cell, if already activated it does nothing
    if (mouseButton == LEFT){
        let currentGroup
        //scan for the cell clicked by looping and checking mouse collision
        for (let i = 0; i < stage.width; i++) {
            for (let j = 0; j < stage.height; j++) {
                if (mouseCollision(i,j,cellSize) && !mapIndex[i][j].isActive) {                 
                    mapIndex[i][j].isActive = true
                    currentGroup = mapIndex[i][j].group
    
                    //initial setup for mine placement, runs after the first click to avoid a mine from the start
                    if (firstClick){
                        mapIndex[i][j].isFirst = true
                        stage.minePlacement()
                        firstClick = false
                        initialNearbySetup = true
                        console.log(mapIndex)
                    }
                }
            }
        }
    
        for (let i = 0; i < stage.width; i++) {
            for (let j = 0; j < stage.height; j++) {
                if (mapIndex[i][j].group != undefined){
                    if (mapIndex[i][j].group == currentGroup || mapIndex[i][j].group == 1)
                    mapIndex[i][j].isActive = true
                    //checkNear(i,j,true)
                }
    
            }
        }

    //right clicks on flag cells as mines, if the cell is already flagged it removes it instead
    } else if (mouseButton == RIGHT){
        for (let i = 0; i < stage.width; i++) {
            for (let j = 0; j < stage.height; j++) {
                if (mouseCollision(i,j,cellSize) && !mapIndex[i][j].isActive) { 
                    if (!mapIndex[i][j].flag)                
                    mapIndex[i][j].flag = true
                    else
                    mapIndex[i][j].flag = false

                }
            }
        }
    }

    
}

function setup(){
    stage = new Board("hard")
	createCanvas(stage.width*cellSize, stage.height*cellSize);
    stage.mapGeneration()
}

function draw(){
    background("grey")
    stage.draw()
}