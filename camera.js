video = document.getElementById('video');


async function setupCamera() {
    // Find the <video> element in the webpage, 
    // then use the mediaDevices API to request a camera from the user
    video = document.getElementById('video');
    const stream = await navigator.mediaDevices.getUserMedia({
      'audio': false,
      'video': {
        facingMode: 'user',
        width: {ideal:1920},
        height: {ideal:1080},
      },
    });
    // Assign our camera to the HTML's video element
    video.srcObject = stream;
  
    return new Promise((resolve) => {
      video.onloadedmetadata = () => {
        resolve(video);
      };
    });

  }
    var curFaces = [];
    async function renderPrediction() {
      document.getElementById("myBtn").onclick = function() {
        for (face of curFaces){
          drawEyesBig(face)
        }
      };
        
      
        // Call face Mesh on our video stream
        const facepred = await fmesh.estimateFaces(video);
        
        // If we find a face, export it to a global variable so we can access it elsewhere
        if (facepred.length > 0) { 
        curFaces = facepred;
        }
        // Call itself again
        requestAnimationFrame(renderPrediction);
    };
  
  async function drawVideo(){
    
    ctx.drawImage(video, 0, 0);
    for (face of curFaces){
        drawFace(face); 
    } 
    requestAnimationFrame(drawVideo);
  }

  function drawEyesBig(face){
    let mesh = face.scaledMesh;
    
    // Left eye bounds (top, left, bottom, right) are the points (27, 130, 23, 243)
    let lTop = mesh[27][1];
    let lLeft = mesh[130][0];
    let lBot = mesh[23][1];
    let lRig = mesh[243][0];
  
    // Right eye bounds (top, left, bottom, right) are the points (257, 463, 253, 359)
    let rTop = mesh[257][1];
    let rLeft = mesh[463][0];
    let rBot = mesh[253][1];
    let rRig = mesh[359][0];

    let height = Math.max(lBot-rTop,rBot-lTop);
    let widths = rRig - lLeft;

    canvas2.width = 2*widths;
    canvas2.height = 2*height;

    // Draw each eye from the video onto each eye in the canvas, but twice as big
    ctx2.drawImage(document.getElementById("facecanvas"), lLeft, Math.min(lTop,rTop), widths, height,
                          0, 0, 2*widths, 2*height);
}

  
  // Draws the current eyes onto the canvas, directly from video streams
  async function drawFace(face){
     ctx.fillStyle = 'cyan';
      for (pt of face.scaledMesh){
        console.log("x")
          ctx.beginPath();
          ctx.ellipse(pt[0], pt[1], 3, 3, 0, 0, 2*Math.PI)
          ctx.fill();
      }
  }
  
  // Set up variables to draw on the canvas
  var canvas;
  var ctx;
  var canvas2;
  var ctx2;
  async function main() {
      fmesh = await facemesh.load({detectionConfidence:0.9, maxFaces:3});
      console.log(fmesh)
      // Set up front-facing camera
      await setupCamera();
      videoWidth = video.videoWidth;
      videoHeight = video.videoHeight;
      video.play()
  
      // Set up the HTML Canvas to draw the video feed onto
      canvas = document.getElementById('facecanvas');
      canvas.width = videoWidth;
      canvas.height = videoHeight;
      ctx = canvas.getContext('2d');

      canvas2 = document.getElementById('printcanvas');
      canvas.width2 = videoWidth;
      canvas.height2 = videoHeight;
      ctx2 = canvas2.getContext('2d');
    
      // Start the video->canvas drawing loop
      drawVideo()
      renderPrediction();
  }