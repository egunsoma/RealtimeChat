import React from 'react';
import { StyleSheet, Platform, Image, Text, View, ScrollView } from 'react-native';
import { Actions, Router, Stack, Scene } from 'react-native-router-flux';
import LoginScreen from './src/scenes/LoginScreen';
import ConversationListScreen from './src/scenes/ConversationListScreen'
import ConversationMessagesScreen from './src/scenes/ConversationMessagesScreen'
import ConversationSettingsScreen from './src/scenes/ConversationSettingsScreen'
import ConversationAddUserScreen from './src/scenes/ConversationAddUserScreen'
import firebase from 'react-native-firebase';
import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper';
import UserProfileScreen from './src/scenes/UserProfileScreen';

const theme = {
  ...DefaultTheme,
  roundness: 2,
  colors: {
    ...DefaultTheme.colors,
    primary: '#FFC107',
    accent: '#03A9F4',
  }
};

export default class App extends React.Component {
  render() {
    return (
      <PaperProvider theme={theme}>
        <Router>
          <Stack key="root">
            <Scene key="login" component={LoginScreen} hideNavBar initial title="Login"/>
            <Scene key="conversation_list" component={ConversationListScreen} hideNavBar  title="ConversationListScreen"/>
            <Scene key="conversation_messages" component={ConversationMessagesScreen} hideNavBar rightTitle="Settings" onRight={() => Actions.refs.conversation_messages.onRight()} title="ConversationMessagesScreen"/>
            <Scene key="conversation_settings" component={ConversationSettingsScreen} hideNavBar title="ConversationSettingsScreen"/>
            <Scene key="conversation_add_user" component={ConversationAddUserScreen} hideNavBar title="ConversationAddUserScreen"/>
            <Scene key="user_profile" component={UserProfileScreen} hideNavBar title="UserProfileScreen"/>
          </Stack>
        </Router>
      </PaperProvider>
    );
  }
}
