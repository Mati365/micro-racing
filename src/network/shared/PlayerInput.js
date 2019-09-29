export default class PlayerInput {
  constructor(id, bitset) {
    this.id = id;
    this.bitset = bitset;
  }

  toBSON() {
    return {
      id: this.id,
      bitset: this.bitset,
    };
  }
}
