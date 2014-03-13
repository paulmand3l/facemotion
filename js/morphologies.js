var male = {
    'version': 1.0,
    'stiffness': 20,
    'damping': 8,
    'features': {
        'eyebrow': {
            'points': [
                {x: 40, y: -34},
                {x: 112, y: -45},
                {x: 142, y: -36}
            ],
            'weight': 1
        },
        'mouth': {
            'points': [
                {x: 0, y: 170},
                {x: 30, y: 170},
                {x: 60, y: 170},
                {x: 30, y: 172},
                {x: 0, y: 172}
            ],
            'weight': 1
        },
        'eye': {
            'points': [
                {x: 50, y: 5},
                {x: 65, y: -15},
                {x: 105, y: -15},
                {x: 120, y: 5}
            ],
            'weight': 0.3
        },
        'eyeball': {
            'type': 'circle',
            'center': {x: 82, y: 0},
            'radius': 13,
            'weight': 0.2,
            'upperChord': 0.7,
            'lowerChord': 0.94,
        },
        'nose': {
            'points': [
                {x: 0, y: 115},
                {x: 30, y: 112}
            ],
            'weight': 1
        },
        'chin': {
            'points': [
                {x: 0, y: 229},
                {x: 10, y: 230}
            ],
            'weight': 1
        }
    },
    'muscleGroups': {
        'inner-occipitofrontalis': {
            'strength': 80,
            'stroke': 50,
            'origin': {x: 50, y: -590},
            'muscles': {
                'eyebrow:0': 1,
                'eyebrow:1': 0.3,
            }
        },
        'outer-occipitofrontalis': {
            'strength': 50,
            'stroke': 30,
            'origin': {x: 150, y: -590},
            'muscles': {
                'eyebrow:0': 0.1,
                'eyebrow:1': 1,
                'eyebrow:2': 0.5,
            }
        },
        'corrugator': {
            'strength': 50,
            'stroke': 30,
            'origin': {x: 0, y: -30},
            'muscles': {
                'eyebrow:0': 0.7,
                'eyebrow:1': 1
            }
        },
        'procerus': {
            'strength': 50,
            'stroke': 50,
            'origin': {x: 50, y: 0},
            'muscles': {
                'eyebrow:0': 0.3,
                'eyebrow:1': 1,
            }
        },
        'levator-palpabrae': {
            'strength': 30,
            'stroke': 20,
            'origin': {x: 80, y: -31},
            'muscles': {
                'eye:1': 1,
                'eye:2': 1
            }
        },
        'orbicularis-oculi': {
            'strength': 20,
            'stroke': 10,
            'origin': {x: 80, y: 5},
            'muscles': {
                'eye:0': 0.7,
                'eye:1': 1,
                'eye:2': 1,
                'eye:3': 0.7,
                'eyeball:scale': 0.5
            }
        },
        'levator-labii': {
            'strength': 50,
            'stroke': 40,
            'origin': {x: 50, y: -100},
            'muscles': {
                'mouth:0': 0.7,
                'mouth:1': 1,
                'mouth:2': 0.2,
                'nose:1': 0.2
            }
        },
        'zygomaticus': {
            'strength': 30,
            'stroke': 50,
            'origin': {x: 180, y: 50},
            'muscles': {
                'mouth:1': 0.1,
                'mouth:2': 1,
                'mouth:3': 0.3,
                'mouth:4': 0.1
            }
        },
        'mentalis': {
            'strength': 10,
            'stroke': 70,
            'origin': {x: 0, y: 0},
            'muscles': {
                'mouth:0': 0.3,
                'mouth:1': 0.3,
                'mouth:3': 1,
                'mouth:4': 0.8,
                'chin:0': 1,
                'chin:1': 1
            }
        },
        'depressor-anguli-oris': {
            'strength': 30,
            'stroke': 20,
            'origin': {x: 50, y: 230},
            'muscles': {
                'mouth:1': 0.1,
                'mouth:2': 1,
                'mouth:3': 0.3
                // 'lower-mouth:2':0.1
            }
        },
        'buccinator': {
            'strength': 50,
            'stroke': 20,
            'origin': {x: 300, y: 250},
            'muscles': {
                'mouth:1': 0.2,
                'mouth:2': 1,
                'mouth:3': 0.6
            }
        },
        'orbicularis-oris': {
            'strength': 50,
            'stroke': 30,
            'origin': {x: 0, y: 170},
            'muscles': {
                'mouth:0': 0.1,
                'mouth:1': 0.3,
                'mouth:2': 1,
                'mouth:3': 0.3,
                'mouth:4': 0.1,
            }
        },
        'jaw': {
            'strength': 30,
            'stroke': 80,
            'origin': {x: 0, y: 1000},
            'muscles': {
                'mouth:1': 0.1,
                'mouth:2': 0.5,
                'mouth:3': 1,
                'mouth:4': 1,
                'chin:0': 0.3,
                'chin:1': 0.3,
            }
        }
    },
    'recipes': {
        'joy': {
            'inner-occipitofrontalis': 0.3,
            'outer-occipitofrontalis': 0.3,
            'orbicularis-oculi': 0.8,
            'levator-labii': 0.5,
            'zygomaticus': 1
        },
        'sadness': {
            'inner-occipitofrontalis': 1,
            'outer-occipitofrontalis': 0.2,
            'corrugator': 1,
            'procerus': 1,
            'levator-labii': 0.5,
            'levator-palpabrae': 0.8,
            'orbicularis-oculi': 1,
            'orbicularis-oris': 0.5,
            'depressor-anguli-oris': 1,
            'buccinator': 0.5,
            'mentalis': 1
        },
        'anger': {
            'procerus': 1,
            'corrugator': 1,
            'orbicularis-oculi': 0.5,
            'levator-labii': 1,
            'buccinator': 0.8,
            'orbicularis-oris': 0.5,
            'depressor-anguli-oris': 0.3
        },
        'disgust': {
            'corrugator': 1,
            'procerus': 0.5,
            'orbicularis-oculi': 0.8,
            'levator-labii': 1,
            'orbicularis-oris': 1,
            'depressor-anguli-oris': 1,
            'mentalis': 1
        },
        'fear': {
            'inner-occipitofrontalis': 0.8,
            'outer-occipitofrontalis': 0.3,
            'corrugator': 1,
            'procerus': 0.5,
            'levator-palpabrae': 1,
            'orbicularis-oculi': 0.8,
            'levator-labii': 1.0,
            'depressor-anguli-oris': 0.7,
            'orbicularis-oris': 0.5,
            'buccinator': 0.8,
            'mentalis': 1,
            'jaw': 0.8
        },
        'surprise': {
            'inner-occipitofrontalis': 0.5,
            'outer-occipitofrontalis': 0.8,
            'levator-labii': 0.8,
            'depressor-anguli-oris': 0.3,
            'levator-palpabrae': 0.7,
            'orbicularis-oris': 1,
            'orbicularis-oculi': 0,
            'mentalis': 0.3,
            'jaw': 1
        },
    }

};
