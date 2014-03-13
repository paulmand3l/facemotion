facemotion
==========

facemotion.js is a library to quickly and easily create an expressive face on your website.  The face is based on a physics simulation of the muscles and tissues of the human face.  The mapping of expressions to muscles comes from the excellent charts in Scott McCloud's [Making Comics](http://www.amazon.com/Making-Comics-Storytelling-Secrets-Graphic/dp/0060780940).

![expressive face](http://i.imgur.com/eqXmyUs.gif)

Dependencies
==========
The facemotion.js library depends on HTML5 Canvas and [Paper.js](http://paperjs.org/).

You'll also need to include both `facemotion.js` and `morphologies.js`

Usage
==========
I'll be honest, the API isn't ideal.  This was made as a class project and I was building for myself, not for reusability.  Want to improve it?  Send a pull request.

Let's start by setting up Paper.  Install it on the window, then attach it to a particular canvas.

    ### HTML
    <canvas id="face"></canvas>
    
    ### Javascript
    paper.install(window);
    paper.setup('face');
    
Initialize the face with the included morphology.

    var face = new Face(male);
    face.showMuscles = false;
    
`showMuscles` is a debugging tool which shows all the muscles of the face and how engaged they are, so you can understand what's going on.  It'd probably be a pretty cool visualization for doctors learning about the musculature of the face.

Draw Paper's view and set it to continuously render the face.  Remember, facemotion.js is a physics simulator for the muscles, so `face.loop` needs to be called every frame.

    view.draw()
    view.onFrame = function(event) {
        face.loop(event);
    }

To set the muscles or emotions, use `face.setEmotions(emotions)` or `face.setMuscles(musclePulls)`.

`face.setEmotions(emotions)` takes one argument, `emotions`, which is a dictionary of emotions named in `morphologies.js` (`joy`, `sadness`, `anger`, etc) mapped to a strength from 0 - 1, inclusive.  It returns the a dictionary of muscle-pulls needed to create that expression or mix of expressions.

    face.setEmotions({joy: 0.8});
    
`face.setMuscles(musclePulls)` takes one argument, `musclePulls` which is a dictionary of muscleGroups named in `morphologies.js` mapped to a strength from 0-1, inclusive.  This is the same object returned by `face.setEmotions()`.

    face.setEmotions({'zygomaticus': 0.75});

Morphologies.js
==========
In order to know what the face looks like and where the muscles go, facemotion ships with a basic morphologies descriptor file.  This is just json which describes the various lines and points, as well as the muscles and emotional mixes of the face.  The file only describes half the face and mirrors it to get the other side.

`stiffness` and `damping` control the properties of the facial flesh.  `stiffness` defines a restoring force on each point of the face and `damping` controls how much energy is absorbed by the flesh when the points moved.


Features
---------
`features` describes the line segments that are used to draw the face.  `points` are the points which make up the line segments, connected in the order given.  These points are also the only points you can attach muscles to.  `weight` is the line-weight to use for the line.  If you want to use a circle instead of a line, you can include `type: 'circle'` and specify some other options, documented in the morphology.

The coordinate system's origin is directly between the eyes (eyeballs are at `y:0`).  Positive y is down the face, x is absolute value since it's mirrored.

    'features': {
        ...
        'chin': {
            'points': [
                {x: 0, y:229},
                {x: 10, y: 230}
            ],
            'weight': 1
        }
        ...
    }
    
draws

![the chin](http://i.imgur.com/jnRbjB8.png)

Muscle Groups
------------
Individual muscles are grouped into named `muscleGroups` which correspond with human anatomy.  Each muscle group is given an overall `strength` (how strong the muscle group pulls), a `stroke` (how far the muscles contract), an `origin` (where all the muscles connect) and an object of `muscles`.

The `muscles` object specifies the individual muscles in the group, which points they attach to, and the strength with which they pull.  The muscle name needs to be of the form `feature:index`, where the feature is the name of one of the features given, and the index is which feature point to attach to.

    'muscleGroups': {
        ...
        'mentalis': {
            'strength': 10,
            'stroke': 70,
            'origin': {x: 0, y: 0},
            'muscles': {
                'chin:0': 1,
                'chin:1': 1
            }
        },
        ...
    }
    
describes the muscle that lets you move your chin up and down a bit.  It's a fairly weak muscle with a long movement that is connected to the origin (right between the eyes).  The group contains two muscles which each connect to a point on the chin and pull up.

In reality, the mentalis muscle displaces the chin, which pushes the lower lip up slightly as well, so in `morphologies.js`, you'll see muscles that connect to the mouth in addition to the chin.

Recipes
------------
The `recipes` match an emotion to the muscles which that emotion activates.

    recipes: {
        ...
        joy: {
            'inner-occipitofrontalis': 0.3,
            'outer-occipitofrontalis': 0.3,
            'orbicularis-oculi': 0.8,
            'levator-labii': 0.5,
            'zygomaticus': 1
        },
        ...
    }

`inner-` and `outer-` `occipitofrontalis` pull the forehead and eyebrows up.  `orbicularis-oculi` squints the eyes.  `levator-labii` makes the face sneer.  `zygomaticus` pulls the corners of the mouth out and up.  All together, this gives the expression of `joy`.

Math
=========
Unlike some other libraries based on Scott McCloud's charts, `facemotion.js` allows mixes of emotions.  This is accomplished by modeling muscles as springs and just running the physics simulation.

Each point in each feature is anchored in place by a small restoring spring.  If you'll recall, the formula for spring force is `F = -k*dx`.  Since we're working in 2 dimensions, these are all vector calculations.  Muscle engagement is defined as a parameter from 0-1 which controls both the free-length of the spring as well as the `k` value of the spring.

From `face.computePull(point, muscle, engagement)`:
    
    freeLength = (point.origin - muscle.origin).length - (muscle.stroke * engagement);
    springDisplacement = (muscle.origin - point).normalize( (point - muscle.origin).length - freeLength) // this is '-k'
    
The `point.normalize()` function in paper takes an argument defining the length to normalize to.

    muscleForce = springDisplacement * muscle.weight * muscle.strength * engagement
    
To figure out the movement of the point, we calculate the force from each muscle as well as the restoring spring, then sum them and integrate twice.  See `face.resolvePoint(point)`
    
