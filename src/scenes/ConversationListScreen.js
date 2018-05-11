import React, { Component } from 'react';
import {
 View, FlatList, ActivityIndicator
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import firebase from 'react-native-firebase';
import { Button } from 'react-native-paper';
import { Toolbar, ToolbarBackAction,TextInput, ToolbarContent, ToolbarAction, FAB , Caption, Title, Divider, TouchableRipple, Paragraph,Dialog, DialogActions, DialogContent, DialogTitle, Text} from 'react-native-paper';
import moment from 'moment';
import _ from 'lodash';
export default class ConversationListScreen extends Component {
  state = {
    conversations: [],
    loading: true,
    conversationName: ''
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
      const { name, lastMessage, seenLastMessage } = doc.data();
      console.log(doc);

      const item = { 
        key: doc.id,
        name,
        lastMessage,
        seenLastMessage
      };

      conversations.push(item);
    });
    this.setState({ 
      conversations,
      loading: false,
   });
  }



  onCreateConversationPress() {
    const now = new Date().getTime()
    firebase.firestore().collection('conversations')
      .add({
        name: this.state.conversationName || 'New Conversation',
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

    // Hide Dialog
    this.setState({ visible: false })
  }
  
  onConversationPress(conversationId) {
    Actions.conversation_messages({ conversationId });
  }

  renderConversation({item}) {
    const seenLastMessage = !_.has(item.seenLastMessage, firebase.auth().currentUser.uid) ;
    return (
      <TouchableRipple onPress={this.onConversationPress.bind(this, item.key)}>
        <View>
        <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'stretch', margin: 12}}>
          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
          <Text style={seenLastMessage && styles.unreadConversationText}>{item.name}</Text>
          <Caption style={seenLastMessage && styles.unreadConversationText}>{moment(item.lastMessage.timestamp).format("HH:mm")}</Caption>
          </View>
          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center'}}>
            <Caption style={seenLastMessage && styles.unreadConversationText}>{item.lastMessage.data}</Caption>
          </View>
          
        </View>
        <Divider />
        </View>
      </TouchableRipple>
    ) 
  }

  _showDialog = () => this.setState({ visible: true });
  _hideDialog = () => this.setState({ visible: false, conversationName: '' });

  render() {
    const { visible } = this.state;
    return (
      <View style={{ flex: 1}}>
      <Toolbar>
        <ToolbarContent
          title="Conversations"
        />
        <ToolbarAction icon="person" onPress={() => Actions.user_profile()} />
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
            onPress={this._showDialog}/>
        {/* <MDButton raised onPress={this.onCreateConversationPress.bind(this)}>
          Create Conversation
        </MDButton> */}
        {/* <Button title="Sign out" onPress={this.onLogoutPress.bind(this)} /> */}
        <Dialog
           visible={visible}
           onDismiss={this._hideDialog}
        >
          <DialogTitle>Create Conversation</DialogTitle>
          <DialogContent>
            <TextInput
              label='Conversation Name'
              value={this.state.conversationName}
              onChangeText={conversationName => this.setState({ conversationName })}
            />
          </DialogContent>
          <DialogActions>
          
            <Button  primary onPress={this._hideDialog}>Never mind</Button>
            
            <Button raised primary onPress={this.onCreateConversationPress.bind(this)}>Let's chat</Button>
          </DialogActions>
          </Dialog>
      </View>
    );
  }
}

const styles = {
  unreadConversationText: {
    fontWeight: 'bold'
  }
}