
let sourceImg = null;
let maskImg = null;

let sourceFile = "input_6.jpg";
let maskFile = "mask_6.png";
let outputFile = "output_6.png";

let colors = [];

function preload() {
  sourceImg = loadImage(sourceFile);
  maskImg = loadImage(maskFile);
}

function setup() {
  let main_canvas = createCanvas(1920, 1080);
  main_canvas.parent('canvasContainer');

  imageMode(CENTER);
  noStroke();
  background(255,255,255)
  
  
  maskImg.loadPixels();
  colorMode(RGB);
  maskImg.updatePixels();
 


// Posterization effect
  for (let r = 0; r <= 255; r += 64) {
    for (let g = 0; g <= 255; g += 64) {
      for (let b = 0; b <= 255; b += 64) {
        colors.push([r, g, b]);
      }
    }
  }

  sourceImg.loadPixels();


  for (let x = 0; x < sourceImg.width; x++) {

    for (let y = 0; y < sourceImg.height; y++) {

      let index = (x + y * sourceImg.width) * 4;
      let r = sourceImg.pixels[index + 0];
      let g = sourceImg.pixels[index + 1];
      let b = sourceImg.pixels[index + 2];

      let closestColor = [Number.MAX_VALUE, []];

      for (let color of colors) {

        let diff = dist(r, g, b, color[0], color[1], color[2]);

        if (diff < closestColor[0]) {
          closestColor[0] = diff;
          closestColor[1] = color;
        }
      }

      sourceImg.pixels[index + 0] = closestColor[1][0];
      sourceImg.pixels[index + 1] = closestColor[1][1];
      sourceImg.pixels[index + 2] = closestColor[1][2];
    }
  }
  sourceImg.updatePixels();
    maskCenterSearch(20);
}

let X_STOP = 1920;
let Y_STOP = 1080;
let OFFSET = 20; 


function maskCenterSearch(min_width) {
  let max_up_down = 0;
  let max_left_right = 0;
  let max_x_index = 0;
  let max_y_index = 0;

  // first scan all rows top to bottom
  print("Scanning mask top to bottom...")
  for(let j=0; j<Y_STOP; j++) {
    // look across this row left to right and count
    let mask_count = 0;
    for(let i=0; i<X_STOP; i++) {
      let mask = maskImg.get(i, j);
      if (mask[1] > 128) {
        mask_count = mask_count + 1;
      }
    }
    // check if that row sets a new record
    if (mask_count > max_left_right) {
      max_left_right = mask_count;
      max_y_index = j;
    }
  }

  // now scan once left to right as well
  print("Scanning mask left to right...")
  for(let i=0; i<X_STOP; i++) {
    // look across this column up to down and count
    let mask_count = 0;
    for(let j=0; j<Y_STOP; j++) {
      let mask = maskImg.get(i, j);
      if (mask[1] > 128) {
        mask_count = mask_count + 1;
      }
    }
    // check if that row sets a new record
    if (mask_count > max_up_down) {
      max_up_down = mask_count;
      max_x_index = i;
    }
  }

  print("Scanning mask done!")
  if (max_left_right > min_width && max_up_down > min_width) {
    maskCenter = [max_x_index, max_y_index];
    maskCenterSize = [max_left_right, max_up_down];
  }
}
let renderCounter = 0;

function draw () {
  angleMode(DEGREES);
  let num_lines_to_draw = 40;
  // get one scanline
  for(let j=renderCounter; j<renderCounter+num_lines_to_draw && j<Y_STOP; j++) {
    for(let i=0; i<X_STOP; i++) {
      colorMode(RGB);
      let mask = maskImg.get(i, j);
      if (mask[1] < 128) {
        pix = sourceImg.get(i, j);
      }
      else {
        if(j%2 == 0) {
          pix = [255, 255, 0, 255]
        }
        else {
          pix = sourceImg.get(i, j);          
        }
      }

      set(i, j, pix);
    }
  }
  renderCounter = renderCounter + num_lines_to_draw;
  updatePixels();


  // print(renderCounter);
  if(renderCounter > Y_STOP) {
    console.log("Done!")
    noLoop();
    // uncomment this to save the result
    saveArtworkImage(outputFile);
  }
}

function keyTyped() {
  if (key == '!') {
    saveCanvas('myCanvas', 'png');
  }
}