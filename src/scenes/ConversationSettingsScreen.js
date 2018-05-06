import React, { Component } from 'react';
import {
 Text, View, Button, FlatList, ActivityIndicator
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import firebase from 'react-native-firebase';
import _ from 'lodash';

export default class ConversationSettingsScreen extends Component {
  
  state = {
    members: [],
    loading: true
  }

  componentWillMount() {
    this.unsubscribe = firebase.firestore().collection('conversations')
      .doc(this.props.conversationId)
      .onSnapshot((doc) => {
        const userPromiseList = [];

        _.forEach(doc.data().members, (_value, memberId) => {
          console.log(_value, memberId);
          userPromiseList.push(firebase.firestore().collection('users').doc(memberId).get())
        })

        Promise.all(userPromiseList).then((membersDocList) => {
          const members = _.map(membersDocList, (doc) => {
            return {...doc.data(), key: doc.id};
          })
          console.log(members)
          this.setState({
            members, loading: false
          })
        })
      });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  renderMember({item}) {
    return (
      <Text>{item.displayName}</Text>
    ) 
  }

  render() {
    return (
      <View>
        {
          this.state.loading ? 
          <ActivityIndicator /> :
          <FlatList
            data={this.state.members}
            extraData={this.state}
            renderItem={this.renderMember.bind(this)}
          />
        }
      <Button title="Add User" onPress={() => Actions.conversation_add_user({ conversationId: this.props.conversationId})} />
      <Button title="Leave Conversation" onPress={() => {}} />
    </View>
    );
  }
}