import React, { useEffect, useState } from 'react';
import { Text, Button, View, StyleSheet } from 'react-native';
import { getItem, clear } from './AsyncStorage';
import { Link } from 'expo-router';

function refreshData(setData: React.Dispatch<React.SetStateAction<string | null>>) {
  getItem("driveData").then(items => {
    let data = JSON.stringify(items);
    for (let i = 0; i < data.length; i++) {
      if (data[i] === "[" || data[i] === "]" || data[i] === "{") {
        data = data.substring(0, i) + data.substring(i + 1);
        i--; // Adjust index to account for removed character
      }
      if (data[i] === "}") {
        data = data.substring(0, i) + "\n\n" + data.substring(i + 1);
      }
      if (data[i] === ",") {
        data = data.substring(0, i) + "  " + data.substring(i + 1);
      }
    }
    setData(data);
    if (data === "null") {
      setData("No data to display");
    }
  });
}

function clearAndRefresh(setData: React.Dispatch<React.SetStateAction<string | null>>) {
  clear().then(() => refreshData(setData));
}


export default function LogScreen() {
  const [data, setData] = useState<string | null>(null);

  useEffect(() => {
    refreshData(setData);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Log screen</Text>
      <br></br>
      <Text style={styles.text}>{data}</Text>
      <br></br>
      <Button title="Clear Data" onPress={() => clearAndRefresh(setData)} />
      <br></br>
      <Link href="/" style={styles.text}>
              Back
            </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
  },
});