import * as React from "react";
import { Text, StyleSheet, View, TextInput, Pressable, Dimensions } from "react-native";
import { FontFamily, Color, Border, FontSize, Padding } from "../GlobalStyles";

const { width } = Dimensions.get("window");

const signIn = () => {
  return (
    <View style={styles.container}>
      <View style={styles.frame}>
        <View style={styles.signInParent}>
          <Text style={styles.signIn}>Sign In</Text>
          <TextInput style={styles.txtemail} placeholder="Email address" multiline={false} />
        </View>
        <View style={styles.passwordWrapper}>
          <TextInput style={styles.password} placeholder="Password" secureTextEntry={true} />
        </View>
      </View>
      <View style={styles.bottomSection}>
        <Pressable style={styles.submitButton} onPress={() => {}}>
          <Text style={styles.submitText}>Submit</Text>
        </Pressable>
        <View style={styles.dontHaveAccountYetParent}>
          <Text style={styles.dontHaveAccount}>Don’t have an account yet?</Text>
          <Text style={styles.createOne}>Create one!</Text>
        </View>
      </View>
    </View>
  );
};

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
  },
  signInParent: {
    marginBottom: 20,
    alignItems: "center",
  },
  signIn: {
    fontSize: 40,
    fontWeight: "600",
    fontFamily: FontFamily.encodeSansSemiExpandedSemiBold,
    color: Color.colorBlack,
    textAlign: "left",
    marginBottom: 10,
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
    fontSize: FontSize.size_11xl,
    fontFamily: FontFamily.encodeSansSemiExpandedRegular,
    color: Color.colorWhite,
  },
  dontHaveAccountYetParent: {
    alignItems: "center",
  },
  dontHaveAccount: {
    fontSize: FontSize.size_xl,
    fontFamily: FontFamily.encodeSansSemiExpandedRegular,
    color: Color.colorBlack,
    marginBottom: 5,
  },
  createOne: {
    fontSize: FontSize.size_xl,
    fontFamily: FontFamily.encodeSansSemiExpandedRegular,
    color: "#2174d5",
  },
});

export default signIn;
