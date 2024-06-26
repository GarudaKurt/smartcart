import React, { useState, useEffect } from "react";
import { Text, StyleSheet, View, Pressable, Dimensions, Alert, Modal, TextInput, Button, ScrollView } from "react-native";
import { FontFamily, Color, Padding } from "../GlobalStyles";
import { Card, Title, Paragraph } from "react-native-paper";
import { BarCodeScanner } from 'expo-barcode-scanner';
import Icon from 'react-native-vector-icons/FontAwesome';

import { db } from './firebaseConfig';
import { collection, query, where, getDocs, updateDoc, addDoc } from 'firebase/firestore';

const { width } = Dimensions.get("window");

const EventCard = ({ event, onUpdateQuantity }) => {
  const handleIncrease = async () => {
    const updatedQuantity = event.quantity + 1;
    try {
      // Update Firestore
      await updateQuantity(event.barcode, updatedQuantity);
      // Update UI state after Firestore update succeeds
      onUpdateQuantity({ ...event, quantity: updatedQuantity });
    } catch (error) {
      Alert.alert("Error updating!", error.message);
    }
  };

  const handleDecrease = async () => {
    const updatedQuantity = event.quantity - 1;
    try {
      // Update Firestore
      await updateQuantity(event.barcode, updatedQuantity);
      // Update UI state after Firestore update succeeds
      onUpdateQuantity({ ...event, quantity: updatedQuantity });
    } catch (error) {
      Alert.alert("Error updating!", error.message);
    }
  };

  const updateQuantity = async (barcode, newQuantity) => {
    try {
      const inventoryRef = collection(db, "inventory");
      const querySnapshot = await getDocs(query(inventoryRef, where("barcode", "==", barcode)));
      if (!querySnapshot.empty) {
        // If barcode exists in the inventory collection, update its quantity
        const docRef = querySnapshot.docs[0].ref;
        await updateDoc(docRef, { quantity: newQuantity });
      } else {
        // Barcode does not exist in the inventory collection
        console.log("Barcode does not exist in the inventory");
      }
    } catch (error) {
      throw error;
    }
  };

  return (
    <View style={[styles.cardContainer, styles.cardAd]}>
      <Card>
        <Card.Content>
          <Paragraph>Barcode: {event.barcode}</Paragraph>
          <Paragraph>Name: {event.name}</Paragraph>
          <View style={styles.qtyContainer}>
            <Paragraph>Qty: {event.quantity}</Paragraph>
            <View style={styles.buttonContainer}>
              <Pressable style={styles.btnInc} onPress={handleIncrease}>
                <Text style={styles.buttonText}> + </Text>
              </Pressable> 
              <Pressable style={styles.btnDec} onPress={handleDecrease}>
                <Text style={styles.buttonText}> - </Text>
              </Pressable>
            </View>
          </View>
          <Paragraph>Price: {event.price}</Paragraph>
        </Card.Content>
      </Card>
    </View>
  );
};

const Admin = ({navigation}) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('')
  const [modalVisible, setModalVisible] = useState(false)
  const [barcode, setBarcode] = useState('');
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [price, setPrice] = useState(0);
  const [events, setEvents] = useState([]);

  const logout = () =>{
    navigation.replace('Login')
  }
  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScannedData({ type, data }); // Store scanned data
    setScanned(false); // Close the camera
    setShowModal(true); // Show the modal for adding product details
  };

  const handleAddProductPress = () => {
    setScanned(true); // Toggle scanned status to true to display the barcode scanner
  };

  useEffect(() => {
    if (scannedData && scannedData.data) {
      setBarcode(scannedData.data);
    }
  }, [scannedData]);

  const createData = async () => {
    if(!barcode || !name || !quantity || !price) {
      setModalMessage("Please make sure all fields not empty!")
      setModalVisible(true)
      return
    }
    try {
      const docRef = await addDoc(collection(db, "inventory"), {
        barcode: barcode,
        name: name,
        quantity: quantity,
        price: price
      })
      setModalMessage("Succesfully created!")
      setModalVisible(true)
    } catch(e) {
      setModalMessage("Error creating data!",e)
      setModalVisible(true)
    }
  }

  const handleSubmit = () => {
    // Create a new event object with the entered data
    const newEvent = {
      barcode: barcode,
      name: name,
      quantity: quantity,
      price: price,
    };
    createData(); // Store to the Firestore DB
    // Add the new event to the events array
    setEvents([...events, newEvent]);
    // Reset the input fields and close the modal
    setBarcode('');
    setName('');
    setQuantity(0);
    setPrice(0);
    setShowModal(false);
  };

  const handleUpdateQuantity = async (index, newEvent) => {
    try {
      const updatedEvents = [...events];
      updatedEvents[index] = newEvent;
      setEvents(updatedEvents);
    } catch (error) {
      console.error("Error updating quantity in UI:", error);
    }
  };

  if (hasPermission === null) {
    return <Text>Requesting camera permission...</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      {scanned ? (
        <BarCodeScanner
          onBarCodeScanned={handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
      ) : (
        <View style={styles.frame}>
          <View style={styles.signInParent}>
           <Icon name="sign-out" size={20} color="black" style={{marginLeft:300}} onPress={logout} />
            <Text style={styles.title}>Inventory</Text>
            <Card style={styles.card}>
              <ScrollView contentContainerStyle={styles.scrollContainer} vertical={true}>
                <Card.Content>
                    <Title>List of products</Title>
                    {events.map((event, index) => (
                    <EventCard key={index} event={event} onUpdateQuantity={(newQuantity) => handleUpdateQuantity(index, newQuantity)} />
                    ))}
                </Card.Content>
              </ScrollView>
            </Card>
          </View>
          
          <Modal
            animationType="slide"
            transparent={true}
            visible={showModal}
            onRequestClose={() => setShowModal(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <TextInput
                  style={styles.input}
                  placeholder="Barcode"
                  value={barcode}
                  editable={false}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Name"
                  onChangeText={text => setName(text)}
                  value={name ? name : ""}
                />
                <TextInput
                  style={[styles.input, quantity === '' || !/^\d+$/.test(quantity) ? styles.invalidInput : null]}
                  placeholder="Quantity"
                  onChangeText={text => setQuantity(text)}
                  value={quantity ? quantity.toString() : ""}
                />
                <TextInput
                  style={[styles.input, price === '' || !/^\d+$/.test(price) ? styles.invalidInput : null]}
                  placeholder="Price"
                  onChangeText={text => setPrice(text)}
                  value={price ? price.toString() : ""}
                />
                <Button title="Submit" onPress={handleSubmit} />
                <Pressable style={[styles.cancelButton]} onPress={() => setShowModal(false)}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          </Modal>

          <View style={styles.bottomSection}>
            <Pressable style={styles.submitButton} onPress={handleAddProductPress}>
              <Text style={styles.submitText}>Add Product</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}
export default Admin;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#dfe4ea",
    paddingHorizontal: 20,
    paddingTop: 5,
    alignItems: "center",
  },
  frame: {
    width: "100%",
    alignItems: "center",
    paddingTop: 100,
    marginBottom: 15,
  },
  signInParent: {
    marginBottom: 15,
    alignItems: "center",
  },
  card: {
    width: width - 40, 
    height: "70%",
  },
  title: {
    fontSize: 40,
    fontWeight: "600",
    fontFamily: "sans-serif",
    color: Color.colorBlack,
    textAlign: "left",
    marginBottom: 30,
  },
  submitButton: {
    width: width - 40,
    borderRadius: 5,
    backgroundColor: Color.colorBlack,
    borderWidth: 1,
    borderColor: Color.colorWhite,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 5,
    marginBottom: 20,
  },
  submitText: {
    fontSize: 30,
    fontFamily: "sans-serif",
    color: Color.colorWhite,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  input: {
    height: 40,
    width: "80%",
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  cardContainer: {
    marginBottom: 10,
    marginRight: 10,
    borderBottomWidth: 1, // Add a bottom border to create horizontal lines
    borderBottomColor: '#ccc', // Color of the border
  },
  cardAd: {
    width: 200, // Set a fixed width for the cards
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginLeft: 5, // Adjust the spacing between the Qty paragraph and the buttons as needed
  },
  buttonText: {
    fontSize: 20,
    fontFamily: "sans-serif",
  },
  invalidInput: {
    borderColor: 'red',
  },
  cancelButton: {
    marginTop: 5,
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  cancelText: {
    color: 'black',
    fontSize: 16,
  },
  btnInc: {
    marginLeft: 70,
    borderWidth: 1,
    borderRadius: 3,
    borderColor: Color.colorBlack
  },
  btnDec: {
    marginLeft: 5,
    borderWidth: 1,
    borderRadius: 3,
    borderColor: Color.colorBlack
  }
});
