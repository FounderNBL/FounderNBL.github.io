import React from "react";
import { createRoot } from "react-dom/client";
import { EmbeddedLivestream } from "@stream-io/video-react-sdk/embedded";
import "@stream-io/video-react-sdk/dist/css/styles.css";

export function mountLivestream(target, { apiKey, callId, userId, token, onError }) {
  const root = createRoot(target);
  root.render(
    <EmbeddedLivestream
      apiKey={apiKey}
      callType="livestream"
      callId={callId}
      user={{ type: "authenticated", id: userId, name: "NBL member" }}
      token={token}
      layout="Livestream"
      onError={onError}
    />
  );
  return () => root.unmount();
}
