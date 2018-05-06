import React, { Component } from 'react';
import {
 Text, View, TouchableOpacity
} from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';
import { Actions } from 'react-native-router-flux';
import firebase from 'react-native-firebase';
import _ from 'lodash';

export default class ConversationMessagesScreen extends Component {
  state = {
    messages: [],
  }

  componentWillMount() {
    this.unsubscribe = firebase.firestore().collection('conversations')
      .doc(this.props.conversationId)
      .collection('messages')
      .orderBy('timestamp', 'desc')
      .limit(5)
      .onSnapshot(this.onCollectionUpdate.bind(this));
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  fromGiftedMessage(giftedMessage) {
    return {
      timestamp: giftedMessage[0].createdAt.getTime(),
      senderId: giftedMessage[0].user._id,
      type: 'text',
      data: giftedMessage[0].text
    }
  }

  fromFirestoreMessage(firestoreMessage) {
    return {
      _id: firestoreMessage.id,
      text: firestoreMessage.data().data,
      createdAt: new Date(firestoreMessage.data().timestamp),
      user: {
        _id: firestoreMessage.data().senderId
      }
    }
  }

  onRight() {
    Actions.conversation_settings({ conversationId: this.props.conversationId})
  }

  onCollectionUpdate(querySnapshot) {
    const messages = [];
    querySnapshot.forEach((doc) => {
      const giftedMessage = this.fromFirestoreMessage(doc);
      messages.push(giftedMessage);
    });
    this.setState({ 
      messages
   });
  }

  onSend(messages = []) {
    // this.setState({
    //   messages: [messages[0], ...this.state.messages]
    // })

    const cRef = firebase.firestore().collection('conversations')
      .doc(this.props.conversationId);
     
    const mRef = firebase.firestore().collection('conversations')
      .doc(this.props.conversationId)
      .collection('messages')
      .doc();

    const firestoreMessage = this.fromGiftedMessage(messages)
      
    firebase.firestore().runTransaction(function(transaction) {
      return transaction.get(cRef).then(function(doc) {
        // Creating new Members List  
        var newMembers = {};
        _.forEach(doc.data().members, (value, key) => {
          newMembers = { ...newMembers, [key]: firestoreMessage.timestamp}
        })

        transaction.update(cRef, { 
          members: newMembers, 
          lastMessage: firestoreMessage,
          seenLastMessage: { [firebase.auth().currentUser.uid]: true }
        });
        transaction.set(mRef, firestoreMessage);
      });
    })
  }

  render() {
    return (
      <GiftedChat
        messages={this.state.messages}
        onSend={messages => this.onSend(messages)}
        renderChatFooter={() => {
          return (
            <TouchableOpacity style={{ justifyContent: 'center', alignItems: 'center' }}><Text>ASD</Text></TouchableOpacity>
          )
        }}
        user={{
          _id: firebase.auth().currentUser.uid,
        }}
      />
    )
  }
}