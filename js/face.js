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

        this.showMuscles = 1;

        this.assemble(morphology);
        this.attachMuscles(morphology);
    };

    FaceConstructor.prototype.setEmotions = function(emotions) {
        var pulls = {};

        // Reset muscle vals
        $.each(this.muscles, function(name, value) {
            pulls[name] = 0;
        });

        // Calculate new muscle values from emotion sliders
        $.each(this.recipes, function(emotion, muscles) {
            var pull = emotions[emotion];

            $.each(muscles, function(name, engagement) {
                pulls[name] = 1 - ((1 - engagement*pull) * (1 - pulls[name]));
            });
        });

        $.each(this.muscles, function(name, value) {
            this.muscles[name] = pulls[name];
        });

        return pulls;
    };

    FaceConstructor.prototype.forEachPoint = function(func) {
        $.each(this.face.children, function(i, group) {
            if (group.resolve) {
                $.each(group.children, function(i, path) {
                    $.each(path.segments, function(i, segment) {
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
        var that = this;
        this.face = new Group();

        $.each(morphology.features, function(name, feature) {
            that[name] = new Group();

            if (feature.type !== 'circle') {
                var side = new Path();
                for (var i = 0; i < feature.points.length; i++) {
                    side.add(new Point(feature.points[i]));
                }
                side.style.strokeWidth = side.style.strokeWidth * feature.weight;

                // Mirror the feature and add as children to the face
                that[name].addChildren([
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

                that[name].addChildren([rightEye, leftEye]);
            }
            that[name].resolve = true;

            that.face.addChild(that[name]);
        });

        this.setupAnimation();

        this.basicOffset = this.face.position.clone();
        this.face.position = new Point(0, 0);
        this.face.origin = this.face.position;
    };

    // Attach the muscles in the morphology to the appropriate points on the face
    FaceConstructor.prototype.attachMuscles = function(morphology) {
        var that = this;

        this.visualMuscles = new Group();
        var temp = [];

        $.each(morphology.muscleGroups, function(name, group) {
            that.muscles[name] = 0;
            $.each(group.muscles, function(attachment, weight) {
                var feature = attachment.split(':')[0],
                    n = attachment.split(':')[1];
                $.each(that[feature].children, function(i, path) {
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
                        that.visualMuscles.addChild(muscle);

                        if (point.x === 0) {
                            point.constrainX = true;
                        }

                        point.muscles[name] = {
                            'strength': group.strength,
                            'stroke': group.stroke,
                            'origin': origin,
                            'weight': weight,
                            'path': stylePath(muscle, that.styles.muscle)
                        };
                    }
                });
            });
        });
        var boxsort = {};
        for (var i = 0; i < temp.length; i++) {
            if (boxsort[temp[i][1]] !== undefined) {
                boxsort[temp[i][1]].push(temp[i]);
            } else {
                boxsort[temp[i][1]] = temp[i];
            }
        }
        console.log(boxsort);
        this.face.addChild(this.visualMuscles);

//        this.visualMuscles.position = view.center.subtract(this.basicOffset);
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
        var that = this;

        // Add some restoring force to the attachment point's origin
        point.acc = point.origin
            .multiply(that.stiffness).subtract(point.multiply(that.stiffness));

        // Add some damping to avoid oscillations
        plusEquals(
            point.acc,
            point.vel.multiply(-that.damping)
        );

        // Calculate force from each muscle
        $.each(point.muscles, function(name, muscle) {
            var pull = that.computePull(point, muscle, that.muscles[name]);
            plusEquals(
                point.acc,
                pull
            );
        });
    };

    FaceConstructor.prototype.update = function() {
        var that = this;

        // Translate face to origin
        this.face.position = this.face.origin;

        this.forEachPoint(function(point) {
            that.resolvePoint(point);
        });

        this.face.position = view.center.subtract(this.basicOffset);
    };

    // Run a basic diff-eq solver to animate the points
    FaceConstructor.prototype.loop = function(event) {
        this.update();

        var that = this;

        this.forEachPoint(function(point) {
            plusEquals(point.vel, point.acc.multiply(event.delta));
            plusEquals(point, point.vel.multiply(event.delta));
            $.each(point.muscles, function(i, elem) {
                if (point.constrainX) {
                    point.x = elem.path.segments[0].point.x;
                }
                move(elem.path.segments[0].point, point.x, point.y);
                if (that.showMuscles) {
                    stylePath(elem.path, that.styles.muscle);
                    elem.path.strokeColor.hue = remap(elem.engagement, 0, 1, 240, 0);
                    elem.path.opacity = 0.5;
                } else {
                    stylePath(elem.path, that.styles.blank);
                }
            });
        });

    };

    return FaceConstructor;

}());
