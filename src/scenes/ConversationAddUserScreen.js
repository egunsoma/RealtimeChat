import React, { Component } from 'react';
import {
 View, FlatList, ActivityIndicator, TextInput
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import firebase from 'react-native-firebase';
import Queue from 'promise-queue';
import { Button, Subheading, Divider, Text, Caption, Toolbar, ToolbarBackAction, ToolbarContent, ToolbarAction , Searchbar} from 'react-native-paper';
import moment from 'moment';

import _ from 'lodash';

export default class ConversationAddUserScreen extends Component {
  
  state = {
    members: [],
    loading: true,
    searchKey: '',
    searchResult: [],
    promiseQueue: new Queue(1, Infinity),
    presenceInfo: {}    
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
    _.forEach(this.state.presenceInfo, (value, key) => {
      firebase.database().ref('/presence/' + key).off();
    });
  }

  isMember(userId) {
    console.log(userId, this.state.members)
    return _.some(this.state.members, ['key', userId]);
  }

  search(searchKey) {
    this.state.promiseQueue.add(() => {
      var strSearch = searchKey; 
      var strlength = strSearch.length; 
      var strFrontCode = strSearch.slice(0, strlength-1); 
      var strEndCode = strSearch.slice(strlength-1, strSearch.length); 
      var startcode = strSearch; 
      var endcode= strFrontCode + String.fromCharCode(strEndCode.charCodeAt(0) + 1);

      return firebase.firestore().collection('users')
        .where('displayName', '>=', startcode)
        .where('displayName', '<', endcode).get();
    })
    .then((querySnapshot) => {
      const searchResult = [];
      querySnapshot.forEach((doc) => {

        firebase.database().ref('/presence/' + doc.id).on('value', (snapshot)  => {
          this.setState({
            presenceInfo: { ...this.state.presenceInfo, [doc.id]: snapshot.val()}
          })
        });

        const { name, lastMessage } = doc.data();
        const item = { 
          key: doc.id,
          ...doc.data()
        };
        searchResult.push(item);
      });
      this.setState({ 
        searchResult,
      });
    })
  }

  handleInput(searchKey) {
    this.setState({ searchKey });
    this.search(searchKey);
  }

  onAddButtonPress(userId) {
    const ref = firebase.firestore().collection('conversations').doc(this.props.conversationId);
     
    firebase.firestore().runTransaction(function(transaction) {
        return transaction.get(ref).then(function(doc) {
            var newMembers = { 
                ...doc.data().members, 
                [userId]: doc.data().lastMessage.timestamp
            };
            transaction.update(ref, { members: newMembers });
        });
    })
  }

  renderPresence(presenceData) {
    const presenceInfo = presenceData || 'new_user';
    if(presenceInfo === true) {
      return <Caption>Online</Caption>;
    } else if (presenceInfo === 'new_user') {
      return <Caption>New User</Caption>;
    } else {
      return <Caption>{moment(presenceInfo).fromNow()}</Caption>
    }
  }

  renderUser({item}) {
    return (
      <View>
        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', margin: 12}}>
          <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start'}}>
            <Text>{item.displayName}</Text>
            {this.renderPresence(this.state.presenceInfo[item.key])}
          </View>
            <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end'}}>
              {  this.isMember(item.key) ?  <Text>Member</Text> : <Button primary raised onPress={this.onAddButtonPress.bind(this, item.key)}>Add</Button>}
            </View>
        </View>
        <Divider />
      </View>
    ) 
  }

  render() {
    return (
      <View style={{flex: 1}}>
      <Toolbar>
        <ToolbarBackAction
          onPress={() => Actions.pop()}
        />
        <ToolbarContent
          title="Add User"
        />
      </Toolbar>
      <Searchbar
        placeholder="Search"
        onChangeText={this.handleInput.bind(this)}
        value={this.state.searchKey}
      />
      {
        this.state.loading ? 
        <ActivityIndicator /> :
        <FlatList
          data={this.state.searchResult}
          extraData={this.state}
          renderItem={this.renderUser.bind(this)}
        />
      }
    </View>
    );
  }
}