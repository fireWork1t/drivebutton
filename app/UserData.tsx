import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, Pressable, Keyboard, Dimensions, useWindowDimensions, Platform } from 'react-native';
import { getItem, setItem, removeItem, getAllItems, clear } from './AsyncStorage';
import {Picker} from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Location from 'expo-location';
import Index from './index';
import { styles } from './styles'; // Import styles
import * as Progress from 'react-native-progress';
import reqs from '../reqs.json';

import Animated, {
    useSharedValue,
    withTiming,
    useAnimatedStyle,
    Easing,
    runOnJS,
  } from 'react-native-reanimated';

  //clear();
  

const UserData = ({ onComplete }: { onComplete: () => void }) => {
  
  const [inputValue, setInputValue] = useState('');
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [nameEntered, setNameEntered] = useState(false); // Use state for nameEntered
  const [stateEntered, setStateEntered] = useState(false);
  const [dateEntered, setDateEntered] = useState(false);
  const [isButtonClicked, setIsButtonClicked] = useState(false); // New state variable
  const [isAnimating, setIsAnimating] = useState(false);
 
   // State variable to store target function
  
  const [screen, setScreen] = useState('welcome'); // Use state for screen
  const [showNameError, setShowNameError] = useState(false);
  const [showDateError, setShowDateError] = useState(false);
  const [showEmailError, setShowEmailError] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedState, setSelectedState] = useState(''); // Use state for selected state
  const [selectedDate, setSelectedDate] = useState(new Date()); // Use state for selected state
  const [errorExists, setErrorExists] = useState(false);
  const [targetFunction, setTargetFunction] = useState<() => Promise<void>>(async () => {});
  const [locationButtonText, setLocationButtonText] = useState('enable location'); // Use state for locationText
  const [locationText, setLocationText] = useState('Please enable location services.'); // Use state for locationText
  const [hasVisitedBirthdate, setHasVisitedBirthdate] = useState(false);
  const states = [
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", 
    "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", 
    "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", 
    "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", 
    "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", 
    "West Virginia", "Wisconsin", "Wyoming"
  ];



const saveButtonScale = useSharedValue(1);
const backButtonScale = useSharedValue(1);
const skipButtonScale = useSharedValue(1);

const screenTransform = useSharedValue(1);

const screenOpacity = useSharedValue(1);

const [screenTransitioned, setScreenTransitioned] = useState(false);

const transformConfig = {
    duration: 500,
    easing: Easing.bezier(0.5, 0.01, 0, 1),
  };

const scaleConfig = {
    duration: 200,
    easing: Easing.bezier(0.5, 0.01, 0, 1),
  };

  const opacityConfig = {
    duration: 400,
    easing: Easing.bezier(0.5, 0.01, 0, 1),
  };

  const width = useWindowDimensions().width;

  const screenAnimationStarted = useSharedValue(false); // Track if animation has started

  const buttonAnimationStarted = useSharedValue(false); // Track if animation has started

  const saveButtonAnimation = useAnimatedStyle(() => {
    return {
      transform: [{ scale: withTiming(saveButtonScale.value, scaleConfig, (isFinished) => {
        if (isFinished && isButtonClicked && !errorExists)
        {
        
            screenTransform.value = 1.2;
            screenOpacity.value = 0;
            screenAnimationStarted.value = true;
            saveButtonScale.value = 1;
            
  
      }

      }) }],
    };
  });

let isScreenAnimationFinished = false;

const animationFinished = useSharedValue(false);

function handleAnimationEnd() 
{
  setErrorExists(false);

  if (screen === "welcome")
  {
      handleContinue();
      saveButtonScale.value = 1;
      setIsButtonClicked(false);
  } 
  else if (screen === "name") 
  {
      saveButtonScale.value = 1;
      setScreen('state');
      //console.log(screen);
      setIsButtonClicked(false);
      setInputValue("");
  } 
  else if (screen === "state") 
  {
    if (Platform.OS === 'ios')
      {
        setShowDatePicker(true);
      }
      saveButtonScale.value = 1;
      setScreen('birthDate');
      //console.log("set to birthdate");
      setIsButtonClicked(false);
      
  } 
  else if (screen === "birthDate") 
  {
      saveButtonScale.value = 1;
      setScreen('parentEmail');
      //console.log(screen);
      setIsButtonClicked(false);
      
  }
  else if (screen === "parentEmail") 
    {
        saveButtonScale.value = 1;
        setScreen('location');
        //console.log(screen);
        setIsButtonClicked(false);
        setInputValue("");
    }
  else if (screen === "location")
  {
    saveButtonScale.value = 1;
    setScreen('complete');
    setIsButtonClicked(false);
  
  }
  else if (screen === "complete")

    {
      goHome();
    }

  setScreenTransitioned(false);
  animationFinished.value = false;
}

const screenAnimation = useAnimatedStyle(

  function() {

    const opacity = withTiming(screenOpacity.value, opacityConfig);


    const transform = withTiming(screenTransform.value, transformConfig, 

      function(isFinished) 
      {
        if (isFinished && isButtonClicked && !errorExists) 
        {
            if (!animationFinished.value) 
            {
                animationFinished.value = true;
                runOnJS(handleAnimationEnd)();
            }
            
            screenAnimationStarted.value = false;
            screenOpacity.value = 1;
            screenTransform.value = 1;
        }
    }

  );


    return {
        opacity,
        transform: [{ scale: transform }],
    };
}

);

const backButtonAnimation = useSharedValue(0);

const backScreenAnimation = useAnimatedStyle(() => {
  return {
    transform: [{ translateX: withTiming(backButtonAnimation.value, transformConfig, (isFinished) => {
      if (isFinished) {
        backButtonAnimation.value = 0; // Reset to original position
      }
    }) }],
    opacity: withTiming(screenOpacity.value, opacityConfig),
  };
});



const handleBackPress = () => {
  backButtonAnimation.value = width; // Slide the screen to the right
  screenOpacity.value = 0; // Set opacity to 0
  setTimeout(() => {
    runOnJS(handleBack)(); // Call handleBack
    //backButtonAnimation.value = 0; // Return the screen to the original position
    screenOpacity.value = 1; // Fade in
  }, transformConfig.duration);
};


  

  useEffect(() => {
    checkFirstTime();
  }, []);

  async function blank() {}

  useEffect(() => {
    setTargetFunction(blank); // Set the target function inside useEffect
  }, []);

  

  async function checkFirstTime() {
    //removeItem('firstTime');
    const firstTime = await getItem('firstTime');
    console.log(await getItem('firstTime'));
    if (!firstTime || firstTime == null) {
      console.log("First time");
      setScreen('welcome');
    } else {
      console.log("not first time");
    }
  }

  function handleInputChange(text: string) {
    if (screen === 'name') 
      {

      
        setInputValue(text);
        setIsButtonDisabled((text.trim() === '') || (text === null));
      }
      else
      {
        setInputValue(text);
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(text)) {
          setIsButtonDisabled(false);
        } else {
          setIsButtonDisabled(true);
        }
      }
  }

  async function handleContinue() {
    setScreen('name');
    setIsButtonDisabled(true);
  }

  async function handleNameSave() {
    if (inputValue.trim() !== '') {
      if (inputValue.trim().split(' ').length == 2) {
        setNameEntered(true); // Update state
        await setItem('userData', { name: inputValue });
        setErrorExists(false);
        console.log(await getAllItems());
        //setInputValue("");
        saveButtonScale.value = 0.8; 
        
      } 
      else {
        setErrorExists(true);
        setShowNameError(true);
      }
    }

    const checkData = await getItem('userData');

    if (checkData) {
        if (checkData.state) {
            setSelectedState(checkData.state);
            setStateEntered(true);
            setIsButtonDisabled(false);
        }
        else
        {
            setIsButtonDisabled(true);
        }
    }
  }

  async function handleStateSave() {
    if (selectedState.trim() !== '') {
      setStateEntered(true); // Update state
      const tempData = await getItem("userData");
      if (tempData) {
        tempData.state = selectedState;

        

        setItem("userData", tempData);
        
        
      }
      console.log(tempData);
      console.log(await getAllItems());
      
      
    }

    const checkData = await getItem('userData');

    if (checkData) {
        if (checkData.birthDate) {
            const stringDate = checkData.birthDate + "T08:00:00.000Z";
            console.log(stringDate);
            const dateObject: Date = new Date(stringDate);
            console.log(dateObject);

            setSelectedDate(dateObject);
            setIsButtonDisabled(false);
        }
        else
        {
            setIsButtonDisabled(true);
        }
    }
  }

  async function handleBirthdateSave() {
    if (selectedDate !== null) {
      const tempData = await getItem("userData");
      if (tempData) {
        tempData.birthDate = selectedDate.toISOString().split('T')[0];
        setItem("userData", tempData);
        setDateEntered(true);
      }
      console.log(await getItem("userData"));
    }

    const checkData = await getItem('userData');

    if (checkData) {
      if (checkData.parentEmail) {
        setInputValue(checkData.parentEmail);
        setIsButtonDisabled(false);
      } else {
        setIsButtonDisabled(true);
      }
    }
  }

  async function handleParentEmailSave() {
    if (inputValue.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      if (emailRegex.test(inputValue)) {

        setErrorExists(false);

        const tempData = await getItem("userData");
        if (tempData) {
            tempData.parentEmail = inputValue;
            setItem("userData", tempData);
        }
        setNameEntered(true); // Update state
        
        console.log(await getAllItems());
        //setInputValue("");
        
        
        saveButtonScale.value = 0.8; 

      } else {
        setShowEmailError(true);
        setErrorExists(true);
      }
    }
  }

  async function handleParentEmailSkip() {
    const tempData = await getItem("userData");
    if (tempData) {
        tempData.parentEmail = "";
        setItem("userData", tempData);
    }
    
    console.log(await getAllItems());
    //setInputValue("");
    setScreen('location');
    setIsButtonDisabled(true);
  }

  async function handleBack() {
    console.log(screen);
    if (screen === 'state') {
      setScreen('name');
      const value = await getItem("userData");
      if (value) {
        setInputValue(value.name);
      }
      setNameEntered(false);
      setIsButtonDisabled(false);
    }
    if (screen === 'birthDate') {
        setScreen('state');
        const value = await getItem("userData");
        if (value) {
            setSelectedState(value.state);
        }
        setStateEntered(false);
        setIsButtonDisabled(false);
    }

    if (screen === 'parentEmail') {
      if (Platform.OS === 'ios')
        {
          setShowDatePicker(true);  
        }
        setScreen('birthDate');
        const value = await getItem("userData");
        if (value) {
            const stringDate = value.birthDate + "T08:00:00.000Z";
            console.log(stringDate);
            const dateObject: Date = new Date(stringDate);
            console.log(dateObject);

            setSelectedDate(dateObject);
        }
        setDateEntered(false);
        setIsButtonDisabled(false);
        
    }

    if (screen === 'location') {
        setScreen('parentEmail');
        const value = await getItem("userData");
        if (value) {
            setInputValue(value.parentEmail);
        }
        setIsButtonDisabled(false);
    }

    if (screen === 'complete') {
        setScreen('location');
        setIsButtonDisabled(false);
    }
  }

  async function requestLocationPermission() {
    if (locationButtonText != 'continue') {
      (await Location.requestForegroundPermissionsAsync()).canAskAgain = true;
      console.log((await Location.requestForegroundPermissionsAsync()).canAskAgain); // Reset location permission status
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        saveButtonScale.value = 0.8;
      setIsButtonClicked(true);
      setIsAnimating(true);
          //setScreen('complete');
      } else {
          console.log('Location permission not granted');
          setLocationButtonText('continue');
          setLocationText('Location permission not granted.');
      }
    } else {
      saveButtonScale.value = 0.8;
      setIsButtonClicked(true);
      setIsAnimating(true);
      //setScreen('complete');
        
    }
  }

  async function goHome() {
    console.log("going home");
    await setItem('firstTime', 'false');
    onComplete(); // Call the prop function to update the state in the Index component
  }



  const handleDateChange = (event: any, date?: Date) => {
      if (date) {
          setSelectedDate(date);
          setIsButtonDisabled(false);
      } 
      else {
          setIsButtonDisabled(true);
      }
      if (Platform.OS === 'android') {
          setShowDatePicker(false); // Hide the picker after selecting a date on Android
      }
  };

// useEffect(() => {
//   if (screen === 'birthDate') {
    
//     if (hasVisitedBirthdate == false) {
      
//       setShowDatePicker(true);
    
//     }
//     setHasVisitedBirthdate(true);
//   }
  
// }, [screen]);

const dateTimePickerHeight = 216; // Approximate height of the DateTimePicker

  if (nameEntered && stateEntered && dateEntered && screen === 'complete') {
    return (
      <Animated.View style={[styles.container, screenAnimation, backScreenAnimation]}>
        
        
        <Text style={styles.welcome}>congrats</Text>
        <Text style={styles.title}>you're ready to roll.</Text>

        <View style={styles.sideBySide}>
          <Pressable
            style={styles.backButtonSmall}
            onPress={handleBackPress}
            disabled={false}
          >
            <Text style={styles.buttonText}>back</Text>
          </Pressable>

          <View style={styles.emptySpaceSmall}></View>

          <Pressable
            style={styles.saveButtonSmall}
            onPress={ () => {saveButtonScale.value = 0.8;
              setIsButtonClicked(true);
              setIsAnimating(true);}}
            disabled={false}
          >
            <Text style={styles.buttonText}>let's go</Text>
          </Pressable>

          <View style={styles.emptySpaceSmall}></View>
        </View>
      </Animated.View>
    );
  }

  if (nameEntered && stateEntered && dateEntered && screen === 'location') {
    return (
      <Animated.View style={[styles.container, screenAnimation, backScreenAnimation]}>
        
        <Text style={styles.title}>{locationText}</Text>
        <Text style={styles.title}>{(locationText === "Please enable location services.") ? "Location will be used to determine weather, estimate speed, and visually log drives on a map." : "To update location permissions, go to the Settings app."}</Text>
        
        <Pressable
          style={[styles.saveButton]}
          onPress={requestLocationPermission}
          disabled={false}
        >
          <Text style={styles.buttonText}>{locationButtonText}</Text>
        </Pressable>

        <Pressable
          style={styles.backButton}
          onPress={handleBackPress}
          disabled={false}
        >
          <Text style={styles.buttonText}>back</Text>
        </Pressable>
      </Animated.View>
    );
  }

  if (nameEntered && stateEntered && dateEntered && screen === 'parentEmail') {
    return (
      <Animated.View style={[styles.container, screenAnimation, backScreenAnimation]}>
        
        <Text style={styles.title}>Please enter a parent's email for optional weekly practice reports.</Text>
        <Text style={styles.error}>{showEmailError ? "Please enter a valid email." : ""}</Text>
        <TextInput
          style={styles.textInput}
          value={inputValue}
          returnKeyType={'done'}
          onChangeText={handleInputChange}
          placeholder="Enter email"
          placeholderTextColor="#888"
          onSubmitEditing={handleParentEmailSave}
        />
         <Animated.View style={[styles.sideBySide, saveButtonAnimation]}>
        <Pressable
          style={[styles.saveButton, isButtonDisabled && styles.disabledButton, saveButtonAnimation]}
          onPress={ () => {
            handleParentEmailSave();
            setIsButtonClicked(true); 
          }}
          disabled={isButtonDisabled}
        >
          <Text style={styles.buttonText}>save</Text>
        </Pressable>
        </Animated.View>

        <View style={styles.emptySpaceSmall}></View>

        <View style={styles.sideBySide}>
          <Pressable
            style={styles.backButtonSmall}
            onPress={handleBackPress}
            disabled={false}
          >
            <Text style={styles.buttonText}>back</Text>
          </Pressable>

          <View style={styles.emptySpaceSmall}></View>

          <Pressable
            style={styles.backButtonSmall}
            onPress={handleParentEmailSkip}
            disabled={false}
          >
            <Text style={styles.buttonText}>skip</Text>
          </Pressable>

          <View style={styles.emptySpaceSmall}></View>
        </View>
      </Animated.View>
    );
  }

  if (nameEntered && stateEntered && screen === 'birthDate') {
    return (
      <Animated.View style={[styles.container, screenAnimation, backScreenAnimation]}>
        <Text style={styles.title}>Please enter your date of birth.</Text>
        
        {Platform.OS === 'android' && (
          <Pressable onPress={() => setShowDatePicker(true)}>
            <Text style={styles.dateTextInput}>
              {selectedDate.toLocaleDateString() === new Date().toLocaleDateString() ? 'Select a date' : selectedDate.toLocaleDateString()}
            </Text>
          </Pressable>
        )}

        {(showDatePicker) && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'default' : 'spinner'}
            
            maximumDate={new Date(new Date().getFullYear() - 13, new Date().getMonth(), new Date().getDate())}
            minimumDate={new Date(new Date().getFullYear() - 100, new Date().getMonth(), new Date().getDate())}
            onChange={handleDateChange}
            
          />
        )}

        <View style={styles.emptySpaceSmall}></View>
        

        <View style={styles.sideBySide}>
          <Pressable
            style={styles.backButtonSmall}
            onPress={handleBackPress}
            disabled={false}
          >
            <Text style={styles.buttonText}>back</Text>
          </Pressable>

          <View style={styles.emptySpaceSmall}></View>

          <Animated.View style={[styles.saveButtonSmall, isButtonDisabled && styles.disabledButton, saveButtonAnimation]}>
            <Pressable
              onPress={() => {
                saveButtonScale.value = 0.8;
                setIsButtonClicked(true);
                //setIsAnimating(true);
                handleBirthdateSave();
              }}
              disabled={isButtonDisabled}
            >
              <Text style={styles.buttonText}>save</Text>
            </Pressable>
          </Animated.View>
        </View>

        <Text style={styles.error}>{showDateError ? "Please enter a valid date." : ""}</Text>
      </Animated.View>
    );
  }

  if (nameEntered && screen === 'state') {
    return (
      <>
      
      <Animated.View style={[styles.container, screenAnimation, backScreenAnimation]}>
      
      <View style={styles.emptySpaceSmall}></View>
        <Text style={styles.title}>Which state do you live in?</Text>
        <Picker
          selectedValue={selectedState}
          style={styles.picker}
          onValueChange={(itemValue) => {
        setSelectedState(itemValue);
        setIsButtonDisabled(itemValue.trim() === '');
          }}
        >
          <Picker.Item label="Select your state" value="" />
          {states.map((state) => (
        <Picker.Item key={state} label={state} value={state} />
          ))}
        </Picker>
        {Platform.OS === 'ios' ? (
          <View style={styles.emptySpaceLarge}></View>
        ) : (
          <View style={styles.emptySpaceSmall}></View>
        )}
        

        <View style={isAnimating ? styles.sideBySideAnimating : styles.sideBySide}>


          <Pressable
        style={styles.backButtonSmall}
        onPress={handleBackPress}
        disabled={false}
          >
        <Text style={styles.buttonText}>back</Text>
          </Pressable>


          <View style={styles.emptySpaceSmall}></View>


          <Animated.View style={[styles.saveButtonSmall, isButtonDisabled && styles.disabledButton, saveButtonAnimation]}>
            <Pressable
              
              onPress={() => {
                saveButtonScale.value = 0.8;
                setIsButtonClicked(true);
                //setIsAnimating(true);
                handleStateSave();
              }}
              disabled={isButtonDisabled}
            >
              <Text style={styles.buttonText}>save</Text>
            </Pressable>
          </Animated.View>


        </View>
      </Animated.View>
      </>
    );
  }

  if (screen === 'name') {
    return (
      <>
      
      <Animated.View style={[styles.container, screenAnimation]}>
      
      <View style={styles.emptySpaceMedium}></View>
        <Text style={styles.title}>Please enter your legal name.</Text>
        <TextInput
          style={styles.textInput}
          value={inputValue}
          returnKeyType={'done'}
          onChangeText={handleInputChange}
          placeholder="First Last"
          placeholderTextColor="#888"
          onSubmitEditing={ () => {
            handleNameSave();
            setIsButtonClicked(true); 
          }} 
        />
        <Animated.View style={[styles.sideBySide, saveButtonAnimation]}>
            <Pressable
            style={[styles.saveButton, isButtonDisabled && styles.disabledButton]}
            onPress={() => {
                handleNameSave(); // button scale value change is handled in handleNameSave because it needs to check if there's an error
                setIsButtonClicked(true); 
                
                
            }}
            disabled={isButtonDisabled}
            >
            <Text style={styles.buttonText}>save</Text>
            </Pressable>
        </Animated.View>
        <Text style={styles.error}>{showNameError ? "Please enter a first and last name." : ""}</Text>
      </Animated.View>
      </>
    );
  }

  if (screen === 'welcome') {
    return (
      
      
      
      <Animated.View style={[styles.container, screenAnimation]}>
        
        <Text style={styles.welcome}>welcome</Text>
        <Text style={styles.header}>to set up your driving log,</Text>
        <Text style={styles.header}>we need some quick info.</Text>
        <Animated.View style={[styles.sideBySide, saveButtonAnimation]}>
        <Pressable
          
          style={styles.saveButton}
          onPress={() => {
             
            setIsButtonClicked(true); 
            saveButtonScale.value = 0.8;
          }}
          disabled={false}
        >
          <Text style={styles.buttonText}>continue</Text>
        </Pressable>
        </Animated.View>
      </Animated.View>
      
      
    );
  }
};

export default UserData;
