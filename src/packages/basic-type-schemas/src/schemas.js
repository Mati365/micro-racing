import PropTypes from 'prop-types';

export const ID_SCHEMA = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.number,
]);

export const DIMENSIONS_SCHEMA = PropTypes.shape({
  width: PropTypes.number,
  height: PropTypes.number,
});
