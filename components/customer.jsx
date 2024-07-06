import React, { useState, useEffect } from "react";
import { Text, StyleSheet, View, Pressable, Dimensions, Alert, Modal, TextInput, Button, ScrollView } from "react-native";
import { FontFamily, Color, Padding } from "../GlobalStyles";
import { Card, Title, Paragraph } from "react-native-paper";
import { BarCodeScanner } from 'expo-barcode-scanner';
import QRCode from 'react-native-qrcode-svg';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Picker } from "@react-native-picker/picker";

import { db } from './firebaseConfig';
import { realtimeDb } from "./firebaseConfig";
import { ref, onValue, off } from 'firebase/database';
import { collection, query, where, getDocs, updateDoc, doc, addDoc } from 'firebase/firestore';

const { width } = Dimensions.get("window");

const EventCard = ({ event, onUpdateQuantity }) => {
  if (!event || typeof event !== "object") {
    return null; // Handle invalid event data gracefully
  }

  const { barcode, name, quantity, price } = event;
  const [selectedCart, setSelectedCart] = useState("");

  return (
    <View style={[styles.cardContainer, styles.cardAd]}>
      <Card>
        <Card.Content>
          <Paragraph>Barcode: {barcode}</Paragraph>
          <Paragraph>Name: {name}</Paragraph>
          <View style={styles.qtyContainer}>
            <Paragraph>Qty: {quantity}</Paragraph>
            <View style={styles.buttonContainer}>
              <Pressable style={styles.btnInc} onPress={() => onUpdateQuantity(quantity + 1)}>
                <Text style={styles.buttonTextInc}> + </Text>
              </Pressable>
              <Pressable style={styles.btnDec} onPress={() => onUpdateQuantity(quantity - 1)}>
                <Text style={styles.buttonTextDec}> - </Text>
              </Pressable>
            </View>
          </View>
          <Paragraph>Price: {price}</Paragraph>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedCart}
              style={styles.picker}
              onValueChange={(itemValue) => setSelectedCart(itemValue)}
            >
              <Picker.Item label="Select Cart" value="" />
              <Picker.Item label="Cart#1" value="Cart#1" />
              <Picker.Item label="Cart#2" value="Cart#2" />
              <Picker.Item label="Cart#3" value="Cart#3" />
            </Picker>
          </View>
        </Card.Content>
      </Card>
    </View>
  );
};

const Customer = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [scannedData, setScannedData] = useState(null); // State to store scanned data
  const [showModal, setShowModal] = useState(false);
  const [barcode, setBarcode] = useState('');
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [price, setPrice] = useState(0);
  const [isOrdered, setIsOrdered] = useState(false);
  const [barcodeValue, setBarcodeValue] = useState('');
  const [events, setEvents] = useState([]); // State variable for storing events

  const logout = () => {
    navigation.replace('Login');
  };

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    createBarcodeId(); // Generate barcodeValue initially
  }, []);

  const createBarcodeId = () => {
    const uniqueNumbers = new Set();

    while (uniqueNumbers.size < 10) {
      const randomNumber = Math.floor(Math.random() * 10);
      uniqueNumbers.add(randomNumber);
    }

    let uniqueNumberString = '';
    uniqueNumbers.forEach(number => {
      uniqueNumberString += number;
    });
    console.log('[DEBUG] my barcode id are ', uniqueNumberString);
    setBarcodeValue(uniqueNumberString);
  };

  const fetchData = async () => {
    try {
      let isBarcodeExist = false;
      const querySnapshot = await getDocs(collection(db, "inventory"));

      querySnapshot.forEach((doc) => {
        const inventoryData = doc.data();

        // Ensure barcode is compared as strings
        if (barcode.toString() === inventoryData.barcode.toString()) {
          isBarcodeExist = true;
          setName(inventoryData.name);
          setPrice(inventoryData.price);
          console.log("[DEBUG] Value of name: ", inventoryData.name);
          console.log("[DEBUG] Value of price: ", inventoryData.price);
        }
      });

      if (!isBarcodeExist) {
        console.log('[DEBUG] barcode value invalid', barcode);
        //Alert.alert("Invalid barcode!");
      }
    } catch (error) {
      console.log("Something went wrong in fetch data!", error);
    }
  };

  useEffect(() => {
    const databaseRef = ref(realtimeDb, 'barcode');
    const getArduinoBcr = (snapshot) => {
      if (snapshot.exists()) {
        const getData = snapshot.val();
        let newData = getData.barcodeID;
        if (newData !== barcode) {
          console.log('[DEBUG] new data appear!', newData);
          setBarcode(newData);
        }
      }
    };

    const handleError = (error) => {
      console.error('Error fetching data:', error);
    };

    // Attach the listener to the database reference
    onValue(databaseRef, getArduinoBcr, handleError);

    // Cleanup function to remove the listener when component unmounts
    return () => {
      off(databaseRef, 'value', getArduinoBcr);
    };
  }, []);

  useEffect(() => {
    if (barcode !== '') {
      console.log('[DEBUG] value of bcr', barcode);
      setShowModal(true);
      fetchData();
    }
  }, [barcode]);

  const handleBarCodeScanned = ({ type, data }) => {
    setScannedData({ type, data });
    setScanned(false);
    setShowModal(true);
    setBarcode(data); // Set barcode first
  };

  const handleAddProductPress = () => {
    setScanned(true); // Toggle scanned status to true to display the barcode scanner
    setIsOrdered(false);
  };

  useEffect(() => {
    if (scannedData && scannedData.data) {
      setBarcode(scannedData.data);
    }
  }, [scannedData]);

  const handleSubmit = () => {
    // Create a new event object with the entered data
    const newEvent = {
      barcode: barcode,
      name: name,
      quantity: quantity,
      price: price,
    };
    fetchData();
    // Add the new event to the events array
    setEvents([...events, newEvent]);

    // Reset the input fields and close the modal
    setBarcode('');
    setName('');
    setQuantity(0);
    setPrice(0);
    setShowModal(false);
  };

  const handleUpdateQuantity = (index, newQuantity) => {
    const updatedEvents = [...events];
    updatedEvents[index].quantity = newQuantity;
    setEvents(updatedEvents);
  };

  if (hasPermission === null) {
    return <Text>Requesting camera permission...</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  const createData = async (cartItems) => {
    try {
      const docRef = await addDoc(collection(db, "customer-cart"), {
        cartData: cartItems,
        cartTotalprice: totalPrice(),
        cartID: barcodeValue
      });
      console.log("[DEBUG] Item added to Firestore:", docRef.id); // Log the document ID if needed
      console.log("[DEBUG] QR Code ID", barcodeValue);
    } catch (e) {
      throw new Error("Error creating data: " + e.message);
    }
  };

  const setQR = () => {
    if (isOrdered) {
      return <QRCode value={barcodeValue} size={200} />;
    }
    return null;
  };

  const placeOrder = async () => {
    try {
      // Prepare cart items array from events
      const cartItems = events.map(event => ({
        barcode: event.barcode,
        name: event.name,
        quantity: event.quantity,
        price: event.price
      }));

      // Call createData to store all cart items
      await createData(cartItems);
      // Clear the events array after successful order placement
      setEvents([]);
      Alert.alert("Order placed successfully!");
      setIsOrdered(true);
    } catch (error) {
      Alert.alert("Error placing order!", error.message);
    }
  };

  const totalPrice = () => {
    let total = 0;
    events.forEach(event => {
      total += event.price * event.quantity; // Multiply price by quantity for each item
    });
    return total;
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
            <Icon name="sign-out" size={20} color="black" style={{ marginLeft: 300 }} onPress={logout} />
            <Text style={styles.title}>Shopping Cart</Text>
            <Card style={styles.card}>
              <ScrollView contentContainerStyle={styles.scrollContainer} vertical={true}>
                <Card.Content>
                  <Title>My Cart</Title>
                  {events.map((event, index) => (
                    <EventCard key={index} event={event} onUpdateQuantity={(newQuantity) => handleUpdateQuantity(index, newQuantity)} />
                  ))}
                </Card.Content>
                <Title>Total: {totalPrice()} </Title>
                {isOrdered && (
                  <View style={styles.dislayQR}>
                    {setQR()}
                    <Text style={styles.title}>My order</Text>
                  </View>
                )}
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
                  value={barcode} //why was not able to display value to the TextInput ?
                  editable={false}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Name"
                  value={name.toString()}
                  editable={false}
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
                  value={price.toString()}
                  editable={false}
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
              <Text style={styles.submitText}>Add Cart</Text>
            </Pressable>
            <Pressable style={styles.submitOrder} onPress={placeOrder}>
              <Text style={styles.submitCart}>Place Order</Text>
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
    marginBottom: 80,
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
    borderBottomColor: "#ccc", // Color of the border
  },
  cardAd: {
    width: "100%", // Set width to 100% to make it responsive
  },
  qtyContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    marginLeft: 5, // Adjust the spacing between the Qty paragraph and the buttons as needed
  },
  buttonTextInc: {
    color: "green",
    fontSize: 20,
  },
  buttonTextDec: {
    color: "red",
    fontSize: 20,
  },
  pickerContainer: {
    marginTop: 10,
  },
  picker: {
    height: 50,
    width: "100%", // Set width to 100% to make it responsive
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
  },
  dislayQR: {
    alignItems: 'center'
  }
});
export default Customer;

import React, { useState, useEffect } from "react";
import { Text, StyleSheet, View, Pressable, Dimensions, Alert, Modal, TextInput, Button, ScrollView } from "react-native";
import { FontFamily, Color, Padding } from "../GlobalStyles";
import { Card, Title, Paragraph } from "react-native-paper";
import { BarCodeScanner } from 'expo-barcode-scanner';
import QRCode from 'react-native-qrcode-svg';
import Icon from 'react-native-vector-icons/FontAwesome';

import { db } from './firebaseConfig';
import { realtimeDb } from "./firebaseConfig";
import { ref, onValue, off } from 'firebase/database';
import { collection, query, where, getDocs, updateDoc, doc,addDoc } from 'firebase/firestore';

  const { width } = Dimensions.get("window");

  const EventCard = ({ event, onUpdateQuantity }) => {
    if (!event || typeof event !== 'object') {
      return null; // Handle invalid event data gracefully
    }
  
    const { barcode, name, quantity, price } = event;
  
    return (
      <View style={[styles.cardContainer, styles.cardAd]}>
        <Card>
          <Card.Content>
            <Paragraph>Barcode: {barcode}</Paragraph>
            <Paragraph>Name: {name}</Paragraph>
            <View style={styles.qtyContainer}>
              <Paragraph>Qty: {quantity}</Paragraph>
              <View style={styles.buttonContainer}>
                <Pressable style={styles.btnInc} onPress={() => onUpdateQuantity(quantity + 1)}>
                  <Text style={styles.buttonText}> + </Text>
                </Pressable> 
                <Pressable style={styles.btnDec} onPress={() => onUpdateQuantity(quantity - 1)}>
                  <Text style={styles.buttonText}> - </Text>
                </Pressable>
              </View>
            </View>
            <Paragraph>Price: {price}</Paragraph>
          </Card.Content>
        </Card>
      </View>
    );
  };
  
 const Customer = ({navigation}) => {
    const [hasPermission, setHasPermission] = useState(null);
    const [scanned, setScanned] = useState(false);
    const [scannedData, setScannedData] = useState(null); // State to store scanned data
    const [showModal, setShowModal] = useState(false);
    const [barcode, setBarcode] = useState('');
    const [name, setName] = useState('');
    const [quantity, setQuantity] = useState(0);
    const [price, setPrice] = useState(0);
    const [isOrdered, setIsOrdered] = useState(false)
    const [barcodeValue, setBarcodeValue] = useState('')
    const [events, setEvents] = useState([]); // State variable for storing events

    const logout = () =>{
      navigation.replace('Login')
    }
    useEffect(() => {
      (async () => {
        const { status } = await BarCodeScanner.requestPermissionsAsync();
        setHasPermission(status === 'granted');
      })();
    }, []);
  
    useEffect(() => {
      createBarcodeId(); // Generate barcodeValue initially
    }, [])
    const createBarcodeId = () => {
      const uniqueNumbers = new Set();
    
      while (uniqueNumbers.size < 10) {
        const randomNumber = Math.floor(Math.random() * 10);
        uniqueNumbers.add(randomNumber);
      }
    
      let uniqueNumberString = '';
      uniqueNumbers.forEach(number => {
        uniqueNumberString += number;
      });
      console.log('[DEBUG] my barcode id are ', uniqueNumberString)
      setBarcodeValue(uniqueNumberString)
    };

    const fetchData = async () => {
      try {
        let isBarcodeExist = false;
        const querySnapshot = await getDocs(collection(db, "inventory"));
    
        querySnapshot.forEach((doc) => {
          const inventoryData = doc.data();

          if (barcode === inventoryData.barcode) {
            isBarcodeExist = true;
            setName(inventoryData.name);
            setPrice(inventoryData.price);
            setBarcode('')
            console.log("[DEBUG] Value of name: ",inventoryData.name)
            console.log("[DEBUG] Value of price: ",inventoryData.price)
          }
        });

        if (!isBarcodeExist) {
          console.log('[DEBUG] barcode value invalid',barcode)
          //Alert.alert("Invalid barcode!");
        }
      } catch (error) {
        console.log("Something went wrong in fetch data!", error)
      }
    };

    useEffect(() => {
      const databaseRef = ref(realtimeDb, 'barcode');
      const getArduinoBcr = (snapshot) => {
        if (snapshot.exists()) {
          const getData = snapshot.val();
          let newData = getData.barcodeID
          if (newData !== barcode) {
            console.log('[DEBUG] new data appear!', newData)
            setBarcode(newData)
          }
        }
      };
    
      const handleError = (error) => {
        console.error('Error fetching data:', error);
      };
    
      // Attach the listener to the database reference
      onValue(databaseRef, getArduinoBcr, handleError);
    
      // Cleanup function to remove the listener when component unmounts
      return () => {
        off(databaseRef, 'value', getArduinoBcr);
      };
    }, []);

    useEffect(() => {
      if(barcode !== null) {
        console.log('[DEBUG] value of bcr', barcode);
        setShowModal(true);
        fetchData();
      }
    },[barcode])
    

    const handleBarCodeScanned = ({ type, data }) => {
      setScannedData({ type, data });
      setScanned(false);
      setShowModal(true);
      setBarcode(data); // Set barcode first
      fetchData(); // Fetch corresponding data
    };
    
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
      const newEvent = {
        barcode: barcode,
        name: name,
        quantity: quantity,
        price: price,
      };
      fetchData()
      // Add the new event to the events array
      setEvents([...events, newEvent]);

      // Reset the input fields and close the modal
      setBarcode('');
      setName('');
      setQuantity(0);
      setPrice(0);
      setShowModal(false);
    };

    const handleUpdateQuantity = (index, newQuantity) => {
      const updatedEvents = [...events];
      updatedEvents[index].quantity = newQuantity;
      setEvents(updatedEvents);
    };

    if (hasPermission === null) {
      return <Text>Requesting camera permission...</Text>;
    }
    if (hasPermission === false) {
      return <Text>No access to camera</Text>;
    }
  
    const createData = async (cartItems) => {
      try {
        const docRef = await addDoc(collection(db, "customer-cart"), {
          cartData: cartItems,
          cartTotalprice: totalPrice(),
          cartID: barcodeValue
        });
        console.log("[DEBUG] Item added to Firestore:", docRef.id); // Log the document ID if needed
        console.log("[DEBUG] QR Code ID", barcodeValue)
      } catch (e) {
        throw new Error("Error creating data: " + e.message);
      }
    };
    const setQR = () =>{
      if(isOrdered){
        return <QRCode value={barcodeValue} size={200}/>
      }
      return null
    }
    const placeOrder = async () => {
      try {
        // Prepare cart items array from events
        const cartItems = events.map(event => ({
          barcode: event.barcode,
          name: event.name,
          quantity: event.quantity,
          price: event.price
        }));
    
        // Call createData to store all cart items
        await createData(cartItems);
        // Clear the events array after successful order placement
        setEvents([]);
        Alert.alert("Order placed successfully!");
        setIsOrdered(true)
      } catch (error) {
        Alert.alert("Error placing order!", error.message);
      }
    };
    const totalPrice = () => {  
      let total = 0;
      events.forEach(event => {
        total += event.price * event.quantity; // Multiply price by quantity for each item
      });
      return total;
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
              <Icon name="sign-out" size={20} color="black" style={{marginLeft:300}} onPress={logout} />
              <Text style={styles.title}>Shopping Cart</Text>
              <Card style={styles.card}>
                <ScrollView contentContainerStyle={styles.scrollContainer} vertical={true}>
                  <Card.Content>
                      <Title>My Cart</Title>
                      {events.map((event, index) => (
                      <EventCard key={index} event={event} onUpdateQuantity={(newQuantity) => handleUpdateQuantity(index, newQuantity)} />
                      ))}
                  </Card.Content>
                  <Title>Total: {totalPrice()} </Title>
                  {isOrdered && (
                    <View style={styles.dislayQR}>
                      {setQR()}
                      <Text style={styles.title}>My order</Text>
                    </View>
                  )}
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
                    value={name.toString()}
                    editable={false}
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
                    value={price.toString()}
                    editable={false}
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
                <Text style={styles.submitText}>Add Cart</Text>
              </Pressable>
              <Pressable style={styles.submitOrder} onPress={placeOrder}>
                <Text style={styles.submitCart}>Place Order</Text>
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
      marginBottom: 80,
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
    },
    dislayQR: {
      alignItems:'center'
    }
  });
export default Customer;