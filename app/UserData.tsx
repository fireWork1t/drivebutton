import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Keyboard, Platform } from 'react-native';
import { getItem, setItem, removeItem, getAllItems } from './AsyncStorage';
import {Picker} from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation
import Animated, { Easing, useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { router } from 'expo-router';
import { styles } from './styles'; // Import styles

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const UserData = () => {
  const navigation = useNavigation(); // Initialize navigation
  const [inputValue, setInputValue] = useState('');
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [nameEntered, setNameEntered] = useState(false); // Use state for nameEntered
  const [stateEntered, setStateEntered] = useState(false);
  const [dateEntered, setDateEntered] = useState(false);
  
  const [screen, setScreen] = useState('welcome'); // Use state for screen
  const [showNameError, setShowNameError] = useState(false);
  const [showDateError, setShowDateError] = useState(false);
  const [showEmailError, setShowEmailError] = useState(false);
  const [selectedState, setSelectedState] = useState(''); // Use state for selected state
  const [selectedDate, setSelectedDate] = useState(new Date()); // Use state for selected state
 const [buttonScaleTarget, setButtonScaleTarget] = useState(1);
  const [locationButtonText, setLocationButtonText] = useState('enable location'); // Use state for locationText
  const [locationText, setLocationText] = useState('Please enable location services.'); // Use state for locationText

  const states = [
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", 
    "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", 
    "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", 
    "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", 
    "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", 
    "West Virginia", "Wisconsin", "Wyoming"
  ];

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);

  const scaleConfig = {
    duration: 500,
    easing: Easing.bezier(0.5, 0.01, 0, 1),
  };

  const opacityConfig = {
    duration: 200,
    easing: Easing.linear,
  };

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.exp) });
    translateY.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.exp) });
  }, [screen]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
      
    };
  });
  

  const buttonScale = useSharedValue(1);

  const animatedButtonStyle = useAnimatedStyle(() => {
    
    return {
      scale: withTiming(buttonScaleTarget, scaleConfig, () => {
        if (buttonScaleTarget === 2) {
          setButtonScaleTarget(1);
        }
      }),
      opacity: withTiming(opacity.value, opacityConfig),
    };
    
  });

  const handleButtonPressIn = () => {
    setButtonScaleTarget(2);
    buttonScale.value = withTiming(0.9, { duration: 100 });
  };

  const handleButtonPressOut = () => {
    buttonScale.value = withTiming(1, { duration: 100 });
  };

  useEffect(() => {
    checkFirstTime();
  }, []);

  async function checkFirstTime() {
    //removeItem('firstTime');
    const firstTime = await getItem('firstTime');
    console.log(await getItem('firstTime'));
    if (!firstTime || firstTime == null) {
      console.log("First time");
      setScreen('welcome');
    } else {
      console.log("not first time USERDATA");
      
    }
  }

  function handleInputChange(text: string) {
    setInputValue(text);
    setIsButtonDisabled((text.trim() === '') || (text === null));
  }

  function handleContinue() {
    setScreenWithAnimation('name');
    
  }

  async function handleNameSave() {
    if (inputValue.trim() !== '') {
      if (inputValue.trim().split(' ').length == 2) {
        setNameEntered(true); // Update state
        await setItem('userData', { name: inputValue });
        
        console.log(await getAllItems());
        setInputValue("");
        setScreenWithAnimation('state');
        console.log(screen);
        setIsButtonDisabled(true);
      } else {
        setShowNameError(true);
      }
    }

    const checkData = await getItem('userData');

    if (checkData) {
        if (checkData.state)
        {
            setSelectedState(checkData.state);
            setStateEntered(true);
            setIsButtonDisabled(false);
            
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

        setScreenWithAnimation('birthDate');
      }
      console.log(tempData);
      console.log(await getAllItems());

      setIsButtonDisabled(true);
    }

    const checkData = await getItem('userData');

    if (checkData) {
        if (checkData.birthDate)
        {
            const stringDate = checkData.birthDate + "T08:00:00.000Z";
            console.log(stringDate);
            const dateObject: Date = new Date(stringDate);
            console.log(dateObject);

            setSelectedDate(dateObject);
            setIsButtonDisabled(false);

        }
  }
  }

  async function handleBirthdateSave() {
    if (selectedDate !== null) {
      const tempData = await getItem("userData");
      if (tempData) {
        tempData.birthDate = selectedDate;
        console.log(selectedDate);
        console.log(JSON.stringify(tempData.birthDate));
        tempData.birthDate = JSON.stringify(tempData.birthDate).substring(1, JSON.stringify(tempData.birthDate).indexOf('T'));
        setItem("userData", tempData);
        setDateEntered(true);
        setScreenWithAnimation("parentEmail");
      }
      console.log(await getItem("userData"));
      
    }



    const checkData = await getItem('userData');

    if (checkData) {
        if (checkData.parentEmail)
        {
            setInputValue(checkData.parentEmail);
            
            setIsButtonDisabled(false);
        }
  }
  }

  async function handleParentEmailSave() {
    if (inputValue.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      if (emailRegex.test(inputValue)) {
        const tempData = await getItem("userData");
        if (tempData)
        {
            tempData.parentEmail = inputValue;
            setItem("userData", tempData);
        }
        setNameEntered(true); // Update state
        
        
        console.log(await getAllItems());
        setInputValue("");
        setScreenWithAnimation('location');
        //console.log(screen);
        setIsButtonDisabled(true);
      } else {
        setShowEmailError(true);
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
    setInputValue("");
    setScreenWithAnimation('location');
    setIsButtonDisabled(true);
}

  async function handleBack() {
    console.log(screen);
    if (screen === 'state') {
      setScreenWithAnimation('name');
      const value = await getItem("userData");
      if (value) {
        setInputValue(value.name);
      }
      setNameEntered(false);
      setIsButtonDisabled(false);
    }
    if (screen === 'birthDate') {
        setScreenWithAnimation('state');
        const value = await getItem("userData");
        if (value) {
            setSelectedState(value.state);
        }
        setStateEntered(false);
        setIsButtonDisabled(false);
    }
    if (screen === 'parentEmail') {
        setScreenWithAnimation('birthDate');
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
        setScreenWithAnimation('parentEmail');
        const value = await getItem("userData");
        if (value) {
            setInputValue(value.parentEmail);
        }
        setIsButtonDisabled(false);
    }
    if (screen === 'complete') {
        setScreenWithAnimation('location');
        setIsButtonDisabled(false);
    }
}

async function requestLocationPermission() {
    if (locationButtonText != 'continue') {
    (await Location.requestForegroundPermissionsAsync()).canAskAgain = true;
    console.log((await Location.requestForegroundPermissionsAsync()).canAskAgain); // Reset location permission status
    const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
            setScreenWithAnimation('complete');
        } 
        else {
            console.log('Location permission not granted');
            setLocationButtonText('continue');
            setLocationText('Location permission not granted.');
        }
    }
    else {
        setScreenWithAnimation('complete');
    }
}

async function goHome() {
  await setItem('firstTime', 'false');
  router.replace('/log');
  router.replace('/');
}

function setScreenWithAnimation(newScreen: string) {
  opacity.value = 0;
  translateY.value = 50;
  
  setTimeout(() => {
    setScreen(newScreen);
    opacity.value = withTiming(1, { duration: 1000, easing: Easing.out(Easing.exp) });
    
    translateY.value = withTiming(0, { duration: 1000, easing: Easing.out(Easing.exp) });
  }, 500);
  
  
}

    if (nameEntered && stateEntered && dateEntered && screen === 'complete') {
        return (
        <Animated.View style={[styles.container, animatedStyle]}>
            <Text style={styles.welcome}>congrats</Text>
            <Text style={styles.title}>you're ready to roll.</Text>

            <View style={styles.sideBySide}>
        <AnimatedTouchableOpacity
        style={[styles.backButtonSmall, animatedButtonStyle]}
        onPress={handleBack}
        disabled={false} 
        onPressIn={handleButtonPressIn}
        onPressOut={handleButtonPressOut}
        >
        <Text style={styles.buttonText}>back</Text>
        </AnimatedTouchableOpacity>

        <View style={styles.emptySpaceSmall}></View>

        <AnimatedTouchableOpacity
          style={[styles.saveButtonSmall, animatedButtonStyle]}
          onPress={goHome}
          disabled={false}
          onPressIn={handleButtonPressIn}
          onPressOut={handleButtonPressOut}
        >
          <Text style={styles.buttonText}>let's go</Text>
        </AnimatedTouchableOpacity>

        <View style={styles.emptySpaceSmall}></View>
        
        </View>
        </Animated.View>
        );
    }

  if (nameEntered && stateEntered && dateEntered && screen === 'location') {
    return (
      <Animated.View style={[styles.container, animatedStyle]}>
        <Text style={styles.title}>{locationText}</Text>
        <Text style={styles.title}>{(locationText === "Please enable location services.") ? "Location will be used to determine weather, estimate speed, and visually log drives on a map." : "To update location permissions, go to the Settings app."}</Text>
        <AnimatedTouchableOpacity
          style={[styles.saveButton, animatedButtonStyle]}
          onPress={requestLocationPermission}
          disabled={false}
          onPressIn={handleButtonPressIn}
          onPressOut={handleButtonPressOut}
        >
          <Text style={styles.buttonText}>{locationButtonText}</Text>
        </AnimatedTouchableOpacity>
        <AnimatedTouchableOpacity
          style={[styles.backButton, animatedButtonStyle]}
          onPress={handleBack}
          disabled={false}
          onPressIn={handleButtonPressIn}
          onPressOut={handleButtonPressOut}
        >
          <Text style={styles.buttonText}>back</Text>
        </AnimatedTouchableOpacity>
      </Animated.View>
    );
  }

  if (nameEntered && stateEntered && dateEntered && screen === 'parentEmail') {
    return (
      <Animated.View style={[styles.container, animatedStyle]}>
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
        <AnimatedTouchableOpacity
          style={[styles.saveButton, isButtonDisabled && styles.disabledButton, animatedButtonStyle]}
          onPress={handleParentEmailSave}
          disabled={isButtonDisabled}
          onPressIn={handleButtonPressIn}
          onPressOut={handleButtonPressOut}
        >
            <Text style={styles.buttonText}>save</Text>
        </AnimatedTouchableOpacity>
        <View style={styles.emptySpaceSmall}></View>
        <View style={styles.sideBySide}>
        <AnimatedTouchableOpacity
        style={[styles.backButtonSmall, animatedButtonStyle]}
        onPress={handleBack}
        disabled={false}
        onPressIn={handleButtonPressIn}
        onPressOut={handleButtonPressOut}
        >
        <Text style={styles.buttonText}>back</Text>
        </AnimatedTouchableOpacity>
        <View style={styles.emptySpaceSmall}></View>
        <AnimatedTouchableOpacity
          style={[styles.backButtonSmall, animatedButtonStyle]}
          onPress={handleParentEmailSkip}
          disabled={false}
          onPressIn={handleButtonPressIn}
          onPressOut={handleButtonPressOut}
        >
          <Text style={styles.buttonText}>skip</Text>
        </AnimatedTouchableOpacity>
        <View style={styles.emptySpaceSmall}></View>
        </View>
        </Animated.View>
    );
  }

  if (nameEntered && stateEntered && screen === 'birthDate') {
    return (
      <Animated.View style={[styles.container, animatedStyle]}>
        <Text style={styles.title}>Please enter your date of birth.</Text>
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="spinner"
          maximumDate={new Date(new Date().getFullYear() - 13, new Date().getMonth(), new Date().getDate())}
          minimumDate={new Date(new Date().getFullYear() - 100, new Date().getMonth(), new Date().getDate())}
          
          onChange={(event, date) => {
            if (date) {
              setSelectedDate(date);
              setIsButtonDisabled(false);
            } else {
              setIsButtonDisabled(true);
            }
          }}
        />
        <View style={styles.sideBySide}>
        <AnimatedTouchableOpacity
          style={[styles.backButtonSmall, animatedButtonStyle]}
          onPress={handleBack}
          disabled={false}
          onPressIn={handleButtonPressIn}
          onPressOut={handleButtonPressOut}
        >
          <Text style={styles.buttonText}>back</Text>
        </AnimatedTouchableOpacity>
        <View style={styles.emptySpaceSmall}></View>
        <AnimatedTouchableOpacity
          style={[styles.saveButtonSmall, animatedButtonStyle]}
          onPress={handleBirthdateSave}
          disabled={false}
          onPressIn={handleButtonPressIn}
          onPressOut={handleButtonPressOut}
        >
          <Text style={styles.buttonText}>save</Text>
        </AnimatedTouchableOpacity>
        </View>
        <Text style={styles.error}>{showDateError ? "Please enter a valid date." : ""}</Text>
      </Animated.View>
    );
  }

  if (nameEntered && screen === 'state') {
    return (
      <Animated.View style={[styles.container, animatedStyle]}>
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
        {Platform.OS === 'android' ? (
          <View style={styles.emptySpaceSmall}></View>
        ) : (
          <View style={styles.emptySpaceLarge}></View>
        )}
        <View style={styles.sideBySide}>
        <AnimatedTouchableOpacity
          style={[styles.backButtonSmall, animatedButtonStyle]}
          onPress={handleBack}
          disabled={false}
          onPressIn={handleButtonPressIn}
          onPressOut={handleButtonPressOut}
        >
          <Text style={styles.buttonText}>back</Text>
        </AnimatedTouchableOpacity>
        <View style={styles.emptySpaceSmall}></View>
        <AnimatedTouchableOpacity
          style={[styles.saveButtonSmall, animatedButtonStyle]}
          onPress={handleStateSave}
          disabled={false}
          onPressIn={handleButtonPressIn}
          onPressOut={handleButtonPressOut}
        >
          <Text style={styles.buttonText}>save</Text>
        </AnimatedTouchableOpacity>
        </View>
      </Animated.View>
    );
  }

  if (screen === 'name') {
    return (
      <Animated.View style={[styles.container, animatedStyle]}>
        <Text style={styles.title}>Please enter your legal name.</Text>
        <TextInput
          style={styles.textInput}
          value={inputValue}
          returnKeyType={'done'}
          onChangeText={handleInputChange}
          placeholder="First Last"
          placeholderTextColor="#888"
          onSubmitEditing={handleNameSave} // Call handleNameSave on Enter key press
        />
        <AnimatedTouchableOpacity
          style={[styles.saveButton, isButtonDisabled && styles.disabledButton, animatedButtonStyle]}
          onPress={handleNameSave}
          disabled={isButtonDisabled}
          onPressIn={handleButtonPressIn}
          onPressOut={handleButtonPressOut}
        >
          <Text style={styles.buttonText}>save</Text>
        </AnimatedTouchableOpacity>
        <Text style={styles.error}>{showNameError ? "Please enter a first and last name." : ""}</Text>
      </Animated.View>
    );
  }

  if (screen === 'welcome') {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>welcome</Text>
        <Text style={styles.header}>to set up your requirements,</Text>
        <Text style={styles.header}>we need some quick info.</Text>
        <AnimatedTouchableOpacity
          style={[styles.saveButton, animatedButtonStyle]}
          onPress={handleContinue}
          disabled={false}
          onPressIn={handleButtonPressIn}
          onPressOut={handleButtonPressOut}
        >
          <Text style={styles.buttonText}>continue</Text>
        </AnimatedTouchableOpacity>
      </View>
    );
  }
};

export default UserData;
