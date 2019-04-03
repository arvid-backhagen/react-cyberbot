import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";
import Amplify from "aws-amplify";
import { ChatFeed, Message } from "react-chat-ui";
import { FaPaperPlane } from "react-icons/fa";

// import { recognition } from "./Speech";
// TODO: Add msal npm package for MS Authentication
const botName = "Cyberbot";
try {
  // https://tutorialzine.com/2017/08/converting-from-speech-to-text-with-javascript
  var SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  var recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.onresult = function(event) {
    console.log(event);
  };
  recognition.onstart = function(e) {
    console.log("onstart triggerd", e);
    console.log(
      "Voice recognition activated. Try speaking into the microphone."
    );
  };

  recognition.onspeechend = function(e) {
    console.log("onspeechend triggered", e);
    console.log(
      "You were quiet for a while so voice recognition turned itself off."
    );
  };

  recognition.onerror = function(event) {
    if (event.error === "no-speech") {
      console.log("No speech was detected. Try again.");
    }
  };
} catch (e) {
  console.error(e);
  alert("no recognition found");
}
Amplify.configure({
  Auth: {
    identityPoolId: "eu-west-1:581d3459-f2b2-44e6-98eb-a9b0359867a3",
    region: "eu-west-1",
  },
  Interactions: {
    bots: {
      Cyberbot: {
        name: botName,
        alias: "$LATEST",
        region: "eu-west-1",
      },
    },
  },
});

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      botName: botName,
      welcomeMessage: "Welcome, how can i help?",
      messages: [
        new Message({ id: 1, message: "Hi, how can I help you?" }), // Gray bubble
      ],
      isTyping: false,
      recording: "",
    };
  }
  componentDidMount() {}

  renderMessage = (sender, msg) => {
    let messages = [...this.state.messages];
    messages.push(new Message({ id: sender, message: msg }));
    this.setState({ messages: messages });
    // TODO:
    // Scroll to bottom
  };

  messageReceived = msg => {
    this.renderMessage(1, msg);
  };

  sendMessage = e => {
    e.preventDefault();
    let msg = this.state.inputValue;
    this.renderMessage(0, msg);
    Amplify.Interactions.send(botName, msg).then(response => {
      console.log(response);
      this.messageReceived(response.message);
    });
  };
  inputChange = e => {
    this.setState({ inputValue: e.target.value });
  };

  startRecording = () => {
    console.log("recognition");
    if (recognition) {
      recognition.start();
      setTimeout(() => {
        recognition.stop();
      }, 3000);
    }
  };
  recordingEnded = recording => {
    this.setState({ recording });
  };
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <div className="header-text">CyberBot React</div>
        </header>

        <div className="chat-container">
          <ChatFeed
            messages={this.state.messages} // Boolean: list of message objects
            isTyping={this.state.isTyping} // Boolean: is the recipient typing
            hasInputField={false} // Boolean: use our input, or use your own
            showSenderName // show the name of the user who sent the message
            bubblesCentered={false} //Boolean should the bubbles be centered in the feed?
            // JSON: Custom bubble styles
            bubbleStyles={{
              text: {
                fontSize: 30,
              },
              chatbubble: {
                borderRadius: 70,
                padding: 40,
              },
            }}
          />
        </div>
        <div className="inputfield">
          <form className="chat-form" onSubmit={e => this.sendMessage(e)}>
            <input
              className="chat-input"
              onChange={this.inputChange}
              placeholder="Type something...  "
            />
            <button type="submit" className="send-button">
              <FaPaperPlane />
            </button>
          </form>
        </div>
      </div>
    );
  }
}

export default App;
