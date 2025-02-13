import React, { useState, useEffect } from "react";
import { Text, View, TouchableOpacity } from "react-native";
import { setItem, getItem } from "./AsyncStorage";
import { Link } from 'expo-router';
import UserData from './UserData';
import { StatusBar } from 'expo-status-bar';
import { styles } from './styles'; // Import styles

export default function Index() {
  const [isDriving, setIsDriving] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timer, setTimer] = useState(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [showUserData, setShowUserData] = useState(true);

  useEffect(() => {
    checkFirstTime();
  }, []);

  async function checkFirstTime() {
    const firstTime = await getItem('firstTime');
    if (firstTime) {
      setShowUserData(false);
    }
  }

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

  function handleDrive() {
    setTimer(3590);
    setIsDriving(true);
    setIsPaused(false);
  }

  function handlePause() {
    setIsPaused(!isPaused);
  }

  function handleStop() {
    if (intervalId) clearInterval(intervalId);
    setIsDriving(false);
    setIsPaused(false);
    setIntervalId(null);
    logDriveData();
    setTimer(0);
  }

  async function logDriveData() {
    const driveData = [{
      date: new Date().toISOString().substring(0, new Date().toISOString().indexOf('T')),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      duration: timer,
    }];

    const tempData = await getItem("driveData");
    if (tempData) {
      tempData.push(driveData[0]);
      setItem("driveData", tempData);
    } else {
      setItem("driveData", driveData);
    }

    console.log("Drive Data:", await getItem("driveData"));
  }

  if (showUserData) {

    return <UserData />;

  }

  return (
    <View style={styles.container}>
      {!isDriving ? (
        <TouchableOpacity style={styles.driveButton} onPress={handleDrive}>
          <Text style={styles.buttonText}>drive</Text>
        </TouchableOpacity>
      ) : (
        <>
          
          <View style={styles.halfCircleContainer}>
            <TouchableOpacity style={[styles.halfCircle, styles.topHalf]} onPress={handlePause}>
              <Text style={styles.buttonText}>{isPaused ? "resume" : "pause"}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.halfCircle, styles.bottomHalf]} onPress={handleStop}>
              <Text style={styles.buttonText}>stop</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.timerContainer}>
            {timer >= 3600 && (
              <>
                <Text style={styles.biggertext}>{`${Math.floor(timer / 3600)}`}</Text>
                <Text style={styles.text}> hr  </Text>
              </>
            )}
            <Text style={styles.biggertext}>{`${Math.floor((timer % 3600) / 60)}`}</Text>
            <Text style={styles.text}> min  </Text>
            <Text style={styles.biggertext}>{`${timer % 60}`}</Text>
            <Text style={styles.text}> sec</Text>
          </View>
        </>
      )}
      <Link href="./log" style={styles.linkText}>
        Go to Log screen
      </Link>
    </View>
  );
}
