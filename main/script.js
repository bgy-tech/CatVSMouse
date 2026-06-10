// Basic moving-object example using requestAnimationFrame
const stage = document.getElementById("stage");
const player = document.getElementById("player")
const cat = document.getElementById("cat")
const Gameoverpopup = document.getElementById("Gameoverpopup");
const restartButton = document.getElementById("restartButton");

// speed in pixels per second
 // change this to go faster/slower
const SPEED =700;
const CatSPEED = 400;
// --- Initial setup ---
//only ONCE called, to adjust player in the middle of the stage
 function computeInitialPos() { 
  maxX = Math.max(stage.clientWidth - player.offsetWidth,0);
  maxY = Math.max(stage.clientHeight - player.offsetHeight,0);
  maxXC = Math.max(stage.clientWidth - cat.offsetWidth,0);
  maxYC = Math.max(stage.clientHeight - cat.offsetHeight,0);
  return{
     x : maxX/2,  // middle position
     y : maxY/2, // middle position
     xc: maxXC/20,
     yc: maxYC/30
  }
 }

 let pos = computeInitialPos();
// store which keys are currently pressed

const Arrows ={
  ArrowUp:false,
  ArrowDown:false,
  ArrowLeft:false,
  ArrowRight:false
 };



// apply initial position
setPlayerPosition(pos.x, pos.y);
setCatPosition(pos.xc, pos.yc);


// --- RESTART BUTTON   ---
restartButton.addEventListener("click", () => {
    // 1. Hide the modal
    Gameoverpopup.classList.add("hidden");

    // 2. Reset positions
    pos = computeInitialPos();
    setPlayerPosition(pos.x, pos.y);
    setCatPosition(pos.xc, pos.yc);

    // 3. Reset time and RESTART the loop
    LastTime = null; 
    animationID = requestAnimationFrame(loop);
});


// --- Input handlers ---
// e <- event object provided by the browser
// e.key <- tells which key was pressed, 
//          also provided by the browser(build in)
            //ex. e.key === "ArrowUp" when up arrow is pressed



//if keydown-> set true
window.addEventListener("keydown", (e)=>{
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)){
    Arrows[e.key] = true;
    e.preventDefault(); // prevent scrolling
  }
});
//if keyup-> set false
window.addEventListener("keyup",(e)=>{
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)){
    Arrows[e.key] = false;
    e.preventDefault(); // prevent scrolling
  }
 } );

// stage focus on click: 
//- this allows to happen something on stage clicking on of the arrows
stage.addEventListener("click", () => stage.focus());

// --- Animation loop ---

//loop() - repeated function 
// this will run for every frame (requestAnimationFrame call)
//timestamp - build in,browser provides it
        //  - current time in milliseconds( 1second = 1000 milliseconds)
let LastTime = null;
let animationID = null;

function loop(timestamp){
  if(LastTime === null) LastTime = timestamp;
  const delta = (timestamp - LastTime)/1000;//seconds 
  LastTime = timestamp;
 

  //direction vector calculation: this part calculates the movements
  let vx = 0;
  let vy = 0;
  if (Arrows["ArrowUp"]) vy -= 1; //up is negative y direction
  if (Arrows["ArrowDown"]) vy += 1;//down is positive y direction
  if (Arrows["ArrowLeft"]) vx -= 1;
  if (Arrows["ArrowRight"]) vx += 1;
  
  


  // multiplies by 1/sqrt(2) if both keys are pressed down
  if (vx !=0 && vy!=0 ){
    const gyoktelenito = 1/Math.sqrt(2);
    vx*=gyoktelenito;
    vy*=gyoktelenito;
  }
  
  //d = v*t - physics formula for helping the movement happen to frame rate
  pos.x += vx * SPEED * delta   //DISTENCE = DIRECTION * SPEED * TIME
  pos.y += vy * SPEED * delta   //these 2 help to catch up if frame rate is low
   
  
  let vxc = 0;
  let vyc = 0;
  let tavolsag = 0;
  let normalized_vxc = 0;
  let normalized_vyc = 0; 
  vxc = pos.x - pos.xc;
  vyc = pos.y - pos.yc;
  tavolsag = Math.sqrt(vxc*vxc + vyc*vyc);
  
  if(tavolsag>0){

    normalized_vxc = vxc / tavolsag;
    normalized_vyc = vyc / tavolsag;
  
     pos.xc +=  normalized_vxc * CatSPEED * delta;
     pos.yc += normalized_vyc * CatSPEED * delta;
  }

  // --- 3. Collision Check ---
    // Using AABB (Axis-Aligned Bounding Box) for accuracy
    const player_left = pos.x;
    const player_right = pos.x + player.offsetWidth;
    const player_top = pos.y;
    const player_bottom = pos.y + player.offsetHeight;

    const cat_left = pos.xc;
    const cat_right = pos.xc + cat.offsetWidth;
    const cat_top = pos.yc;
    const cat_bottom = pos.yc + cat.offsetHeight;

    if (
        player_left < cat_right &&
        player_right > cat_left &&
        player_top < cat_bottom &&
        player_bottom > cat_top
    ) {
        // --- COLLISION! ---
        cancelAnimationFrame(animationID); // Stop the loop
        Gameoverpopup.classList.remove("hidden"); // Show Game Over popup
        const restartButton = document.getElementById("restartButton");
         
        restartButton.addEventListener("click", () => {
            // Reset positions    
            pos = computeInitialPos();
            setPlayerPosition(pos.x, pos.y);
            setCatPosition(pos.xc, pos.yc);       
        return; // End the function
    });
    }

  //---CLAMP BOUNDARIES---

      /*--PLAYER CLAMP*/

   //maximum extend of the stage where the player can go
  //prevents if player>stage
  const maxX = Math.max(0, stage.clientWidth - player.offsetWidth);
  const maxY = Math.max(0, stage.clientHeight - player.offsetHeight);
    /*PREVENTS out of window SCENARIO*/ 
  pos.x = Math.max(0, Math.min(pos.x, maxX));// min()-stops the movement at the RIGHT edge(Upper limit- min)
                                             // max()- stops the movement at the LEFT edge (Lower limit- max)
  pos.y = Math.max(0, Math.min(pos.y, maxY));// min()-stops the movement at the BOTTOM edge(Upper limit- min)
                                              // max()- stops the movement at the TOP edge (Lower limit- max)
  setPlayerPosition(pos.x, pos.y); 

      /*--CAT CLAMP--*/

  const maxXC = Math.max(0, stage.clientWidth - cat.offsetWidth);
  const maxYC = Math.max(0, stage.clientHeight - cat.offsetHeight);

  /*PREVENTS out of window SCENARIO*/
  pos.xc = Math.max(0, Math.min(pos.xc,maxXC));
  pos.yc = Math.max(0, Math.min(pos.yc,maxYC));
    
  setCatPosition(pos.xc, pos.yc);

     

  animationID=requestAnimationFrame(loop); // cals loop for the NEXT frame : cycle

 
 
  
}
//calls loop() for first time

animationID=requestAnimationFrame(loop);



// changes CSS top,left properties ->moves visally the player
// ${x} - value of x (Python {} f-string equivalent)
function  setPlayerPosition(x,y){
  player.style.left = `${x}px`;
  player.style.top = `${y}px`;
}

function setCatPosition(xc,yc){
  cat.style.left = `${xc}px`;
  cat.style.top = `${yc}px`;
}



