import stringHash from 'string-hash';

const hashObject = obj => stringHash(JSON.stringify(obj)).toString(36);

export default hashObject;
