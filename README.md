[![License: CC BY-NC-SA 4.0](https://licensebuttons.net/l/by-nc-sa/4.0/80x15.png)](https://creativecommons.org/licenses/by-nc-sa/4.0/)

# kart-racing
online 2D multiplayer go-carts racing game

## Screens
![Isometric engine](/doc/screens/isometric-engine.png?raw=true "Isometric engine")<br />
Preview of Functional WebGL 2.0 Isometric Engine(FGL) with depth test and mesh instancing support

[![Video](https://i.imgur.com/JckXVQs.png)](https://www.youtube.com/watch?v=EDJOmJYySsc "Engine video")
Engine prototype (click to play)

## Goals
- Use monorepo, separated logic
- Create tiny matrix math library
- Create 3D isometric WebGL 2.0 functional wrapper(it should handle depth sorting and other stuff)
- Car steering logic (using Marco Monster approach)
- Procedural generated racetrack
- Bots using Neural Network for AI(see neural-cars)
- Multiplayer

## Packages
**@pkg/fast-stylesheet:**
> Fast and small CSS in JS implementation with syntax similar to JSS<br />
[Link](https://github.com/Mati365/kart-racing/tree/master/src/packages/fast-stylesheet)

## See also
http://buildnewgames.com/real-time-multiplayer/<br/>
https://codea.io/talk/discussion/6648/port-of-marco-monsters-2d-car-physics-now-with-video <br/>
https://developer.valvesoftware.com/wiki/Source_Multiplayer_Networking <br/>
http://www.asawicki.info/Mirror/Car%20Physics%20for%20Games/Car%20Physics%20for%20Games.html <br/>
https://github.com/nadako/cars/blob/gh-pages/Car.hx <br/>
https://github.com/spacejack/carphysics2d/blob/master/marco/Cardemo.c<br/>

HTML UI in AAA games:<br/>
https://www.gdcvault.com/play/1022055/How-to-Implement-AAA-Game

## License
[Attribution-NonCommercial-ShareAlike 4.0 International](https://github.com/Mati365/kart-racing/blob/master/LICENSE.md)

## Resources
Cars:
https://opengameart.org/content/low-poly-cars
