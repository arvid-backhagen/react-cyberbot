import React from "react";
import Amplify from "aws-amplify";
import Linkify from "react-linkify";
import {
  Message,
  MessageText,
  MessageButtons,
  MessageList,
  MessageGroup,
  MessageButton,
  ThemeProvider,
  Bubble,
  Avatar,
  Row,
} from "@livechat/ui-kit";
import { MdSend } from "react-icons/md";
import userNinja from "./Assets/ninja.svg";
import defaultBotAvatar from "./Assets/CyberBot.svg";

const cyberBotTheme = {
  Row: {
    css: {
      maxWidth: "80%",
    },
  },
  Avatar: {
    css: {
      flexShrink: 0,
    },
  },
  Message: {
    secondaryTextColor: "#000",
    horizontalAlign: "left",
    css: {
      flex: 1,
      flexShrink: 1,
    },
    own: {
      Bubble: {
        css: {
          backgroundColor: "#015599",
          color: "white",
          borderRadius: "1.4em 0.3em 1.4em 1.4em",
        },
      },
    },
    bot: {
      Bubble: {
        css: {
          backgroundColor: "#f1f1f1",
          borderRadius: "0.3em 1.4em 1.4em 1.4em",
        },
      },
    },
  },
  MessageButtons: {
    css: {
      backgroundColor: "#e0e0e0",
    },
  },
};
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

class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      botAvatar: props.botAvatar || defaultBotAvatar,
      userAvatar: props.userAvatar || userNinja,
      botName: props.botName,
      inputValue: "",
      messages: props.messages || [],
      isTyping: false,
    };
  }
  componentDidMount() {
    // TODO: set state of chat history, also an option to clear history in the header.
    this.chatInput.focus();
    this.setState({
      messages: [
        {
          isOwn: false,
          avatar: this.state.botAvatar,
          title: null,
          date: new Date(),
          text: "How can i be of service?",
          responseCard: null,
        },
      ],
    });
  }
  renderUserMessage = msg => {
    let messages = [...this.state.messages];
    messages.push({
      isOwn: true,
      avatar: this.state.userAvatar,
      title: null,
      date: new Date(),
      text: msg,
      responseCard: null,
    });
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
    console.log(response);
    let messages = [...this.state.messages];
    let newMessage = {
      isOwn: false,
      avatar: this.state.botAvatar,
      date: new Date(),
      text: decodeURIComponent(escape(response.message)),
      dialogState: response.dialogState,
      responseCard: response.responseCard || null,
      buttons: response.responseCard
        ? response.responseCard.genericAttachments[0].buttons
        : null,
      buttonTitle: response.responseCard
        ? response.responseCard.genericAttachments[0].title
        : null,
    };

    messages.push(newMessage);
    this.setState(
      {
        messages: messages,
        isTyping: false,
        inputValue: "",
      },
      () => {
        this.scrollToBottom();
      }
    );
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
    this.renderUserMessage(msg);
    this.setState({ isTyping: true });

    Amplify.Interactions.send(this.state.botName, msg)
      .then(response => {
        this.messageReceived(response);
      })
      .catch(err => {
        this.renderError(err);
      });
  };
  inputChange = e => {
    this.setState({ inputValue: e.target.value });
  };
  getTimestampString = message => {
    return (
      message.date.toLocaleDateString("sv-SE") +
      " " +
      message.date.toLocaleTimeString("sv-SE").substring(0, 5)
    );
  };
  handleButtonPress = (message, buttonValue) => {
    if (message.dialogState === "Fulfilled") {
      this.renderUserMessage(buttonValue);
    }
    this.setState({ isTyping: true });

    Amplify.Interactions.send(this.state.botName, buttonValue)
      .then(response => {
        this.messageReceived(response);
      })
      .catch(err => {
        this.renderError(err);
      });
  };

  render() {
    return (
      <div className="Chat">
        <div
          className="chat-container"
          ref={div => {
            this.chatContainer = div;
          }}
        >
          <ThemeProvider theme={cyberBotTheme}>
            <MessageList css={{ paddingRight: "17px" }}>
              {this.state.messages.map((message, index) => {
                return (
                  <MessageGroup
                    key={index}
                    isOwn={message.isOwn}
                    className={
                      (message.isOwn ? "userMsgGroup" : "botMsgGroup") +
                      " msgGroup"
                    }
                  >
                    <Row reverse={message.isOwn}>
                      <Avatar isOwn={message.isOwn} imgUrl={message.avatar} />
                      <Message
                        avatarUrl={message.avatar}
                        date={this.getTimestampString(message)}
                        isOwn={message.isOwn}
                        bot={!message.isOwn}
                        authorName={message.isOwn ? "You" : "CyberBot"}
                      >
                        <Bubble>
                          {message.text && (
                            <MessageText>
                              <Linkify properties={{ target: "_blank" }}>
                                {message.text}
                              </Linkify>
                            </MessageText>
                          )}
                        </Bubble>
                      </Message>
                    </Row>
                    {message.buttonTitle && (
                      <Message isOwn={message.isOwn} bot={!message.isOwn}>
                        <Bubble>
                          {message.buttonTitle && (
                            <MessageText>{message.buttonTitle}</MessageText>
                          )}

                          {message.buttons && message.buttons.length !== 0 && (
                            <MessageButtons>
                              {message.buttons.map((button, buttonIndex) => (
                                <MessageButton
                                  key={buttonIndex}
                                  label={button.text}
                                  onClick={e => {
                                    this.handleButtonPress(
                                      message,
                                      button.value
                                    );
                                  }}
                                />
                              ))}
                            </MessageButtons>
                          )}
                        </Bubble>
                      </Message>
                    )}
                  </MessageGroup>
                );
              })}
            </MessageList>
          </ThemeProvider>
        </div>
        <div className="inputfield">
          <form className="chat-form" onSubmit={e => this.sendMessage(e)}>
            <input
              className="chat-input"
              onChange={this.inputChange}
              placeholder='Ask something... "What can you do?" '
              ref={input => {
                this.chatInput = input;
              }}
            />
            <button onClick={e => this.sendMessage(e)} className="send-button">
              <MdSend />
            </button>
          </form>
        </div>
      </div>
    );
  }
}

export default Chat;
