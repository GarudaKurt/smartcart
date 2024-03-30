import React, { useState, useEffect } from "react";
import { Text, StyleSheet, View, Pressable, Dimensions, Alert, Modal, TextInput, Button, ScrollView } from "react-native";
import { FontFamily, Color, Padding } from "../GlobalStyles";
import { Card, Title, Paragraph } from "react-native-paper";
import { BarCodeScanner } from 'expo-barcode-scanner';

const { width } = Dimensions.get("window");

const EventCard = ({ event }) => (
  <View style={[styles.cardContainer, styles.cardAd]}>
    <Card>
      <Card.Content>
        <Paragraph>Barcode: {event.barcode}</Paragraph>
        <Paragraph>Name: {event.name}</Paragraph>
        <Paragraph>Qty: {event.quantity}</Paragraph>
        <Paragraph>Price: {event.price}</Paragraph>
      </Card.Content>
    </Card>
  </View>
);

export const Admin = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [scannedData, setScannedData] = useState(null); // State to store scanned data
  const [showModal, setShowModal] = useState(false);
  const [barcode, setBarcode] = useState('');
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [events, setEvents] = useState([]); // State variable for storing events

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScannedData({ type, data }); // Store scanned data
    Alert.alert(`Bar code with type ${type} and data ${data} has been scanned!`);
    setScanned(false); // Close the camera
    setShowModal(true); // Show the modal for adding product details
  };

  const handleAddProductPress = () => {
    setScanned(true); // Toggle scanned status to true to display the barcode scanner
  };

  const handleSubmit = () => {
    // Create a new event object with the entered data
    const newEvent = {
      barcode: barcode,
      name: name,
      quantity: quantity,
      price: price,
    };

    // Add the new event to the events array
    setEvents([...events, newEvent]);

    // Reset the input fields and close the modal
    setBarcode('');
    setName('');
    setQuantity('');
    setPrice('');
    setShowModal(false);
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
            <Text style={styles.title}>Inventory</Text>
            <Text>{scannedData ? `Type: ${scannedData.type}, Data: ${scannedData.data}` : 'Scan a barcode'}</Text>
            <Card style={styles.card}>
              <ScrollView contentContainerStyle={styles.scrollContainer} vertical={true}>
                <Card.Content>
                    <Title>List of products</Title>
                    {events.map((event, index) => (
                    <EventCard key={index} event={event} />
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
                  onChangeText={text => setBarcode(scannedData.data)}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Name"
                  onChangeText={text => setName(text)}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Quantity"
                  onChangeText={text => setQuantity(text)}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Price"
                  onChangeText={text => setPrice(text)}
                />
                <Button title="Submit" onPress={handleSubmit} />
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
    paddingVertical: Padding.p_7xs,
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
  }
});
