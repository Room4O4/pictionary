import React from 'react';

export const withHeight = WrappedComponent => {
  class WindowHeight extends React.Component {
    state = {
      height: window.innerHeight
    };
    updatewindowHeight = () => {
      this.setState({ height: window.innerHeight });
    };

    componentDidMount() {
      window.addEventListener('resize', this.updatewindowHeight);
    }

    componentWillUnmount() {
      window.removeEventListener('resize', this.updatewindowHeight);
    }

    render() {
      return <WrappedComponent {...this.props} {...this.state} />;
    }
  }

  return WindowHeight;
};
