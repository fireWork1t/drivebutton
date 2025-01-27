import React, { useState, useEffect } from "react";
import { Text, View, Button } from "react-native";

export default function Index() {
  const [isDriving, setIsDriving] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timer, setTimer] = useState(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let id: NodeJS.Timeout;
    if (isDriving && !isPaused) {
      id = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
      setIntervalId(id);
    } else if (isPaused && intervalId) {
      clearInterval(intervalId);
    }
    return () => {
      if (id) clearInterval(id);
    };
  }, [isDriving, isPaused]);

  const handleDrive = () => {
    setIsDriving(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleStop = () => {
    if (intervalId) clearInterval(intervalId);
    setIsDriving(false);
    setIsPaused(false);
    setIntervalId(null);
    logDriveData();
  };

  const logDriveData = () => {
    const driveData = {
      duration: timer,
      timestamp: new Date().toISOString(),
    };
    console.log("Drive Data:", JSON.stringify(driveData, null, 2));
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      {!isDriving ? (
        <Button title="Drive" onPress={handleDrive} />
      ) : (
        <>
          <Text>{`Timer: ${timer} seconds`}</Text>
          <Button title={isPaused ? "Resume" : "Pause"} onPress={handlePause} />
          <Button title="Stop" onPress={handleStop} />
        </>
      )}
    </View>
  );
}
