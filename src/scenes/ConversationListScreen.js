import React, { Component } from 'react';
import {
 Text, Button, View
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import firebase from 'react-native-firebase';


export default class ConversationListScreen extends Component {

  onLogoutPress() {
    firebase.auth().signOut().then(() => {
      Actions.login({ type: 'reset' });
    })
  }


  render() {
    return (
      <View>
        <Button title="Create Conversation" onPress={() => Actions.conversation_messages()} />
        <Button title="Sign out" onPress={this.onLogoutPress.bind(this)} />
      </View>
    );
  }
}