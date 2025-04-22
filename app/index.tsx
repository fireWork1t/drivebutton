import React, { useState, useEffect } from "react";
import { Text, View, TouchableOpacity, StyleSheet } from "react-native";
import { setItem, getItem, clear } from "./AsyncStorage";
import { Link } from 'expo-router';
import UserData from './UserData'; // Import UserData
import { StatusBar } from 'expo-status-bar';
import reqs from '../reqs.json'; // Import requirements
import * as Location from 'expo-location';
import { getSunrise, getSunset } from 'sunrise-sunset-js';
import * as Updates from 'expo-updates';




export default function Index() {
  
  


  const [isDriving, setIsDriving] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timer, setTimer] = useState(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [showUserData, setShowUserData] = useState(true);
  const [startTime, setStartTime] = useState("");


  let firstName = "";

async function fetchUserData() {
  const userData = await getItem("userData");
  
  firstName = userData.name.split(" ")[0]; 
  console.log("First name: " + firstName);


  const state = userData.state as keyof typeof reqs;

  const hours_required = reqs[state].total_hours;
  console.log("Hours required: " + hours_required);

  const hours_logged = await getItem("total") / 3600;
  console.log("Hours logged: " + hours_logged);
  
    
}

  useEffect(() => {
    checkFirstTime();
    
  }, []);

  async function checkFirstTime() {
    const firstTime = await getItem('firstTime');
    if (firstTime) {
      setShowUserData(false);
      fetchUserData();
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
    setStartTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
  }

  function handlePause() {
    setIsPaused(!isPaused);
  }

  async function handleStop() {
    if (intervalId) clearInterval(intervalId);
    setIsDriving(false);
    setIsPaused(false);
    setIntervalId(null);
    await logDriveData();
    setTimer(0);
    setStartTime("");
  }

  async function determineNight() {

    const position = await Location.getCurrentPositionAsync();

    const sunset = getSunset(position.coords.latitude, position.coords.longitude);
    const sunrise = getSunrise(position.coords.latitude, position.coords.longitude);
    

 
    const time_stopped = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const sunset_time = sunset.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const sunrise_time = sunrise.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    console.log("Started at " + startTime);
    console.log("Stopped at " + time_stopped);
    console.log("Sun is down between " + sunset_time + " and " + sunrise_time);

    const night = (startTime >= sunset_time && startTime <= sunrise_time) && (time_stopped >= sunset_time && time_stopped <= sunrise_time);

    console.log("Therefore drive was at " + (night ? "night" : "daytime"))

    return (night ? "Night" : "Day");
  }

  async function logDriveData() {

    const night = await determineNight();

    const driveData = [{
      date: new Date().toISOString().substring(0, new Date().toISOString().indexOf('T')),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      duration: timer,
      night: night,
    }];

    

    const tempData = await getItem("driveData");

    const total = await getItem("total");
    if (total) {
      const newTotal = total + timer;
      setItem("total", newTotal);
    } else {
      setItem("total", timer);
    }
    console.log("Total Time:", await getItem("total"));


    if (tempData) {
      tempData.push(driveData[0]);
      setItem("driveData", tempData);
    } else {
      setItem("driveData", driveData);
    }

    console.log("Drive Data:", await getItem("driveData"));
  }

  

  if (showUserData) {

    return <UserData onComplete={() => setShowUserData(false)} />;

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
//const driveData = getItem('driveData');
//export type DriveData = typeof driveData;

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
