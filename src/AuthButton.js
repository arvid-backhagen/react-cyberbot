import React from "react";

class AuthButton extends React.PureComponent {
  handleClick = () => {
    if (this.props.isAuthenticated) {
      this.props.logout();
    } else {
      this.props.login();
    }
  };
  render() {
    return (
      <button className="authButton" onClick={this.handleClick}>
        {this.props.isAuthenticated ? "Sign Out" : "Sign In"}
      </button>
    );
  }
}

export default AuthButton;
