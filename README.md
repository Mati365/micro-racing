[![License: CC BY-NC-SA 4.0](https://licensebuttons.net/l/by-nc-sa/4.0/80x15.png)](https://creativecommons.org/licenses/by-nc-sa/4.0/)

# micro-racing
multiplayer 2.5D isometric racing game written in WebGL 2.x

## Gameplay
![Screen 3](/doc/screens/screen-3.png) <br />
![Screen](/doc/screens/screen.png) <br />
![Screen 2](/doc/screens/screen-2.png) <br />

![GIF](/doc/screens/gameplay.gif)

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

## Packages created for project
**@pkg/isometric-renderer:**
> FGL with scene manager that generated 3D scene using WebGL 2<br />
[Link](https://github.com/Mati365/kart-racing/tree/master/src/packages/isometric-renderer)

**@pkg/gl-math:**
> Matrix/Vector implementation with JS loop unroll precompile<br />
[Link](https://github.com/Mati365/kart-racing/tree/master/src/packages/gl-math)

**@pkg/physics-scene:**
> Simple physics engine for top down racing game that uses diagonal collisions detection<br />
[Link](https://github.com/Mati365/kart-racing/tree/master/src/packages/physics-scene)

**@pkg/fast-stylesheet:**
> Fast and small CSS in JS implementation with syntax similar to JSS but much faster<br />
[Link](https://github.com/Mati365/kart-racing/tree/master/src/packages/fast-stylesheet)

**@pkg/struct-pack:**
> Creates C/C++/GLSL style structs that are used in shaders or RPC handler, performs code precompile<br />
[Link](https://github.com/Mati365/kart-racing/tree/master/src/packages/struct-pack)

**@pkg/beizer-lines:**
> Simple cubic beizer lines implementation<br />
[Link](https://github.com/Mati365/kart-racing/tree/master/src/packages/beizer-lines)

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
[Attribution-NonCommercial-ShareAlike 4.0 International](https://github.com/Mati365/kart-racing/blob/master/LICENSE.md)

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
