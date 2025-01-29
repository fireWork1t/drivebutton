import React, { useEffect, useState } from 'react';
import { Text, Button, View, StyleSheet, TouchableOpacity, Modal, Animated, ScrollView } from 'react-native';
import { getItem, clear, setItem } from './AsyncStorage';
import { Link } from 'expo-router';



function refreshData(setData: React.Dispatch<React.SetStateAction<string[][]>>) {
  getItem("driveData").then(items => {
    if (items && items.length > 0) {

      const keys = Object.keys(items[0]);

      const data: string[][] = [keys];

      items.forEach((item: { [key: string]: any }) => {

        data.push(keys.map(key => {

          if (key === "date") {

            const date = new Date(item[key]);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

          } 
          
          else if (key === "duration") {

            const duration = item[key];

            if (duration >= 3600) {
              const hours = Math.floor(duration / 3600);
              const minutes = Math.round((duration % 3600) / 60);
              return `${hours} hr ${minutes} min`;
            } 
            else {
              const minutes = Math.round(duration / 60);
              return `${minutes} min`;
            }
          }
          return item[key].toString();
        }));
      });
      setData(data);
    } else {
      setData([["No data available"]]);
    }
  });
}



function clearAndRefresh(setData: React.Dispatch<React.SetStateAction<string[][]>>) {
  clear().then(() => refreshData(setData));
}



function deleteDrive(rowIndex: number, setData: React.Dispatch<React.SetStateAction<string[][]>>) {
  getItem("driveData").then(items => {
    if (items && items.length > 0) {
      items.splice(rowIndex - 1, 1); // Remove the item from the array
      setItem("driveData", items).then(() => refreshData(setData));
    }
  });
}




export default function LogScreen() {
  const [data, setData] = useState<string[][]>([["Loading..."]]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<string[] | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    refreshData(setData);
  }, []);

  const handleItemClick = (rowIndex: number, colIndex: number) => {
    // Blank function for now
    console.log(`Clicked item at row ${rowIndex}, column ${colIndex}`);
  };

  const handleDeletePress = (rowIndex: number, entry: string[]) => {
    setSelectedRow(rowIndex);
    setSelectedEntry(entry);
    setModalVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleDeleteConfirm = () => {
    if (selectedRow !== null) {
      deleteDrive(selectedRow, setData);
    }
    setModalVisible(false);
  };

  const handleDeleteCancel = () => {
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <br></br>
      <Text style={styles.text}>Driving Log</Text>
      <br></br>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {data.map((entry, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {entry.map((item, colIndex) => (
              <TouchableOpacity
                key={colIndex}
                style={styles.item}
                onPress={() => handleItemClick(rowIndex, colIndex)}
              >
                <Text style={styles.rowText}>{item}</Text>
              </TouchableOpacity>
            ))}
            {rowIndex > 0 && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeletePress(rowIndex, entry)}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
       </ScrollView>
      <View style={styles.buttonContainer}>
      <Link href="/" style={styles.text}>
          Back
        </Link>
        <Button title="Clear Data" onPress={() => clearAndRefresh(setData)} />
        
      </View>
     <br></br>
      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="fade"
        onRequestClose={handleDeleteCancel}
      >
        <Animated.View style={[styles.modalBackground, { opacity: fadeAnim }]}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>Are you sure you want to delete this drive?</Text>
            {selectedEntry && (
              <View style={styles.modalEntryContainer}>
                {selectedEntry.map((item, index) => (
                  <View key={index} style={styles.modalEntryItem}>
                    <Text style={styles.modalEntryText}>{item}</Text>
                  </View>
                ))}
              </View>
            )}
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={handleDeleteCancel}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.modalDeleteButton]} onPress={handleDeleteConfirm}>
                <Text style={[styles.modalButtonText, styles.modalDeleteButtonText]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </Modal>
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
    fontSize: 20,
  },
  button: {
    margin: 10
  },
  scrollViewContent: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  row: {
    backgroundColor: '#444',
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
    width: '90%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  item: {
    backgroundColor: '#555',
    padding: 10,
    margin: 5,
    borderRadius: 10,
  },
  rowText: {
    color: '#fff',
    fontSize: 20,
  },
  deleteButton: {
    backgroundColor: 'red',
    padding: 10,
    margin: 5,
    borderRadius: 10,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '90%',
    marginTop: 20,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#424242',
    padding: 20,
    margin: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    color: '#fff',
    fontSize: 28,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalEntryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  modalEntryItem: {
    backgroundColor: '#555',
    padding: 10,
    margin: 5,
    borderRadius: 10,
  },
  modalEntryText: {
    color: '#fff',
    fontSize: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    borderRadius: 10,
  },
  modalButton: {
    backgroundColor: '#888',
    padding: 15,
    margin: 5,
    borderRadius: 10,
    width: '40%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 20,
  },
  modalDeleteButton: {
    backgroundColor: 'red',
  },
  modalDeleteButtonText: {
    color: '#fff',
  },
});
