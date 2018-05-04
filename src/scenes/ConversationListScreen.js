import React, { Component } from 'react';
import {
 Text, Button, View
} from 'react-native';
import { Actions } from 'react-native-router-flux';

export default class ConversationListScreen extends Component {
  render() {
    return (
      <View>
        <Button title="Messages" onPress={() => Actions.conversation_messages()} />
      </View>
    );
  }
}