import React, { useState, useEffect, useRef } from "react";
import { Text, View, TouchableOpacity, StyleSheet } from "react-native";
import { setItem, getItem, clear } from "./AsyncStorage";
import { Link } from 'expo-router';
import UserData from './UserData'; // Import UserData
import { StatusBar } from 'expo-status-bar';
import reqs from '../reqs.json'; // Import requirements
import * as Location from 'expo-location';
import { getSunrise, getSunset,  } from 'sunrise-sunset-js';
var SunCalc = require('suncalc');
import * as Updates from 'expo-updates';




export default function Index() {
  
  


  const [isDriving, setIsDriving] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timer, setTimer] = useState(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [showUserData, setShowUserData] = useState(true);
  const [startTime, setStartTime] = useState(new Date);

  const [route, setRoute] = useState<Location.LocationObjectCoords[]>([]);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);

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

 
  const startTracking = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access location was denied');
      return;
    }

    locationSubscription.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 500,
        distanceInterval: 10, // meters
      },
      (location) => {
        setRoute((prev) => [...prev, location.coords]);
      }
    );
  };



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
    setStartTime(new Date()); // Store the full Date object
    startTracking();
  }

  function handlePause() {
    setIsPaused(!isPaused);
  }

  async function handleStop() {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
    }
    if (intervalId) clearInterval(intervalId);
    setIsDriving(false);
    setIsPaused(false);

    setIntervalId(null);
    await logDriveData();
    setTimer(0);
    setStartTime(new Date()); // Reset start time
    setRoute([]); // Reset route
  }

  async function determineNight() {
    const position = await Location.getCurrentPositionAsync();

    const sunTimes = SunCalc.getTimes(startTime, position.coords.latitude, position.coords.longitude, 0);

    

    console.log("Sunrise: " + sunTimes.sunrise);
    console.log("Sunset: " + sunTimes.sunset);
    const timeStopped = new Date();

    //console.log("Start time: " + startTime);

    const startTimeDate = new Date(startTime); // startTime is now a Date object
    console.log("Started at " + startTimeDate);
    console.log("Stopped at " + timeStopped);
    console.log("Sun is down before " + sunTimes.sunrise.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " and after " + sunTimes.sunset.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

    var night = false;

    console.log("Start time: " + startTimeDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    console.log("Stopped time: " + timeStopped.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

    if (startTimeDate < sunTimes.sunrise && timeStopped < sunTimes.sunrise) {
      console.log("Drive started and stopped before sunrise");
      night = true;
    } else if (startTimeDate > sunTimes.sunset && timeStopped > sunTimes.sunset) {
      console.log("Drive started and stopped after sunset");
      night = true;
    } 
    else
    {
      console.log("Drive was at least partially during the day");
      night = false;
    }

    



    //const night = (startTimeDate >= sunsetTime || startTimeDate <= sunriseTime) &&
          //        (timeStopped >= sunsetTime || timeStopped <= sunriseTime);
    // night will be true if the drive started and stopped between sunset and sunrise

    //console.log("Therefore drive was at " + (night ? "night" : "daytime"));

    return (night ? "Night" : "Day");
  }

  async function logDriveData() {

    const night = await determineNight();



    const roundedTimer = Math.round(timer / 60) * 60; // Round to the nearest minute in seconds
    const driveData = [{
      date: new Date(),
      time: new Date(),
      duration: roundedTimer,
      night: night,
      route: JSON.stringify(route),
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

    //console.log("Drive Data:", await getItem("driveData"));
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
