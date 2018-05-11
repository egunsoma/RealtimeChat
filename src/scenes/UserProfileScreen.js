import React, { Component } from 'react';
import {
 View
} from 'react-native';
import { HelperText,Button, Toolbar, ToolbarBackAction,TextInput, ToolbarContent, ToolbarAction, FAB , Caption, Title, Divider, TouchableRipple, Paragraph,Dialog, DialogActions, DialogContent, DialogTitle, Text, Subheading} from 'react-native-paper';
import { Actions } from 'react-native-router-flux';
import firebase from 'react-native-firebase';

export default class UserProfileScreen extends Component {

  state = {
    displayName: '',
    originalDisplayName: '',
    loading: false
  }

  componentWillMount() {
    this.getUser();
  }

  getUser() {
    firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).get().then((userDoc) => {
      console.log(userDoc.data())
      this.setState({
        originalDisplayName: userDoc.data().displayName,
        displayName: userDoc.data().displayName,
        loading: false
      })
    });
  }

  onLogoutPress() {
    firebase.auth().signOut().then(() => {
      Actions.login({ type: 'reset' });
    })
  }

  onSavePress() {
    this.setState({loading: true})
    firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).update({
      displayName: this.state.displayName
    }).then(() => {
      this.getUser()
    });
  }

  render() {
    return (
      <View style={{ flex: 1}}>
        <Toolbar>
          <ToolbarBackAction
            onPress={() => Actions.pop()}
          />
          <ToolbarContent
            title="Profile"
          />
        </Toolbar>
        <View style={{flex: 1, margin: 12}}>
          <Caption>Display Name</Caption>
          <TextInput
            value={this.state.displayName}
            onChangeText={displayName => this.setState({ displayName })}
          />
              
          <HelperText>
            Others can find you by this name. 
            </HelperText>
          <Button loading={this.state.loading} raised disabled={(this.state.originalDisplayName === this.state.displayName) || this.state.loading} primary onPress={this.onSavePress.bind(this)}>Save</Button>
        </View>
        <Button raised onPress={this.onLogoutPress}>Sign Out</Button>
        
      </View>
    );
  }
}