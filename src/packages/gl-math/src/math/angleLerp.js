import smallestAngleDistance from './smallestAngleDistance';

const angleLerp = (a, b, value) => a + smallestAngleDistance(a, b) * value;

export default angleLerp;
