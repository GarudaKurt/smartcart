import React, { useState } from "react";
import { Text, StyleSheet, View, TextInput, Pressable, Dimensions } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { FontFamily, Color, Border, FontSize, Padding } from "../GlobalStyles";

const { width } = Dimensions.get("window");

const signUp = () => {
  const [userType, setUserType] = useState("");

  return (
    <View style={styles.container}>
      <View style={styles.frame}>
        <View style={styles.signInParent}>
          <Text style={styles.signUp}>Sign Up</Text>
          <TextInput style={styles.txtemail} placeholder="Email address" multiline={false} />
        </View>
        <View style={styles.passwordWrapper}>
          <TextInput style={styles.password} placeholder="Password" secureTextEntry={true} />
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
        <Pressable style={styles.submitButton} onPress={() => {}}>
          <Text style={styles.submitText}>Submit</Text>
        </Pressable>
      </View>
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
});

