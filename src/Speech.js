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

export default recognition;
