import React, { Component } from 'react';
import {
  Text, Button, View
 } from 'react-native';
 import { Actions } from 'react-native-router-flux';
 
export default class LoginScreen extends Component {
  render() {
    return (
      <View>
        <Button title="Login" onPress={() => Actions.conversation_list()} />
      </View>
    );
  }
}