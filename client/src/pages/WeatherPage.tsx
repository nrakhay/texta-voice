import { useRef, useEffect, useState } from "react";

const DEFAULT_INSTRUCTIONS = `You are a specialized weather assistant. Your primary function is to:
1. Provide current weather information and forecasts when asked
2. Explain weather phenomena and meteorological concepts
3. Give weather-related advice and recommendations
4. Help interpret weather data and patterns

Important guidelines:
- Only respond to weather-related queries
- If asked about non-weather topics, politely redirect to weather discussions
- Use clear, concise language to explain weather concepts
- When discussing forecasts, always clarify the time period and location
- Provide practical advice related to weather conditions
- If location is not specified, ask for it before providing weather information

Do not:
- Engage in non-weather related conversations
- Provide advice outside of weather-related topics
- Make definitive predictions beyond standard forecast windows

Remember: You are strictly a weather assistant, focused on helping users understand and prepare for weather conditions.`;

const WeatherPage = () => {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [dataChannel, setDataChannel] = useState<RTCDataChannel | null>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const audioElement = useRef<HTMLAudioElement | null>(null);

  // this method was adopted from the openai realtime api docs
  const startSession = async () => {
    try {
      setIsConnecting(true);

      // not the best way to do this, i know, but yeah it works))
      await new Promise((resolve) => setTimeout(resolve, 0));
      const tokenResponse = await fetch(
        "http://localhost:5001/realtime/session"
      );
      const data = await tokenResponse.json();
      const EPHEMERAL_KEY = data.client_secret.value;

      // Create a peer connection
      const pc = new RTCPeerConnection();

      // Set up to play remote audio from the model
      audioElement.current = document.createElement("audio");
      audioElement.current.autoplay = true;
      pc.ontrack = (e) => {
        if (audioElement.current) {
          audioElement.current.srcObject = e.streams[0];
        }
      };

      // Add local audio track for microphone input in the browser
      const ms = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      pc.addTrack(ms.getTracks()[0]);

      const dc = pc.createDataChannel("oai-events");
      setDataChannel(dc);

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const url = new URL("https://api.openai.com/v1/realtime");
      url.searchParams.set("model", "gpt-4o-realtime-preview-2024-12-17");
      url.searchParams.set("instructions", DEFAULT_INSTRUCTIONS);
      url.searchParams.set("voice", "ash");
      const sdpResponse = await fetch(url.toString(), {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${EPHEMERAL_KEY}`,
          "Content-Type": "application/sdp",
        },
      });

      const answer: RTCSessionDescriptionInit = {
        type: "answer" as RTCSdpType,
        sdp: await sdpResponse.text(),
      };
      await pc.setRemoteDescription(answer);

      peerConnection.current = pc;

      setIsSessionActive(true);
      setIsConnecting(false);
    } catch (error) {
      console.error("Failed to start session:", error);
      setIsConnecting(false);
    }
  };

  const stopSession = () => {
    if (dataChannel) {
      dataChannel.close();
    }
    if (peerConnection.current) {
      peerConnection.current.close();
    }

    setIsSessionActive(false);
    setDataChannel(null);
    peerConnection.current = null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">
          AI WeatherAssistant
        </h1>

        {!isSessionActive ? (
          <button
            onClick={startSession}
            disabled={isConnecting}
            className={`w-full py-4 px-6 ${
              isConnecting
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white font-semibold rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
          >
            {isConnecting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                <span>Connecting...</span>
              </div>
            ) : (
              "Start Call"
            )}
          </button>
        ) : (
          <button
            onClick={stopSession}
            className="w-full py-4 px-6 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
          >
            Stop Call
          </button>
        )}

        <p className="text-gray-600 text-center mt-4 text-sm">
          {isConnecting
            ? "Establishing connection..."
            : isSessionActive
            ? "You are talking to the AI assistant"
            : "Click to start a conversation"}
        </p>
      </div>
    </div>
  );
};

export default WeatherPage;
