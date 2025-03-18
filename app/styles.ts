import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  higherContainer: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  sideBySide: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  sideBySideAnimating: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    position: 'relative',
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
    margin: 20,
    textAlign: 'center',
  },
  error: {
    color: 'red',
    fontSize: 16,
    margin: 10,
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
  dateTextInput: {
    backgroundColor: '#555',
    fontSize: 20,
    color: '#fff',
    padding: 10,
    height: 45,
    borderRadius: 5,
    width: '80%',
    marginBottom: 20,
  },
  picker: {
    height: 70,
    width: '80%',
    margin: 10,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
    margin: 10,
  },
  saveButtonSmall: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    marginLeft: 10,
    marginRight: 10,
    width: '37.5%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  backButton: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  backButtonSmall: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 10,
    marginLeft: 10,
    marginRight: 10,
    width: '37.5%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
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
  },
  emptySpaceMedium: {
    height: 100,
  },
  emptySpaceLarge: {
    height: 150,
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
  biggertext: {
    fontSize: 45,
  },
  linkText: {
    fontSize: 18,
    color: "#007AFF",
    marginTop: 20,
  },
  progressBar: {
    
    margin: 'auto',
    
  },

  
  
    
    text: {
      fontSize: 32,
    },
    
});
