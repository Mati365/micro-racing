# micro-racing
multiplayer 3D isometric racing game written in WebGL 2.x. Steering(both): WSAD / Arrows.

**Live demo:**
https://micro-racing.herokuapp.com/
(it uses free server so it can be really slow)

## Gameplay
![GIF](/doc/screens/gameplay.gif) <br />
![Screen 3](/doc/screens/screen-3.png) <br />
![Screen](/doc/screens/screen.png) <br />
![Screen 2](/doc/screens/screen-2.png)

## Installation
Development mode (running at http://lvh.me:3000):
```bash
yarn install
yarn run develop
```
Production:
```
yarn install
yarn run build:production
```

## Features
- Client side prediction
- High performance isometric engine using WebGL 2.x
- Neural networks trained using evolution algorithms
- Function precompilation in stuct-pack deserializers
- Physics engine
- Optimistic forms

## Goals
- Use monorepo, separated logic
- Create tiny matrix math library
- Create 3D isometric WebGL 2.0 functional wrapper(it should handle depth sorting and other stuff)
- Car steering logic (using Marco Monster approach)
- Procedural generated racetrack
- Bots using Neural Network for AI(see neural-cars)
- Multiplayer

## Parts
### Neural Network Implementation

**forward propagation:**
https://github.com/Mati365/micro-racing/blob/master/src/packages/neural-network/src/unsafe/forwardPropagate.js

**backward propagation:**
https://github.com/Mati365/micro-racing/blob/master/src/packages/neural-network/src/unsafe/backwardPropagate.js

**evolution population train generation:**
https://github.com/Mati365/micro-racing/blob/master/src/packages/neural-network/src/genetic/forkPopulation.js#L70

**ai car driver:**
https://github.com/Mati365/micro-racing/blob/master/src/network/shared/logic/drivers/neural/CarNeuralAI.js

**ai cars trainer:**
https://github.com/Mati365/micro-racing/blob/master/src/network/shared/logic/drivers/neural/CarNeuralTrainer.js

**cars intersection rays:**
https://github.com/Mati365/micro-racing/blob/master/src/network/shared/logic/drivers/neural/CarIntersectRays.js


### Quad Tree
**implementation:**
https://github.com/Mati365/micro-racing/blob/master/src/packages/quad-tree/src/index.js

Quad Tree handles multiple moving objects as list, stores only static objects

### CSS in JS implementation
https://github.com/Mati365/micro-racing/tree/master/src/packages/fast-stylesheet

### Bezier lines and de Castelja algorithm implementation
https://github.com/Mati365/micro-racing/blob/master/src/packages/beizer-lines/src/index.js

### Car steering logic based on Marco Monster docs
https://github.com/Mati365/micro-racing/blob/master/src/network/shared/logic/physics/CarPhysicsBody.js#L43

### Server update loop
https://github.com/Mati365/micro-racing/blob/master/src/network/server/RoomRacing.js#L148

## See also
https://webcache.googleusercontent.com/search?q=cache%3A5cH3UfBvb2YJ%3Avodacek.zvb.cz%2Farchiv%2F681.html&hl=en&gl=us&strip=1&vwsrc=0&fbclid=IwAR2jxD6EayJZqvcOSNOBHgww35indUbC6pAeVA_3XtTCckCVeabjnbEuJvI <br />
http://buildnewgames.com/real-time-multiplayer/<br/>
https://codea.io/talk/discussion/6648/port-of-marco-monsters-2d-car-physics-now-with-video <br/>
https://developer.valvesoftware.com/wiki/Source_Multiplayer_Networking <br/>
http://www.asawicki.info/Mirror/Car%20Physics%20for%20Games/Car%20Physics%20for%20Games.html <br/>
https://github.com/nadako/cars/blob/gh-pages/Car.hx <br/>
https://github.com/spacejack/carphysics2d/blob/master/marco/Cardemo.c<br/>
https://www.sevenson.com.au/actionscript/sat<br/>
http://www.dyn4j.org/2010/01/sat<br/>
HTML UI in AAA games:<br/>
https://www.gdcvault.com/play/1022055/How-to-Implement-AAA-Game

## License
[MIT](https://github.com/Mati365/kart-racing/blob/master/LICENSE.md)

## Resources
Icons:
https://png.is/f/chatbot-robot-internet-bot-artificial-intelligence-icon-vector-robot/6051723894325248-201812161840.html
https://icons8.com/icon/38824/meat
https://www.kisscc0.com/clipart/u-turn-traffic-sign-turnaround-computer-icons-caut-y4h8ur/
https://dryicons.com/icon/zombie-brains-icon-11516
https://fontawesome.com/icons/car

Cars:
https://opengameart.org/content/low-poly-cars
https://free3d.com/3d-model/cartoon-low-poly-city-cars-pack-32084.html

Elements:
https://free3d.com/3d-model/road-elements-40062.html

Map Elements:
https://sketchfab.com/3d-models/muro-hormigon-981c60ea68ce4fcfa168d56ff8ee59ca by talekliaran

https://sketchfab.com/3d-models/cactus-low-poly-8027a1cceedb4d8189592f316b0c4704 by kaltyiontrish
