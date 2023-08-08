class HttpException extends Error {
  /**
   * Http Exception Constructor
   * @param {string} message - Error Message
   * @param {number} status - Status Code
   */
  constructor(message, status) {
    super();
    this.message = message;
    this.status = status;
  }
}

export default HttpException;
