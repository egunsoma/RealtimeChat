
const functions = require('firebase-functions');
const _ = require('lodash');
const admin = require('firebase-admin');
admin.initializeApp();

exports.createMessage = functions.firestore
  .document('conversations/{conversationId}/messages/{messageId}')
  .onCreate((snap, context) => {
    const messageDoc = snap.data();
    console.log('New message is ', messageDoc)

    admin.firestore().collection('conversations')
      .doc(context.params.conversationId).get()
      .then((doc) => {
        const conversation = doc.data();
        console.log('Retrieved conversation is ', conversation)

        _.forEach(conversation.members, (_timestamp, userId) => {
          console.log('Sending notification to User ', userId)
          admin.firestore().collection('users').doc(userId).get()
            .then((doc) => {
              const deviceToken = doc.data().deviceToken;

              var message = {
                notification: {
                  title: 'New Message',
                  body: `${messageDoc.data}`
                },
                token: deviceToken
              };
              return admin.messaging().send(message);
            })
            .then((response) => {
              return console.log('Successfully sent message:', response);
            })
            .catch((error) => {
              return console.log('Error sending message:', error);
            });;
        })
        return console.log('Finished running');
      });
    return console.log('End of function ');
  });