import React, { Component } from 'react';
import {
 Text, Button, View, FlatList, ActivityIndicator
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import firebase from 'react-native-firebase';
import { Button as MDButton } from 'react-native-paper';
import { Toolbar, ToolbarBackAction, ToolbarContent, ToolbarAction, FAB , Caption, Title, Divider, TouchableRipple} from 'react-native-paper';
import moment from 'moment';
export default class ConversationListScreen extends Component {
  state = {
    conversations: [],
    loading: true
  }
  componentWillMount() {
    this.unsubscribe = firebase.firestore().collection('conversations')
      .where(`members.${firebase.auth().currentUser.uid}`, '>', 0)
      .orderBy(`members.${firebase.auth().currentUser.uid}`, 'desc') 
      .onSnapshot(this.onCollectionUpdate.bind(this));
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  onCollectionUpdate(querySnapshot) {
    const conversations = [];
    querySnapshot.forEach((doc) => {
      const { name, lastMessage } = doc.data();
      console.log(doc);

      const item = { 
        key: doc.id,
        name,
        lastMessage
      };

      conversations.push(item);
    });
    this.setState({ 
      conversations,
      loading: false,
   });
  }

  onLogoutPress() {
    firebase.auth().signOut().then(() => {
      Actions.login({ type: 'reset' });
    })
  }

  onCreateConversationPress() {
    const now = new Date().getTime()
    firebase.firestore().collection('conversations')
      .add({
        name: "New Conversation",
        members: {
          [firebase.auth().currentUser.uid]: now
        },
        lastMessage: { 
          type: 'text',
          data: 'Conversation created',
          senderId: firebase.auth().currentUser.uid,
          timestamp: now
        }
      })
  }
  
  onConversationPress(conversationId) {
    Actions.conversation_messages({ conversationId });
  }

  renderConversation({item}) {
    return (
      <TouchableRipple onPress={this.onConversationPress.bind(this, item.key)}>
        <View>
        <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'stretch', margin: 10}}>
          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
          <Title>{item.name}</Title>
          <Caption>{moment(item.lastMessage.timestamp).format("HH:mm")}</Caption>
          </View>
          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center'}}>
            <Caption>{item.lastMessage.data}</Caption>
          </View>
          
        </View>
        <Divider />
        </View>
      </TouchableRipple>
    ) 
  }

  render() {
    return (
      <View style={{ flex: 1}}>
      <Toolbar>
        <ToolbarContent
          title="Conversations"
        />
        <ToolbarAction icon="person" onPress={() => {}} />
        </Toolbar>
        {
          this.state.loading ? 
          <ActivityIndicator /> :
          <FlatList
            data={this.state.conversations}
            extraData={this.state}
            renderItem={this.renderConversation.bind(this)}
          />
        }
          <FAB
            style={{ position: 'absolute', bottom: 16, right: 16}}
            icon="add"
            onPress={this.onCreateConversationPress.bind(this)}/>
        {/* <MDButton raised onPress={this.onCreateConversationPress.bind(this)}>
          Create Conversation
        </MDButton> */}
        {/* <Button title="Sign out" onPress={this.onLogoutPress.bind(this)} /> */}
      </View>
    );
  }
}