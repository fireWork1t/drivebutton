import { styles } from '../styles';
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Dimensions, StyleSheet, TouchableOpacity, TouchableHighlight, Modal, Platform, Pressable } from 'react-native';
import { getItem, setItem } from '../AsyncStorage';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import MapView, { Polyline } from 'react-native-maps';
import type { LatLng } from 'react-native-maps';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';
import SwitchToggle from "react-native-switch-toggle";
import { getSunrise, getSunset } from 'sunrise-sunset-js';
var SunCalc = require('suncalc');

export default function DrivePage() {
  const [selectedDrive, setSelectedDrive] = useState<any>({});
  const [date, setDate] = useState(new Date());

  const [hours, setHoursDriven] = useState(0);
  const [minutes, setMinutesDriven] = useState(0);
  const [duration, setDuration] = useState(0);

  const [night, setNight] = useState('');
  const [startTime, setStartTime] = useState(new Date());
  const [route, setRoute] = useState<LatLng[]>([]);

  const mapRef = useRef<MapView | null>(null);

  const { index } = useLocalSearchParams();
  const driveIndex = Number(index);

  const [durationModalVisible, setDurationModalVisible] = useState(false);
  const [tempHours, setTempHours] = useState(hours);
  const [tempMinutes, setTempMinutes] = useState(minutes);

  const [dateTimeModalVisible, setDateTimeModalVisible] = useState(false);
  const [tempDateTime, setTempDateTime] = useState(startTime);

  async function getDriveData() {
    const driveData = await getItem("driveData");

    if (driveData) {
      const selected = driveData[driveIndex];
      setSelectedDrive(selected);

      try {
        setDate(new Date(selected.date));
        //console.log("Date: " + date);

        setHoursDriven(Math.floor(selected.duration / 3600));
        setMinutesDriven(Math.floor((selected.duration % 3600) / 60));
        setDuration(selected.duration);
        updateNight();
        setNight(selected.night);
        setStartTime(new Date(selected.time));
        const parsedRoute = JSON.parse(selected.route || '[]');
        setRoute(parsedRoute);
        
        
      } catch (err) {
        console.warn("Could not parse route:", err);
      }
    }
  }

  async function editDuration(duration: number) {
    selectedDrive.duration = duration;

    var editData = await getItem("driveData");

    editData[driveIndex] = selectedDrive;

    await setItem("driveData", editData);

    setHoursDriven(Math.floor(duration / 3600)); // Triggers useEffect
    setMinutesDriven(Math.floor((duration % 3600) / 60));

    getDriveData();
  }

  async function editTime(timecode: Date) {
    selectedDrive.time = timecode;
    selectedDrive.date = timecode;

    var editData = await getItem("driveData");

    editData[driveIndex] = selectedDrive;

    await setItem("driveData", editData);

    setStartTime(timecode); // Triggers useEffect
    setDate(timecode);

    getDriveData();
  }

  async function updateNight() {
    const position = route[route.length - 1];

    const sunTimes = SunCalc.getTimes(startTime, position.latitude, position.longitude, 0);

    console.log("updateNight");

    console.log("Sunrise: " + sunTimes.sunrise);
    console.log("Sunset: " + sunTimes.sunset);

    var startTimeDate = new Date(startTime); // startTime is now a Date object
    //const hours = duration / 3600;
    //const minutes = (duration % 3600) / 60;
    startTimeDate.setHours(startTimeDate.getHours() + hours);
    startTimeDate.setMinutes(startTimeDate.getMinutes() + minutes);
    const timeStopped = new Date(startTimeDate);
    startTimeDate = new Date(startTime); 

    //console.log("Start time: " + startTime);

    
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




    // Update the selectedDrive object
    selectedDrive.night = night ? "Night" : "Day";

    // Save the updated data
    const editData = await getItem("driveData");
    editData[driveIndex] = selectedDrive;
    await setItem("driveData", editData);

    // Refresh the drive data
    //getDriveData();
  }

  useEffect(() => {
    getDriveData();
  }, []);



  useEffect(() => {
    if (route.length > 0 && mapRef.current) {
      mapRef.current.fitToCoordinates(route, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  }, [route]);

  useEffect(() => {
    if (route.length > 0) {
      updateNight(); // Call updateNight after startTime, hours, or minutes change
    }
  }, [startTime, hours, minutes]);

  return (
    <View style={styles.higherContainer}>
      <View style={textStyles.dateContainer}>
        <Text style={textStyles.dateText}>
          {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </Text>
        <TouchableOpacity
          style={triangleStyles.triangle}
          onPress={() => {
            setTempDateTime(startTime);
            setDateTimeModalVisible(true);
          }}
        >
          <Text style={triangleStyles.triangleText}>edit</Text>
        </TouchableOpacity>
        <View style={triangleStyles.whiteTriangle}></View>
      </View>

      <View style={textStyles.timeContainer}>
        <View style={styles.sideBySideLeft}>
        <Text style={textStyles.number}>
          {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
        {night === "Night" ? (
          <Ionicons name="moon" size={30} color="black" style={textStyles.icon} />
        ) : (
          <Ionicons name="sunny" size={30} color="black" style={textStyles.icon} />
        )}
        </View>
      </View>

      <View style={textStyles.row}>
        <Text style={textStyles.number}>{hours}</Text>
        <Text style={textStyles.text}> {hours == 1 ? 'hour' : 'hours'}, </Text>
        <Text style={textStyles.number}>{minutes}</Text>
        <Text style={textStyles.text}> {minutes == 1 ? 'minute' : 'minutes'} </Text>

        <TouchableOpacity
          style={textStyles.editButton}
          onPress={() => {
            setTempHours(hours);
            setTempMinutes(minutes);
            setDurationModalVisible(true);
          }}
        >
          <Ionicons name="pencil" color={"#007AFF"} size={20}></Ionicons>
        </TouchableOpacity>
      </View>

     

      <Modal
        visible={durationModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDurationModalVisible(false)}
      >
        <TouchableOpacity
          style={modalStyles.modalContainer}
          activeOpacity={1}
          onPress={() => setDurationModalVisible(false)} // Close modal on background tap
        >
          <LinearGradient
            colors={['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 1)']} // Gradient colors
            style={modalStyles.gradientBackground}
          >
            <View style={modalStyles.modalContent}>
              {Platform.OS === 'ios' ? (
                <DateTimePicker
                  value={new Date(0, 0, 0, 0, tempHours * 60 + tempMinutes)}
                  mode="countdown"
                  minuteInterval={1}
                  onChange={(event, selectedDuration) => {
                    if (selectedDuration) {
                      const totalMinutes = selectedDuration.getMinutes() + selectedDuration.getHours() * 60;
                      setTempHours(Math.floor(totalMinutes / 60));
                      setTempMinutes(totalMinutes % 60);
                    }
                  }}
                />
              ) : (
                <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                  <Picker
                    selectedValue={tempHours}
                    style={{ width: 100 }}
                    onValueChange={(itemValue) => setTempHours(itemValue)}
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <Picker.Item key={i} label={`${i}`} value={i} />
                    ))}
                  </Picker>
                  <Picker
                    selectedValue={tempMinutes}
                    style={{ width: 100 }}
                    onValueChange={(itemValue) => setTempMinutes(itemValue)}
                  >
                    {Array.from({ length: 60 }, (_, i) => (
                      <Picker.Item key={i} label={`${i}`} value={i} />
                    ))}
                  </Picker>
                </View>
              )}
              <TouchableOpacity
                style={modalStyles.saveButton}
                onPress={() => {
                  const newDuration = tempHours * 3600 + tempMinutes * 60;
                  editDuration(newDuration);
                  setHoursDriven(tempHours);
                  setMinutesDriven(tempMinutes);
                  setDurationModalVisible(false);
                  
                }}
              >
                <Text style={modalStyles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={dateTimeModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDateTimeModalVisible(false)}
      >
        <TouchableOpacity
          style={modalStyles.modalContainer}
          activeOpacity={1}
          onPress={() => setDateTimeModalVisible(false)} // Close modal on background tap
        >
          <LinearGradient
            colors={['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 1)']} // Gradient colors
            style={modalStyles.gradientBackground}
          >
            <View style={modalStyles.modalContent}>
              <DateTimePicker
                value={tempDateTime}
                mode="datetime"
                display="spinner"
                onChange={(event, selectedDate) => {
                  if (selectedDate) {
                    setTempDateTime(selectedDate);
                  }
                }}
              />
              <TouchableOpacity
                style={modalStyles.saveButton}
                onPress={() => {
                  setStartTime(tempDateTime);
                  editTime(tempDateTime);
                  
                  setDateTimeModalVisible(false);
                  
                }}
              >
                <Text style={modalStyles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Modal>

      {route.length > 0 && (
        <View style={mapStyles.container}>
          <MapView
            ref={mapRef}
            style={mapStyles.map}
            initialRegion={{
              latitude: route[0].latitude,
              longitude: route[0].longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Polyline coordinates={route} strokeColor="blue" strokeWidth={4} />
          </MapView>
        </View>
      )}
    </View>
  );
}

const mapStyles = StyleSheet.create({
  map: {
    flex: 1,
  },
  container: {
    width: Dimensions.get('window').width * 0.9, 
    height: Dimensions.get('window').height * 0.4, 
    alignSelf: 'center', 
    marginTop: 20,
    borderRadius: 10,
    overflow: 'hidden',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
  }
});

const textStyles = StyleSheet.create({
  dateContainer: {
    alignSelf: 'center',
    textAlign: 'left',
    //alignItems: 'left',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height * 0.06,
    paddingLeft: 20,
  },
  timeContainer: {
    alignSelf: 'center',
    textAlign: 'left',
    //alignItems: '',
    justifyContent: 'center',
    backgroundColor: '#ddd',
    width: Dimensions.get('window').width,
    paddingLeft: 20,
    height: Dimensions.get('window').height * 0.06,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    textAlign: 'center',
    justifyContent: 'center',
    margin: 10,
  },
  number: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
    //alignSelf: 'center',
  },
  text: {
    fontSize: 30,
    color: '#888',
  },
  editButton: {
    backgroundColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
    borderRadius: 5,
  },
  icon: {
    marginLeft: 10,
    alignSelf: 'center',
  },
});

const modalStyles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  gradientBackground: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

const triangleStyles = StyleSheet.create({
  triangle: {
    position: 'absolute',
    top: 0, // Start at the top of the date background
    right: 0,
    width: 0,
    height: 0,
    borderLeftWidth: Dimensions.get('window').height * 0.2, // Equal-length legs
    borderBottomWidth: Dimensions.get('window').height * 0.12, // Match the height of the timeContainer
    borderLeftColor: 'transparent',
    borderBottomColor: '#0058b0',
    zIndex: 100,
  },
  whiteTriangle: {
    position: 'absolute',
    top: 0, // Start at the top of the date background
    right: 0,
    width: 0,
    height: 0,
    borderLeftWidth: Dimensions.get('window').height * 0.2, // Equal-length legs
    borderBottomWidth: Dimensions.get('window').height * 0.12, // Match the height of the timeContainer
    borderLeftColor: 'transparent',
    borderBottomColor: '#fff',
    zIndex: 99,
  },
  triangleText: {
    position: 'absolute',
    transform: [{ rotate: '-25deg' }],
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 30,
    right: Dimensions.get('window').height * 0.035, // Adjust position to center text
    top: Dimensions.get('window').height * 0.06, // Adjust position for alignment
    zIndex: 101, // Ensure it appears above the triangle
    backgroundColor: 'transparent', // Ensure no background blocks it
  },
});

