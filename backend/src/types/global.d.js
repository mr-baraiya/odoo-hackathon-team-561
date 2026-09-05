/**
 * @typedef {Object} User
 * @property {string} id - The user's ID
 * @property {boolean} is_root_user - Whether the user is a root user
 * @property {Array<{company_id: string, permissions: string[]}>} permissions - User's permissions for different companies
 * @property {function(string, string): boolean} hasCompanyPermission - Checks if user has permission for a company
 * @property {function(string): boolean} hasGeneralPermission - Checks if user has general permission
 * @property {function(string, string): void} companyPermissionCheck - Checks if user has permission for a company
 * @property {function(string): void} generalPermissionCheck - Checks if user has general permission
 * @property {function():boolean}  marketerCheck - Checks if user has marketer or
 */

/**
 * @typedef {Object} AppRequest
 * @property {User} user - The authenticated user object
 * @property {Object} body - Request body
 * @property {Object} params - Request parameters
 * @property {Object} query - Request query parameters
 * @property {Object} headers - Request headers
 * @property {string} ip - Request IP address
 */

/**
 * @typedef {Object} AppResponse
 * @property {function(number): AppResponse} status - Set response status code
 * @property {function(any): void} json - Send JSON response
 * @property {function(): void} end - End response
 */

/**
 * @typedef {Object} DatabaseClient
 * @property {function(string, Array<any>): Promise<any>} queryOne - Execute query and return one result
 * @property {function(string, Array<any>): Promise<Array<any>>} queryAll - Execute query and return all results
 * @property {function(string, Array<any>): Promise<any>} queryLiteralOne - Execute literal query and return one result
 * @property {function(string, Array<any>): Promise<any>} namedQueryOne - Execute named query and return one result
 * @property {function(string, Array<any>): Promise<Array<any>>} namedQueryAll - Execute named query and return all results
 * @property {function(string, Array<any>): Promise<any>} query - Execute literal query and return one result
 * @property {function(): Promise<void>} release - Release database connection
 */

/**
 * @typedef {Function} NextFunction
 * @param {Error} [error] - Error object
 */

/**
 * @typedef {Object} ServerError
 * @property {string} code - Error code
 * @property {string} message - Error message
 */
