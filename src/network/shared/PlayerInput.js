export default class PlayerInput {
  constructor(id, frameId, bitset) {
    this.id = id;
    this.frameId = frameId;
    this.bitset = bitset;
  }

  toBSON() {
    return {
      id: this.id,
      frameId: this.frameId,
      bitset: this.bitset,
    };
  }
}
