import React, { useState } from "react";
import { Text, StyleSheet, View, TextInput, Pressable, Dimensions, Modal} from "react-native";
import {  Color, Border,  Padding } from "../GlobalStyles";
import { db } from './firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

const { width } = Dimensions.get("window");

const SignIn = ({navigation}) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [modalMessage, setModalMessage] = useState("")
  const [modalVisible, setModalVisible] = useState(false)

  const handleSignup = () =>{
    navigation.replace('Create')
  }

  const handleAdmin = () => {
    navigation.replace('Admins')
  }

  const handleCashier = () => {
    navigation.replace('Cashiers')
  }

  const hanldeCustomer = () => {
    navigation.replace('Customers')
  }

  const fetchData = async() => {
    if(!email || !password){
      setModalMessage("Please make sure all fields not empty!")
      setModalVisible(true)
      return
    }

    
    try {
      const querySnapshot = await getDocs(collection(db, "mycart"));
      let userExist = false
      querySnapshot.forEach(doc =>{
        const userData = doc.data()
        if(userData.email === email && userData.password === password) {
          userExist = true
          setModalMessage("Successfully Login!")
          setModalVisible(true)
          setTimeout(() => {
            if(userData.usertype === "Admin") {
               handleAdmin()
            } else if(userData.usertype === "Cashier") {
              handleCashier()
            } else {
              hanldeCustomer()
            }
        },2000)
        }
      })
      if (!userExist) {
        setModalMessage("User does not exist!")
        setModalVisible(true)
      }
    } catch(e) {
      setModalMessage("Error fetching data",e)
      setModalVisible(true)
    }
  }


  return (
    <View style={styles.container}>
      <View style={styles.frame}>
        <View style={styles.signInParent}>
          <Text style={styles.signIn}>Sign In</Text>
          <TextInput style={styles.txtemail} value={email} onChangeText={(email)=>{setEmail(email)}} placeholder="Email address" multiline={false} />
        </View>
        <View style={styles.passwordWrapper}>
          <TextInput style={styles.password} value={password} onChangeText={(password)=>{setPassword(password)}} placeholder="Password" secureTextEntry={true} />
        </View>
      </View>
      <View style={styles.bottomSection}>
        <Pressable style={styles.submitButton} onPress={fetchData}>
          <Text style={styles.submitText}>Submit</Text>
        </Pressable>
        <View style={styles.dontHaveAccountYetParent}>
          <Text style={styles.dontHaveAccount}>Don’t have an account yet?</Text>
          <Pressable style={styles.create} onPress={handleSignup}>
            <Text style={styles.createOne}>Create one!</Text>
          </Pressable>
        </View>
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

    </View>
  );
};
export default SignIn;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#dfe4ea",
    paddingHorizontal: 20,
    paddingTop: 50,
    alignItems: "center",
  },
  frame: {
    width: "100%",
    alignItems: "center",
    paddingTop: 100,
    marginBottom:15,
  },
  signInParent: {
    marginBottom: 15,
    alignItems: "center",
  },
  signIn: {
    fontSize: 40,
    fontWeight: "600",
    fontFamily:"sans-serif",
    color: Color.colorBlack,
    textAlign: "left",
    marginBottom: 30,
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
    marginBottom: 8,
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
    marginBottom: 8,
    height: 50
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
    fontSize: 20,
    fontFamily: "sans-serif",
    color: Color.colorWhite,
  },
  dontHaveAccountYetParent: {
    alignItems: "center",
  },
  dontHaveAccount: {
    fontSize: 20,
    fontFamily: "sans-serif",
    color: Color.colorBlack,
    marginBottom: 5,
  },
  create:{
    width: '100%',
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  createOne: {
    fontSize: 20,
    fontFamily:"sans-serif",
    color: "#189AB4",
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
});
