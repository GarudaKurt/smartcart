import React, { useState, useEffect } from "react";
import { Text, StyleSheet, View, Pressable, Dimensions, Alert, Modal, TextInput, Button, ScrollView } from "react-native";
import { FontFamily, Color, Padding } from "../GlobalStyles";
import { Card, Title, Paragraph } from "react-native-paper";
import { BarCodeScanner } from 'expo-barcode-scanner';
import QRCode from 'react-native-qrcode-svg';

import { db } from './firebaseConfig';
import { collection, query, where, getDocs, doc,addDoc, updateDoc } from 'firebase/firestore';
import { update } from "firebase/database";

  const { width } = Dimensions.get("window");

  const EventCard = ({ event }) => {
    return (
      <View style={[styles.cardContainer, styles.cardAd]}>
        <Card>
          <Card.Content>
            <Paragraph>Barcode: {event.barcode}</Paragraph>
            <Paragraph>Name: {event.name}</Paragraph>
            <View style={styles.qtyContainer}>
              <Paragraph>Qty: {event.quantity}</Paragraph>
            </View>
            <Paragraph>Price: {event.price}</Paragraph>
          </Card.Content>
        </Card>
      </View>
    );
  };

 const Cashier = () => {
    const [hasPermission, setHasPermission] = useState(null);
    const [scanned, setScanned] = useState(false);
    const [scannedData, setScannedData] = useState(null); // State to store scanned data
    const [showModal, setShowModal] = useState(false);
    const [barcode, setBarcode] = useState('');
    const [name, setName] = useState('');
    const [quantity, setQuantity] = useState(0);
    const [price, setPrice] = useState(0);
    const [isOrdered, setIsOrdered] = useState(false)
    const [payment, setPayment] = useState(0)
    const [total, setTotal] = useState(0)
    const [events, setEvents] = useState([]); // State variable for storing events

    useEffect(() => {
      (async () => {
        const { status } = await BarCodeScanner.requestPermissionsAsync();
        setHasPermission(status === 'granted');
      })();
    }, []);

    const handleBarCodeScanned = async ({ type, data }) => {
      try {
        setScannedData({ type, data });
        setScanned(false); // Hide the barcode scanner
    
        if (!data) {
          throw new Error('Scanned data is missing.');
        }
    
        const cartID = data; // Assuming `data` from barcode scan is the cartID
        const eventData = await fetchData(cartID); // Fetch data based on cartID
        
        if (eventData.length > 0) {
          setEvents(eventData); // Update events state with fetched data
          Alert.alert('Successfully scanned');
        } else {
          Alert.alert('No data found for this cartID.');
        }
      } catch (error) {
        Alert.alert('Error scanning barcode:', error.message);
      }
    };
    
            
    //when this being process I want this to store the results of fetching data to the EventCard() but now it was not able to display it why
    const handleAddProductPress = () => {
      setScanned(true); // Toggle scanned status to true to display the barcode scanner
      setIsOrdered(false)
    };

    useEffect(() => {
      if (scannedData && scannedData.data) {
        setBarcode(scannedData.data);
      }
    }, [scannedData]);

    const handleSubmit = () => {
      // Create a new event object with the entered data
 
      createData()
      // Clear the events array after successful order placement
      setEvents([]);
      setShowModal(false);
      Alert.alert("Succesfully paid!")
    };

    if (hasPermission === null) {
      return <Text>Requesting camera permission...</Text>;
    }
    if (hasPermission === false) {
      return <Text>No access to camera</Text>;
    }

    const fetchData = async (cartID) => {
      try {
        const querySnapshot = await getDocs(collection(db, "customer-cart"), where("cartID", "==", cartID));
        
        if (!querySnapshot.empty) {
          const eventData = [];
    
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            const cartData = data.cartData || []; // Extract cartData array, default to empty array if undefined
            eventData.push(...cartData); // Spread cartData into eventData array
          });
    
          return eventData;
        } else {
          console.log("No document found for cartID:", cartID);
          return []; // Return empty array if no document found
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        return []; // Return empty array if there's an error
      }
    };

    const createData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "customer-cart"));
    
        // Use Promise.all with map to await all update operations
        await Promise.all(querySnapshot.docs.map(async (doc) => {
          const cartId = doc.data();
    
          // Check if the barcode matches cartID
          if (barcode === cartId.cartID) {
            const docRef = doc.ref; // Get the document reference
    
            // Update the document with new data
            await updateDoc(docRef, {
              customerPayment: payment
            });
    
            console.log("Document updated successfully:", doc.id);
          }
        }));
    
        console.log("All matching documents updated successfully");
      } catch (error) {
        console.error("Error updating documents:", error);
        throw new Error("Error updating documents: " + error.message);
      }
    };
    
    const totalPrice = () => {  
      let total = 0;
      events.forEach(event => {
        total += parseInt(event.price)
      });
      return total;
    };

    const placeOrder = async () => {
      setShowModal(true)
    };

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
              <Text style={styles.title}>Cashier Cart</Text>
              <Card style={styles.card}>
                <ScrollView contentContainerStyle={styles.scrollContainer} vertical={true}>
                  <Card.Content>
                      <Title>My Cart</Title>
                      {events.map((event, index) => (
                      <EventCard key={index} event={event} />
                      ))}
                  </Card.Content>
                  <Title>Total: {totalPrice()} </Title>
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
                    style={[styles.input, quantity === '' || !/^\d+$/.test(quantity) ? styles.invalidInput : null]}
                    placeholder="Enter payment amount"
                    onChangeText={text => setPayment(text)}
                    value={payment ? payment.toString() : ""}
                  />
                  <Button title="Submit" onPress={handleSubmit} />
                  <Pressable style={[styles.cancelButton]} onPress={() => setShowModal(false)}>
                    <Text style={styles.cancelText}>Cancel</Text>
                  </Pressable>
                </View>
              </View>
            </Modal>
            <View style={styles.bottomSection}>
              <Pressable style={styles.submitButton} onPress={placeOrder}>
                <Text style={styles.submitText}>Enter Payment</Text>
              </Pressable>
              <Pressable style={styles.submitOrder} onPress={handleAddProductPress}>
                <Text style={styles.submitCart}>Scan QR</Text>
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
      marginBottom: 5,
    },
    submitText: {
      fontSize: 20,
      fontFamily: "sans-serif",
      color: Color.colorWhite,
    },
    submitCart: {
      fontSize: 20,
      fontFamily: "sans-serif",
      color: Color.colorBlack,
    },
    submitOrder: {
      width: width - 40,
      borderRadius: 5,
      backgroundColor: Color.colorWhite,
      borderWidth: 1,
      borderColor: Color.colorBlack,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: Padding.p_7xs,
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
    buttonTextInc: {
      color: "green",
      fontSize: 20,
      fontFamily: "sans-serif",
    },
    buttonTextDec: {
      color: "red",
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
    }
  });
export default Cashier;