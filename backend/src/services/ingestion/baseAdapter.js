/**
 * Abstract Base Scheme Adapter Interface
 * All ingestion adapters must implement this interface.
 */
export class BaseSchemeAdapter {
  constructor(name) {
    this.name = name;
  }

  /**
   * Fetches raw scheme records from the target source.
   * @returns {Promise<Array<object>>} Raw scheme data array
   */
  async fetchSchemes() {
    throw new Error(`fetchSchemes() not implemented in adapter ${this.name}`);
  }
}
