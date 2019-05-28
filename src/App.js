import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";
import Amplify from "aws-amplify";

import { UserAgentApplication } from "msal";
import { applicationConfig } from "./MSconfig";
import { getUserDetails } from "./GraphService";
import AuthButton from "./AuthButton";

// Chat
import Chat from "./Chat";

// userAgentApplication.loginPopup(applicationConfig.scopes).then(
//   function(idToken) {
//     //login success
//     console.log(idToken);
//     console.log(userAgentApplication.getAllUsers());
//   },
//   function(error) {
//     //login failure
//     console.log(error);
//   }
// );
// import { recognition } from "./Speech";
// https://tutorialzine.com/2017/08/converting-from-speech-to-text-with-javascript

Amplify.configure({
  Auth: {
    identityPoolId: "eu-west-1:581d3459-f2b2-44e6-98eb-a9b0359867a3",
    region: "eu-west-1",
  },
  Interactions: {
    bots: {
      Cyberbot: {
        name: "Cyberbot",
        alias: "$LATEST",
        region: "eu-west-1",
      },
    },
  },
});

class App extends Component {
  constructor(props) {
    super(props);

    this.userAgentApplication = new UserAgentApplication(
      applicationConfig.clientID,
      null,
      null,
      { storeAuthStateInCookie: true, cacheLocation: "localStorage" }
    );
    console.log("in constructor");
    var user = this.userAgentApplication.getUser();
    console.log(user);
    if (user) {
      // Enhance user object with data from Graph
      this.getUserProfile();
    }
    this.state = {
      botName: "Cyberbot",
      welcomeMessage:
        "Welcome, how can i help? To access Microsoft services you need to login at the top right.",
      messages: [],
      isTyping: false,
      inputValue: "",
      isAuthenticated: user !== null,
      user: {},
      error: null,
    };
  } // End of constructor
  componentDidMount() {}
  login = () => {
    this.userAgentApplication
      .loginPopup(applicationConfig.scopes)
      .then(loginResponse => {
        console.log("login response: ", loginResponse);
        return this.getUserProfile();
      })
      .catch(err => {
        var errParts = err.split("|");
        this.setState({
          isAuthenticated: false,
          user: {},
          error: { message: errParts[1], debug: errParts[0] },
        });
      });
  };
  logout = () => {
    this.userAgentApplication.logout();
  };
  async getUserProfile() {
    try {
      // Get the access token silently
      // If the cache contains a non-expired token, this function
      // will just return the cached token. Otherwise, it will
      // make a request to the Azure OAuth endpoint to get a token

      var accessToken = await this.userAgentApplication.acquireTokenSilent(
        applicationConfig.scopes
      );

      if (accessToken) {
        // Get the user's profile from Graph
        var user = await getUserDetails(accessToken);
        this.setState({
          isAuthenticated: true,
          user: {
            displayName: user.displayName,
            email: user.mail || user.userPrincipalName,
          },
          error: null,
        });
      }
    } catch (err) {
      var error = {};
      if (typeof err === "string") {
        var errParts = err.split("|");
        error =
          errParts.length > 1
            ? { message: errParts[1], debug: errParts[0] }
            : { message: err };
      } else {
        error = {
          message: err.message,
          debug: JSON.stringify(err),
        };
      }

      this.setState({
        isAuthenticated: false,
        user: {},
        error: error,
      });
    }
  }
  renderMessage = (sender, msg, senderName) => {
    let messages = [...this.state.messages];
    messages.push("New message");
    this.setState(
      {
        messages: messages,
        isTyping: false,
        inputValue: "",
      },
      () => {
        this.chatInput.value = "";
        this.scrollToBottom();
      }
    );
  };
  scrollToBottom = () => {
    this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
  };
  messageReceived = response => {
    this.renderMessage(1, response.message, "CyberBot");
  };
  renderError = err => {
    console.log(err);
    alert(
      "Error in response from chatbot, create a error message that should be rendered."
    );
  };
  sendMessage = e => {
    e.preventDefault();
    let msg = this.state.inputValue;
    if (msg === "") return;
    this.renderMessage(0, msg, "You");
    this.setState({ isTyping: true });

    Amplify.Interactions.send(this.state.botName, msg)
      .then(response => {
        console.log(response);
        this.messageReceived(response);
      })
      .catch(err => {
        this.renderError(err);
      });
  };
  inputChange = e => {
    this.setState({ inputValue: e.target.value });
  };

  render() {
    return (
      <div className="App">
        <header className="App-header">
          {/* TODO: Switch logo to some kind of Avatar */}
          <img src={logo} className="App-logo" alt="logo" />
          <div className="header-text">CyberBot</div>
          <div className="authSection">
            <AuthButton
              login={this.login}
              logout={this.logout}
              isAuthenticated={this.state.isAuthenticated}
            />

            {this.state.isAuthenticated ? (
              <span>
                <strong>Welcome</strong> {this.state.user.displayName}
              </span>
            ) : null}
          </div>
        </header>

        <Chat
          botName={this.state.botName}
          // messages={this.state.messages}
        />
      </div>
    );
  }
}

export default App;
