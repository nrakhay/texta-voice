import { AudioRecorder } from "react-audio-voice-recorder";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { useEffect } from "react";

const WeatherPage = () => {
  const WS_URL = "ws://127.0.0.1:5001";

  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(
    WS_URL,
    {
      share: false,
      shouldReconnect: () => true,
    }
  );

  useEffect(() => {
    console.log("Connection state changed: ", ReadyState[readyState]);
  }, [readyState]);

  useEffect(() => {
    if (lastJsonMessage) {
      console.log(`Got a new message:`, lastJsonMessage);
    }
  }, [lastJsonMessage]);

  // referenced this author's code:
  // https://stackoverflow.com/questions/55975895/stream-audio-over-websocket-with-low-latency-and-no-interruption/61438244#61438244
  const onRecordingSaved = async (blob: Blob) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      const base64data = reader.result as string;
      sendJsonMessage({
        event: "audio",
        data: base64data.split(",")[1],
      });
    };
  };

  // used tailwind + chatgpt here. reason: tailwind is easier to setup than other ui libs
  // and i'm not really good at styling components :))
  return (
    <div className="min-h-screen bg-gradient-to-r from-pink-600 to-pink-700 text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-4">Welcome to WeatherBot!</h1>
      <h2 className="text-xl mb-8">Ask me about the weather in any city!</h2>

      <div className="flex flex-col items-center gap-4">
        <AudioRecorder
          onRecordingComplete={onRecordingSaved}
          audioTrackConstraints={{
            noiseSuppression: true,
            echoCancellation: true,
          }}
        />
        <p className="text-sm mt-4">
          Connection Status: {ReadyState[readyState]}
        </p>
      </div>
    </div>
  );
};

export default WeatherPage;
