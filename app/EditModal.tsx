import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

interface EditModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (targetValue: string, rowIndex: number, colIndex: number) => void;
  rowIndex: number;
  colIndex: number;
}

const EditModal: React.FC<EditModalProps> = ({ visible, onClose, onSave, rowIndex, colIndex }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSave = () => {
    onSave(inputValue, rowIndex, colIndex);
    onClose();
  };

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalText}>Edit Item</Text>
          <TextInput
            style={styles.textInput}
            value={inputValue}
            onChangeText={setInputValue}
            placeholder="Enter new value"
            placeholderTextColor="#888"
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.modalButton} onPress={onClose}>
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={handleSave}>
              <Text style={styles.modalButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
  textInput: {
    backgroundColor: '#555',
    color: '#fff',
    padding: 10,
    borderRadius: 5,
    width: '80%',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
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
});

export default EditModal;
