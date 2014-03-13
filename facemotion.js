Face = (function() {
  var FaceConstructor;

  stylePath = function(path, style) {
    path.style = style;
    return path;
  };

  smoothPath = function(path) {
    path.smooth();
    return path;
  };

  chordLength = function(hyp, y) {
    return Math.sqrt(hyp*hyp-y*y);
  };

  move = function(point, x, y) {
    point.x = x;
    point.y = y;
    return point;
  };

  reflect = function(path) {
    for (var i = 0; i < path.segments.length; i++) {
      path.segments[i].point.x = -path.segments[i].point.x;
    }
    return path;
  };

  plusEquals = function(point1, point2) {
    point1.x += point2.x;
    point1.y += point2.y;
  };

  buildEye = function(pts) {
    var eye = new Path();
    eye.add(pts[0]);
    eye.arcTo(pts[1],pts[2]);
    eye.lineTo(pts[3]);
    eye.arcTo(pts[4],pts[5]);
    eye.closePath();
    return eye;
  };

  FaceConstructor = function(morphology) {
    if (false === (this instanceof Face)) {
      return new Face(morphology);
    }

    this.styles = {
      'basic': {
        strokeColor: 'black',
        strokeWidth: 5,
        strokeCap: 'round',
        strokeJoin: 'round'
      },
      'filled': {
        strokeWidth: 0,
        fillColor: 'black'
      },
      'blank': {
        strokeWidth: 0
      },
      'muscle': {
        strokeWidth: 2,
        strokeColor: 'blue'
      }
    };

    project.currentStyle = this.styles.basic;

    this.version = morphology.version;
    this.stiffness = morphology.stiffness;
    this.damping = morphology.damping;
    this.recipes = morphology.recipes;
    this.muscles = {};

    this.showMuscles = true;

    this.assemble(morphology);
    this.attachMuscles(morphology);
  };

  FaceConstructor.prototype.setEmotions = function(emotions) {
    var pulls = {};

    // Reset muscle vals
    for (var name in this.muscles) {
      pulls[name] = 0;
    }

    // Calculate new muscle values from emotion sliders
    for (var emotion in this.recipes) {
      var muscles = this.recipes[emotion];
      var pull = emotions[emotion];

      for (var muscle in muscles) {
        pulls[muscle] = 1 - ((1 - muscles[muscle]*pull) * (1 - pulls[muscle]));
      }
    }

    this.setMuscles(pulls);

    return pulls;
  };

  FaceConstructor.prototype.setMuscles = function(musclePulls) {
    for (var muscle in musclePulls) {
      face.muscles[muscle] = musclePulls[muscle];
    }
  };

  FaceConstructor.prototype.forEachPoint = function(func) {
    this.face.children.forEach(function(group, i) {
      if (group.resolve) {
        group.children.forEach(function(path, i) {
          path.segments.forEach(function(segment, i) {
            func(segment.point);
          });
        });
      }
    });
  };

  FaceConstructor.prototype.setupAnimation = function() {
    this.forEachPoint(function(point) {
      point.origin = point.clone();
      point.muscles = {};
      point.vel = new Point(0, 0);
      point.acc = new Point(0, 0);
    });
  };

  FaceConstructor.prototype.assemble = function(morphology) {
    this.face = new Group();

    for (var name in morphology.features) {
      var feature = morphology.features[name];
      this[name] = new Group();

      if (feature.type !== 'circle') {
        var side = new Path();
        for (var i = 0; i < feature.points.length; i++) {
          side.add(new Point(feature.points[i]));
        }
        side.style.strokeWidth = side.style.strokeWidth * feature.weight;

        // Mirror the feature and add as children to the face
        this[name].addChildren([
          side,
          reflect(side.clone())
        ]);
      } else {
        var topChord = chordLength(feature.radius,feature.upperChord*feature.radius),
          botChord = chordLength(feature.radius,feature.lowerChord*feature.radius),
          leftEyePoints = [
            new Point(
              -feature.center.x-topChord,
              feature.center.y-feature.upperChord*feature.radius
            ),
            new Point(
              -feature.center.x-feature.radius, feature.center.y
            ),
            new Point(
              -feature.center.x-botChord,
              feature.center.y+feature.lowerChord*feature.radius
            ),
            new Point(
              -feature.center.x+botChord,
              feature.center.y+feature.lowerChord*feature.radius
            ),
            new Point(
              -feature.center.x+feature.radius, feature.center.y
            ),
            new Point(
              -feature.center.x+topChord,
              feature.center.y-feature.upperChord*feature.radius
            )
          ],
          rightEyePoints = [
            new Point(
              feature.center.x-topChord,
              feature.center.y-feature.upperChord*feature.radius
            ),
            new Point(
              feature.center.x-feature.radius, feature.center.y
            ),
            new Point(
              feature.center.x-botChord,
              feature.center.y+feature.lowerChord*feature.radius
            ),
            new Point(
              feature.center.x+botChord,
              feature.center.y+feature.lowerChord*feature.radius
            ),
            new Point(
              feature.center.x+feature.radius, feature.center.y
            ),
            new Point(
              feature.center.x+topChord,
              feature.center.y-feature.upperChord*feature.radius
            )
          ];

        var leftEye = buildEye(leftEyePoints), rightEye = buildEye(rightEyePoints);

        leftEye.style.strokeWidth *= feature.weight;
        rightEye.style.strokeWidth *= feature.weight;

        this[name].addChildren([rightEye, leftEye]);
      }
      this[name].resolve = true;

      this.face.addChild(this[name]);
    }

    this.setupAnimation();

    this.basicOffset = this.face.position.clone();
    this.face.position = new Point(0, 0);
    this.face.origin = this.face.position;
  };

  // Attach the muscles in the morphology to the appropriate points on the face
  FaceConstructor.prototype.attachMuscles = function(morphology) {
    this.visualMuscles = new Group();
    var temp = [];

    for (var name in morphology.muscleGroups) {
      var group = morphology.muscleGroups[name];
      this.muscles[name] = 0;
      for (var attachment in group.muscles) {
        var weight = group.muscles[attachment],
          feature = attachment.split(':')[0],
          n = attachment.split(':')[1];

        this[feature].children.forEach(function(path, i) {
          if (!isNaN(n)) {
            point = path.segments[n].point;

            var origin = new Point(group.origin);
            if (point.x < 0 || i == 1) {
              origin.x = -origin.x;
            }

            var muscle = new Path();
            muscle.add(point);

            temp.push([point.x, point.y]);
            console.log([point.x, point.y].join(", "), [origin.x, origin.y].join(", "));

            muscle.add(origin);
            muscle.opacity = 0.5;
            this.visualMuscles.addChild(muscle);

            if (point.x === 0) {
              point.constrainX = true;
            }

            point.muscles[name] = {
              'strength': group.strength,
              'stroke': group.stroke,
              'origin': origin,
              'weight': weight,
              'path': stylePath(muscle, this.styles.muscle)
            };
          }
        }.bind(this));
      }
    }

    var boxsort = {};
    for (var i = 0; i < temp.length; i++) {
      if (boxsort[temp[i][1]] !== undefined) {
        boxsort[temp[i][1]].push(temp[i]);
      } else {
        boxsort[temp[i][1]] = temp[i];
      }
    }

    this.face.addChild(this.visualMuscles);
  };

  FaceConstructor.prototype.computePull = function(point, muscle, engagement) {
    // calculate free length of spring from current muscle engagement
    var freeLength = point.origin
      .subtract(muscle.origin)
        .length - (muscle.stroke*engagement);

    // calculate spring displacement given current attachment point position
    var springDisplacement = muscle.origin
      .subtract(point)
      .normalize(
        point.subtract(muscle.origin)
          .length - freeLength
      );

    // Store muscle engagement so we can update the muscle color
    muscle.engagement = engagement;

    // Add spring force to attachment point acceleration (-k*x)
    return springDisplacement.multiply(muscle.weight * muscle.strength * engagement);
  };

  FaceConstructor.prototype.resolvePoint = function(point) {
    // Add some restoring force to the attachment point's origin
    point.acc = point.origin
      .multiply(this.stiffness).subtract(point.multiply(this.stiffness));

    // Add some damping to avoid oscillations
    plusEquals(
      point.acc,
      point.vel.multiply(-this.damping)
    );

    // Calculate force from each muscle
    for (var name in point.muscles) {
      var muscle = point.muscles[name];
      var pull = this.computePull(point, muscle, this.muscles[name]);
      plusEquals(
        point.acc,
        pull
      );
    }
  };

  FaceConstructor.prototype.update = function() {
    // Translate face to origin
    this.face.position = this.face.origin;

    this.forEachPoint(function(point) {
      this.resolvePoint(point);
    }.bind(this));

    this.face.position = view.center.subtract(this.basicOffset);
  };

  // Run a basic diff-eq solver to animate the points
  FaceConstructor.prototype.loop = function(event) {
    this.update();

    this.forEachPoint(function(point) {
      plusEquals(point.vel, point.acc.multiply(event.delta));
      plusEquals(point, point.vel.multiply(event.delta));

      for (var name in point.muscles) {
        var muscle = point.muscles[name];
        if (point.constrainX) {
          point.x = muscle.path.segments[0].point.x;
        }
        move(muscle.path.segments[0].point, point.x, point.y);
        if (this.showMuscles) {
          stylePath(muscle.path, this.styles.muscle);
          muscle.path.strokeColor.hue = remap(muscle.engagement, 0, 1, 240, 0);
          muscle.path.opacity = 0.5;
        } else {
          stylePath(muscle.path, this.styles.blank);
        }
      }
    }.bind(this));

  };

  return FaceConstructor;

}());
