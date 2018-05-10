import React, { Component } from 'react';
import {
 View, FlatList, ActivityIndicator
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import firebase from 'react-native-firebase';
import _ from 'lodash';
import { Paragraph,Dialog, DialogActions, DialogContent, DialogTitle,Subheading,Divider, Caption, Text, Button,ListSection, ListItem, Toolbar, ToolbarBackAction, ToolbarContent, ToolbarAction, FAB} from 'react-native-paper';
import moment from 'moment';


export default class ConversationSettingsScreen extends Component {
  
  state = {
    members: [],
    loading: true,
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
          _.forEach(membersDocList, (doc) => {
            firebase.database().ref('/presence/' + doc.id).on('value', (snapshot)  => {
              this.setState({
                presenceInfo: { ...this.state.presenceInfo, [doc.id]: snapshot.val()}
              })
            });
          });

          const members = _.map(membersDocList, (doc) => {
            return {...doc.data(), key: doc.id };
          });

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

  onLeaveButtonPress(userId) {
    const ref = firebase.firestore().collection('conversations').doc(this.props.conversationId);
     
    firebase.firestore().runTransaction(function(transaction) {
        return transaction.get(ref).then(function(doc) {
            console.log(doc.data().members)
            var newMembers = _.omit(doc.data().members, firebase.auth().currentUser.uid)
            console.log(newMembers)
            transaction.update(ref, { members: newMembers });
        });
    }).then(() => {
      Actions.conversation_list({ type: 'reset'});
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


  renderMember({item}) {
    return (
      <View>
        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', margin: 12}}>
          <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start'}}>
            <Text>{item.displayName}</Text>
            {this.renderPresence(this.state.presenceInfo[item.key])}
          </View>
          { item.key === firebase.auth().currentUser.uid && <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end'}}>
            <Button raised onPress={this._showDialog}>Leave</Button>
          </View>}
        </View>
        <Divider />
      </View>
    ) 
  }

  _showDialog = () => this.setState({ visible: true });
  _hideDialog = () => this.setState({ visible: false });

  render() {
    const { visible } = this.state;

    return (
      <View style={{flex:1}}>
      <Toolbar>
        <ToolbarBackAction
          onPress={() => Actions.pop()}
        />
        <ToolbarContent
          title="Settings"
        />
      </Toolbar>
      
        {
          this.state.loading ? 
          <ActivityIndicator /> :
          <FlatList
            data={this.state.members}
            extraData={this.state}
            renderItem={this.renderMember.bind(this)}
            ListHeaderComponent={<Subheading style={{ margin: 12 }}>Members</Subheading>}
          />
        }
      <FAB
        style={{ position: 'absolute', bottom: 16, right: 16}}
        icon="person-add"
        onPress={() => Actions.conversation_add_user({ conversationId: this.props.conversationId})}/>
      {/* <Button title="Add User" onPress={() => Actions.conversation_add_user({ conversationId: this.props.conversationId})} /> */}
      <Dialog
           visible={visible}
           onDismiss={this._hideDialog}
        >
          <DialogTitle>Leave Conversation</DialogTitle>
          <DialogContent>
            <Paragraph>
            Do you really want to leave this conversation?
            </Paragraph>
          </DialogContent>
          <DialogActions>
          
            <Button  primary onPress={this._hideDialog}>Cancel</Button>
            
            <Button raised primary onPress={this.onLeaveButtonPress.bind(this)}>Leave</Button>
          </DialogActions>
          </Dialog>
    </View>
    );
  }
}