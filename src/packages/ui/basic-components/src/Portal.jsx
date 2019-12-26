import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

export default class Portal extends React.PureComponent {
  static propTypes = {
    tag: PropTypes.string,
    portalParentSelector: PropTypes.func,
  };

  static defaultProps = {
    tag: 'div',
    portalParentSelector: () => document.body,
  };

  constructor(props) {
    super(props);
    this.el = document.createElement(props.tag);
  }

  componentDidMount() {
    const {portalParentSelector} = this.props;

    this.portalParent = portalParentSelector(
      {
        portalExternalNode: this.el,
      },
    );

    this.portalParent.appendChild(this.el);
  }

  componentWillUnmount() {
    this.portalParent?.removeChild(this.el); // eslint-disable-line no-unused-expressions
  }

  render = () => {
    const {children} = this.props;

    return ReactDOM.createPortal(
      children,
      this.el,
    );
  };
}
