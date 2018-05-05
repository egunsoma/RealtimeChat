import React from 'react';
import { StyleSheet, Platform, Image, Text, View, ScrollView } from 'react-native';
import { Actions, Router, Stack, Scene } from 'react-native-router-flux';
import LoginScreen from './src/scenes/LoginScreen';
import ConversationListScreen from './src/scenes/ConversationListScreen'
import ConversationMessagesScreen from './src/scenes/ConversationMessagesScreen'
import ConversationSettingsScreen from './src/scenes/ConversationSettingsScreen'
import ConversationAddUserScreen from './src/scenes/ConversationAddUserScreen'
import firebase from 'react-native-firebase';

export default class App extends React.Component {

  render() {
    return (
      <Router>
        <Stack key="root">
          <Scene key="login" component={LoginScreen} initial title="Login"/>
          <Scene key="conversation_list" component={ConversationListScreen}  title="ConversationListScreen"/>
          <Scene key="conversation_messages" component={ConversationMessagesScreen} rightTitle="Settings" onRight={() => Actions.refs.conversation_messages.onRight()} title="ConversationMessagesScreen"/>
          <Scene key="conversation_settings" component={ConversationSettingsScreen}  title="ConversationSettingsScreen"/>
          <Scene key="conversation_add_user" component={ConversationAddUserScreen}  title="ConversationAddUserScreen"/>
        </Stack>
      </Router>
    );
  }
}
