import PropTypes from 'prop-types';

export const ID_SCHEMA = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.number,
]);

export const DIMENSIONS_SCHEMA = PropTypes.shape({
  w: PropTypes.number,
  h: PropTypes.number,
});
