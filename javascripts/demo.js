paper.install(window);

document.addEventListener('DOMContentLoaded', function() {
  // Setup directly from canvas id:
  paper.setup('face');

  var faceEl = document.getElementById('face');

  faceEl.setAttribute('width', faceEl.offsetWidth);
  faceEl.setAttribute('height', faceEl.offsetHeight);

  face = new Face(male);
  face.showMuscles = 0;

  view.draw();

  view.onFrame = function(event) {
    face.loop(event);
  };

  setInterval(function() {
    randomEmotion();
  }, 2000);
});

// Generate random number between the bounds
function random(lower, upper) {
    return Math.random() * (Math.max(lower, upper) - Math.min(lower, upper)) + Math.min(lower, upper);
}

// Generate random integer between the bounds
function randInt(lower, upper) {
    return Math.floor(random(lower, upper));
}

// Extract a random element from an array
function randomChoice(array) {
    return array[randInt(0, array.length)];
}

function randomEmotion(n) {
  var emotions = {};

  // Do this for one or two muscles
  if (typeof n === "undefined") {
    if (randInt(0,5) === 0) {
      n = 1;
    } else {
      n = 2;
    }
    console.log(n);
  }

  for (var emotion in face.recipes) {
    emotions[emotion] = 0;
  }

  for (var i = 0; i < n; i++) {
    var selectedEmotion = randomChoice(Object.keys(face.recipes));

    while (emotions[selectedEmotion] !== 0) {
      selectedEmotion = randomChoice(Object.keys(face.recipes));
    }

    emotions[selectedEmotion] = random(0.3, 1);

    musclePulls = face.setEmotions(emotions);

    console.log(selectedEmotion + ' at ' + emotions[selectedEmotion]);
  }
}
