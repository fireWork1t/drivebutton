import React, { useState, useEffect } from "react";
import { Text, View, TouchableOpacity, StyleSheet } from "react-native";
import { setItem, getItem, removeItem } from "./AsyncStorage";
import { Link } from 'expo-router';
import UserData from './UserData'; // Import UserData
import { StatusBar } from 'expo-status-bar';

export default function Index() {
  const [isDriving, setIsDriving] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timer, setTimer] = useState(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [showUserData, setShowUserData] = useState(false);

  useEffect(() => {
    checkFirstTime();
  }, []);

  async function checkFirstTime() {
       removeItem('firstTime');
      const firstTime = await getItem('firstTime');
      console.log(await getItem('firstTime'));

      if (!firstTime || firstTime == null) {
        console.log("First time");
        setShowUserData(true);
      } 
      else {
        console.log("not first time INDEX");
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  driveButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  halfCircleContainer: {
    marginTop: 20,
  },
  halfCircle: {
    width: 200,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  topHalf: {
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
    backgroundColor: "#FF9500",
  },
  bottomHalf: {
    borderBottomLeftRadius: 100,
    borderBottomRightRadius: 100,
    backgroundColor: "#FF3B30",
  },
  buttonText: {
    color: "#fff",
    fontSize: 50,
    
  },
  text: {
    fontSize: 32,
  },
  biggertext: {
    fontSize: 45,
  },
  linkText: {
    fontSize: 18,
    color: "#007AFF",
    marginTop: 20,
  },
});
