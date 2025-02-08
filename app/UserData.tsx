import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Keyboard } from 'react-native';
import { getItem, setItem, removeItem, getAllItems } from './AsyncStorage';
import Multiselect from 'multiselect-react-dropdown';
import Select from 'react-select';

const UserData = () => {
  const [inputValue, setInputValue] = useState('');
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [nameEntered, setNameEntered] = useState(false); // Use state for nameEntered
  const [stateEntered, setStateEntered] = useState(false);
  const [screen, setScreen] = useState('welcome'); // Use state for screen
  const [showNameError, setShowNameError] = useState(false);
  let states: string[] = ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"];

  useEffect(() => {
    checkFirstTime();
  }, []);

  async function checkFirstTime() {
    removeItem('firstTime');
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
    setInputValue(text);
    setIsButtonDisabled((text.trim() === '') || (text === null));
  }

  function handleContinue() {
    setScreen('name');
  }

  async function handleNameSave() {
    if (inputValue.trim() !== '') {

      if (inputValue.split(' ').length == 2) {
      setNameEntered(true); // Update state
      await setItem('userData', { name: inputValue });
      await setItem('firstTime', 'false');
      console.log(await getAllItems());
      setInputValue("");
      setScreen('state');
      console.log(screen);
      setIsButtonDisabled(true);
      }

      else {
        setShowNameError(true);
      }
    }
  }

  

  async function handleStateSave() {
    if (inputValue.trim() !== '') {
      setStateEntered(true); // Update state
      const tempData = await getItem("userData");
      if (tempData) {
        tempData.state = inputValue;
        setItem("userData", tempData);
      }
      console.log(tempData);
      console.log(await getAllItems());

      setIsButtonDisabled(true);
    }
  }

  async function handleBack() {
    console.log(screen);
    if (screen === 'state') {
      setScreen('name');
      const value = await getItem("userData");
      if (value) {
        console.log(value.name);
        setInputValue(value.name);
      }
      setNameEntered(false);
      setIsButtonDisabled(false);
    }
  }

  if (nameEntered && screen === 'state') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Which state do you live in?</Text>
        

        

<Select
    
    options={states.map((state) => ({ value: state, label: state }))}
    placeholder="Select your state"
    blurInputOnSelect={true}
  />

        <TouchableOpacity
          style={[styles.saveButton, isButtonDisabled && styles.disabledButton]}
          onPress={handleStateSave}
          disabled={isButtonDisabled}
        >
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>

        <View style={styles.emptySpaceSmall}></View>

        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          disabled={false}
        >
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (screen === 'name') {
    return (
      <View style={styles.container}>
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
        <TouchableOpacity
          style={[styles.saveButton, isButtonDisabled && styles.disabledButton]}
          onPress={handleNameSave}
          disabled={isButtonDisabled}
        >
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
        <Text style={styles.error}>{showNameError ? "Please enter a first and last name." : ""}</Text>
      </View>
    );
  }

  if (screen === 'welcome') {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>welcome</Text>
        <Text style={styles.header}>to set up your requirements,</Text>
        <Text style={styles.header}>we need some quick info.</Text>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleContinue}
          disabled={false}
        >
          <Text style={styles.buttonText}>continue</Text>
        </TouchableOpacity>
        
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  welcome: {
    color: '#000',
    fontSize: 50,
    textAlign: 'center',
  },
  header: {
    color: '#000',
    fontSize: 24,
    margin: 5,
    textAlign: 'center',
  },
  title: {
    color: '#000',
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  error: {
    color: 'red',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  textInput: {
    backgroundColor: '#555',
    color: '#fff',
    padding: 10,
    height: 45,
    borderRadius: 5,
    width: '80%',
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
    margin: 10,
  },
  backButton: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#555',
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
  },
  emptySpaceSmall: {
    height: 20,
  }
});

export default UserData;
