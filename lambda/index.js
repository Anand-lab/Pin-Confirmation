// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.
const Alexa = require("ask-sdk-core");

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "LaunchRequest"
    );
  },
  handle(handlerInput) {
    const speakOutput =
      "Welcome, to Seattle taxi skill. Please say ride to space needle to book cab.";
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};
const SpaceNeedleOrderIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) ===
        "SpaceNeedleOrderIntent"
    );
  },
  handle(handlerInput) {
    console.log("You are under BookRide Intent handler");
    const speakOutput =
      "A ride to the Space Needle will cost five dollars and take ten minutes.";
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .addDirective({
        type: "Connections.StartConnection",
        uri: "connection://AMAZON.VerifyPerson/2",
        input: {
          requestedAuthenticationConfidenceLevel: {
            level: 400,
            customPolicy: {
              policyName: "VOICE_PIN",
            },
          },
        },
        token: "token",
      })
      .getResponse();
  },
};

const SessionResumedRequestHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) ===
      "SessionResumedRequest"
    );
  },
  handle(handlerInput) {
    const connectionsStatus = handlerInput.requestEnvelope.request.cause.status;
    const connectionsCode = connectionsStatus.code;
    const person = handlerInput.requestEnvelope.context.System.person;

    if (connectionsCode != 200) {
      const speechText =
        "Sorry, something went wrong while verifying your identity.";
      return handlerInput.responseBuilder.speak(speechText).getResponse();
    }

    const verificationTaskResult =
      handlerInput.requestEnvelope.request.cause.result;
    const verificationTaskStatus = verificationTaskResult.status;

    if (verificationTaskStatus == "ACHIEVED") {
      speechText =
        "<alexa:name type='first' personId='" +
        person.personId +
        "'/>" +
        ", you were verified and your driver will be arrived in 8 minutes.";
    } else if (verificationTaskStatus == "NOT_ENABLED") {
      speechText = "Your request was completed.";
    } else {
      speechText =
        "Sorry, verification failed. Your request was not completed.";
    }
    return handlerInput.responseBuilder.speak(speechText).getResponse();
  },
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "AMAZON.HelpIntent"
    );
  },
  handle(handlerInput) {
    const speakOutput = "You can say help if you need help! How can I help?";

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};
const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      (Alexa.getIntentName(handlerInput.requestEnvelope) ===
        "AMAZON.CancelIntent" ||
        Alexa.getIntentName(handlerInput.requestEnvelope) ===
          "AMAZON.StopIntent")
    );
  },
  handle(handlerInput) {
    const speakOutput = "Goodbye!";
    return handlerInput.responseBuilder.speak(speakOutput).getResponse();
  },
};
const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) ===
      "SessionEndedRequest"
    );
  },
  handle(handlerInput) {
    // Any cleanup logic goes here.
    return handlerInput.responseBuilder.getResponse();
  },
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest"
    );
  },
  handle(handlerInput) {
    const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
    const speakOutput = `You just triggered ${intentName}`;

    return (
      handlerInput.responseBuilder
        .speak(speakOutput)
        //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
        .getResponse()
    );
  },
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`~~~~ Error handled: ${error.stack}`);
    const speakOutput = `Sorry, I had trouble doing what you asked. Please try again.`;

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};

const LogRequestInterceptor = {
  process(handlerInput) {
    console.log("======== Request ==========");
    console.log(JSON.stringify(handlerInput, null, 2));
  },
};

const LogResponseInterceptor = {
  process(response) {
    console.log("======== Response ==========");
    console.log(JSON.stringify(response, null, 2));
  },
};

// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    SpaceNeedleOrderIntentHandler,
    SessionResumedRequestHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler,
    IntentReflectorHandler // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
  )
  .addRequestInterceptors(LogRequestInterceptor)
  .addResponseInterceptors(LogResponseInterceptor)
  .addErrorHandlers(ErrorHandler)
  .lambda();