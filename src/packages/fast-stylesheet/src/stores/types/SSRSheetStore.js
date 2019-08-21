import SheetStore from '../SheetStore';

export default class SSRSheetStore extends SheetStore {
  #allRules = '';

  injectRules(classes) {
    const [text, injectedClasses] = this.parseRules(classes);

    this.#allRules += text;
    return injectedClasses;
  }

  flushRules() {
    this.#allRules = '';
  }

  get allRules() {
    return this.#allRules;
  }
}
