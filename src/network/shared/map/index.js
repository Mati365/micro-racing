import {OBJECT_TYPES} from '../../constants/serverCodes';

import PlayerMapElement from './PlayerMapElement';
import RoadMapElement from './RoadMapElement';
import MapElement from './MapElement';
import MeshMapElement from './MeshMapElement';
import LayerMap from './LayerMap';

export {
  MeshMapElement,
  LayerMap,
  PlayerMapElement,
  RoadMapElement,
  MapElement,
};

export const MAP_BINARY_ELEMENTS_DESERIALIZERS = {
  [OBJECT_TYPES.MESH]: MeshMapElement.fromBSON,
};
