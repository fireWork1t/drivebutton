import React, { useState, useEffect } from "react";
import { Text, View, Button, StyleSheet } from "react-native";
import {setItem, getItem, clear, removeItem, getAllKeys, getAllItems, mergeItem} from "./AsyncStorage";
import { Link } from 'expo-router';

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
    setTimer(0);
  };

  const logDriveData = async () => {
    const driveData = [{
      duration: timer,
      timestamp: new Date().toISOString(),
    }];


    
    var tempData = await getItem("driveData");
    if (tempData)
    {
      tempData.push(driveData[0]);
      setItem("driveData", tempData);
    }
    else
    {
      setItem("driveData", driveData);
    }


    
    
    

    console.log("Drive Data:", await getItem("driveData"));
  };

  return (
    <View style={styles.container}>

      {!isDriving ? (
        <Button title="Drive" onPress={handleDrive} />
      ) : (
        <>
          <Text style={styles.text}>{`Timer: ${timer} seconds`}</Text>
          <Button title={isPaused ? "Resume" : "Pause"} onPress={handlePause} />
          <Button title="Stop" onPress={handleStop} />
        </>
      )}

    <Link href="./log" style={styles.text}>
        Go to Log screen
      </Link>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    fontSize: 32,
    width: 50,
    height: 50,
    margin: 20,
  },
  text: {
    fontSize: 32,
    margin: 10,
  },
});
