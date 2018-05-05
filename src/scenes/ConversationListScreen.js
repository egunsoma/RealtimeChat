import React, { Component } from 'react';
import {
 Text, Button, View, FlatList, ActivityIndicator
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import firebase from 'react-native-firebase';


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
      <Button title={item.lastMessage.data} onPress={this.onConversationPress.bind(this, item.key)} />
    ) 
  }

  render() {
    return (
      <View>
        {
          this.state.loading ? 
          <ActivityIndicator /> :
          <FlatList
            data={this.state.conversations}
            extraData={this.state}
            renderItem={this.renderConversation.bind(this)}
          />
        }
        <Button title="Create Conversation" onPress={this.onCreateConversationPress.bind(this)} />
        <Button title="Sign out" onPress={this.onLogoutPress.bind(this)} />
      </View>
    );
  }
}