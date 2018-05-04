import React, { Component } from 'react';
import {
  Text, Button, View, ActivityIndicator, TextInput, Alert
 } from 'react-native';
import { Actions } from 'react-native-router-flux';
import firebase from 'react-native-firebase';
 
export default class LoginScreen extends Component {

  state = {
    email: ' ',
    password: ' ',
    loading: true
  }

  componentWillMount() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        firebase.analytics().setUserId(firebase.auth().currentUser.uid);
        Actions.conversation_list({ type: 'reset' });
      } else {
        this.setState({ loading: false });
      }
    });
  }

  onLoginPress() {
    this.setState({ loading: true });

    firebase.auth().signInWithEmailAndPassword(this.state.email, this.state.password)
      .then(()=> {
        console.log('login_email');
      })
      .catch((err) => {
        this.setState({ loading: false });
        Alert.alert(
          'Error',
          `${err.message}`,
          [
            { text: 'OK', onPress: () => console.log('OK Pressed') },
          ],
          { cancelable: false }
        );
      });
  }

  onRegisterPress() {
    this.setState({ loading: true });

    firebase.auth().createUserWithEmailAndPassword(this.state.email, this.state.password)
      .then(()=> {
        console.log('registration_email');
      })
      .catch((err) => {
        this.setState({ loading: false });
        Alert.alert(
          'Error',
          `${err.message}`,
          [
            { text: 'OK', onPress: () => console.log('OK Pressed') },
          ],
          { cancelable: false }
        );
      });
  }

  render() {
    if (this.state.loading) {
      return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" /></View>
    }
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      >
        <TextInput
          placeholder={'Email'}
          onChangeText={(email) => this.setState({ email })}
        />
        <TextInput
          placeholder={'Jelszó'}
          onChangeText={(password) => this.setState({ password })}
          secureTextEntry
        />
        <Button title="Login" onPress={this.onLoginPress.bind(this)} />
        <Button title="Register" onPress={this.onRegisterPress.bind(this)} />
        
      </View>
    );
  }
}