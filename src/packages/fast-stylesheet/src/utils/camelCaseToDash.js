/* eslint-disable prefer-template */
const camelCaseToDash = str => str.replace(/([A-Z])/g, g => '-' + g[0].toLowerCase());

export default camelCaseToDash;
