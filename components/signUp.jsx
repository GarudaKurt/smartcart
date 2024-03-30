import React, { useState } from "react";
import { Text, StyleSheet, View, TextInput, Pressable, Dimensions, Modal } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Color, Border, Padding } from "../GlobalStyles";

import { db } from './firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

const { width } = Dimensions.get("window");

const signUp = ({navigation}) => {
  const [userType, setUserType] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [modalMessage, setModalMessage] = useState("")
  const [modalVisible, setModalVisible] = useState(false)

  const handleSignin = () =>{
    navigation.replace('Login')
  }
  
  const createData = async () => {
    if(!email || !password || !userType) {
      setModalMessage("Please make sure all fields not empty!")
      setModalVisible(true)
      return
    }
    try {
      const docRef = await addDoc(collection(db, "mycart"), {
        email: email,
        password: password,
        usertype: userType
      })
      setModalMessage("Succesfully created!") //why this modal not open when falls here ?
      setModalVisible(true)
    } catch(e) {
      setModalMessage("Error creating data!",e)
      setModalVisible(true)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.frame}>
        <View style={styles.signInParent}>
          <Text style={styles.signUp}>Sign Up</Text>
          <TextInput style={styles.txtemail} value={email} onChangeText={(email)=>{setEmail(email)}} placeholder="Email address" multiline={false} />
        </View>
        <View style={styles.passwordWrapper}>
          <TextInput style={styles.password} value={password} onChangeText={(password)=>{setPassword(password)}} placeholder="Password" secureTextEntry={true} />
        </View>
        <Picker
          selectedValue={userType}
          style={styles.picker}
          onValueChange={(itemValue) => setUserType(itemValue)}
        >
          <Picker.Item label="Select User Type" value="" />
          <Picker.Item label="Admin" value="Admin" />
          <Picker.Item label="Cashier" value="Cashier" />
          <Picker.Item label="Customer" value="Customer" />
        </Picker>
      </View>
      <View style={styles.bottomSection}>
        <Pressable style={styles.submitButton} onPress={createData}>
          <Text style={styles.submitText}>Submit</Text>
        </Pressable>
      </View>

      <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
              setModalVisible(false);
          }}
     >
      <View style={styles.modalContainer}>
          <View style={styles.modalView}>
              <Text style={styles.modalText}>{modalMessage}</Text>
              <Pressable style={styles.okButton} onPress={() => setModalVisible(false)}>
                  <Text style={styles.OK}>OK</Text>
              </Pressable>
          </View>
      </View>
    </Modal>
    
    <Pressable style={styles.goBack} onPress={handleSignin}>
        <Text style={styles.back}>Go back to SignIn ?</Text>
    </Pressable>

    </View>
  );
};
export default signUp;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#dfe4ea",
    paddingHorizontal: 20,
    paddingTop: 50,
    marginTop: 40,
    marginBottom: 20,
    alignItems: "center",
  },
  frame: {
    width: "100%",
    alignItems: "center",
    paddingTop: 70
  },
  signInParent: {
    marginBottom: 20,
    alignItems: "center",
  },
  signUp: {
    fontSize: 40,
    fontWeight: "600",
    fontFamily: "sans-serif",
    color: Color.colorBlack,
    textAlign: "left",
    marginBottom: 35,
  },
  txtemail: {
    width: width - 40,
    borderRadius: Border.br_10xs,
    backgroundColor: Color.colorWhite,
    borderStyle: "solid",
    borderColor: Color.colorBlack,
    borderWidth: 1,
    height: 50,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  passwordWrapper: {
    width: width - 40,
    borderRadius: Border.br_10xs,
    backgroundColor: Color.colorWhite,
    borderStyle: "solid",
    borderColor: Color.colorBlack,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: Padding.p_7xs,
    marginBottom: 20,
    height: 50
  },
  picker: {
    height: 40,
    width: width - 40,
    marginBottom: 40,
    marginVertical: 5,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: Color.colorBlack,
    borderRadius: 3,
    backgroundColor: Color.colorWhite
  },
  bottomSection: {
    alignItems: "center",
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
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  okButton: {
    backgroundColor: Color.colorBlack,
    color: Color.colorWhite,
    borderColor: Color.colorWhite,
    borderRadius: 2,
  },
  OK:{
    padding: 5,
    color: Color.colorWhite,
    fontSize: 15
  },
  goBack: {
    marginTop: 3,
    width: '100%',
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  back: {
    padding: 5,
    color: "#189AB4",
    fontSize: 15
  }
});


