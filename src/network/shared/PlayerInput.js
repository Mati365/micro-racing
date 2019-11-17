export default class PlayerInput {
  constructor(id, frameId, bitset) {
    this.id = id;
    this.frameId = frameId;
    this.bitset = bitset;
    this.timestamp = Date.now();
    this.tempOnly = true;
  }

  toBSON() {
    return {
      id: this.id,
      frameId: this.frameId,
      bitset: this.bitset,
    };
  }
}
