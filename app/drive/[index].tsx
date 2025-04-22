import { styles } from '../styles';
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, Pressable, Keyboard, Dimensions, useWindowDimensions, Platform } from 'react-native';
import { getItem, setItem, removeItem, getAllItems, clear } from '../AsyncStorage';
import {Picker} from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
//import type { DriveData } from "./index";


import { useLocalSearchParams } from 'expo-router';

export default function DrivePage() {
  const { index } = useLocalSearchParams();

  return (
    <Text>Opening drive #{index}</Text>
  );
}