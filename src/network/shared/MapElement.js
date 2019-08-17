import uniqid from 'uniqid';

export default class MapElement {
  constructor(type, params, id = uniqid()) {
    this.type = type;
    this.params = params;
    this.id = id;
  }
}
