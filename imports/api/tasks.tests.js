/* eslint-env mocha */
 
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { assert } from 'chai';
import { Accounts } from 'meteor/accounts-base';
 
import { Tasks } from './tasks.js';
 
if (Meteor.isServer) {
  describe('Tasks', () => {
    describe('methods', () => {
        const username = 'miky';
        let taskId, userId;

        before(() => {
          // Create user if not already created
          let user = Meteor.users.findOne({username : username });
          if(!user){
            userId = Accounts.createUser({
              'username' : username,
              'email' : 'mik@gmail.com',
              'password' : 'abc12345',
            })
          } else{
            userId = user._id;
          }
        });
    
        beforeEach(() => {
            Tasks.remove({});
            taskId = Tasks.insert({
            text: 'test task',
            createdAt: new Date(),
            owner: userId,
            username: 'tmeasday',
            });
        });

      it('can delete owned task', () => {
        // Find the internal implementation of the task method so we can
        // test it in isolation
        const deleteTask = Meteor.server.method_handlers['tasks.remove'];

        // Set up a fake method invocation that looks like what the method expects
        const invocation = { userId };

        // Run the method with `this` set to the fake invocation
        deleteTask.apply(invocation, [taskId]);

        // Verify that the method does what we expected
        assert.equal(Tasks.find().count(), 0);
      });

      // Insert method test
      it('can insert a new task', () => {
        // Create text content
        const text = 'Hello mocha!';
        
        const insertTask = Meteor.server.method_handlers['tasks.insert'];

        // Create fake user object
        const fakeUserObject = { userId };

        // Run test
        insertTask.apply(fakeUserObject, [text]);

        // Verify that the method does what we expected
        assert.equal(Tasks.find().count(), 2);
      });
      
      // Insert if not logged method test
      it('cannot insert a task', () => {
        // Create text content
        const text = 'Hello mocha!';
        
        const insertTask = Meteor.server.method_handlers['tasks.insert'];

        // Run test
        assert.throws(function() {
          insertTask.apply({}, [text]);
        }, Meteor.Error, 'not-authorized')

        // Verify that the method does what we expected
        assert.equal(Tasks.find().count(), 1);
      });

      // Remove private test
      it('cannot delete someone else\'s task', () => {
        // Set existing task private
        Tasks.update(taskId, { $set: {private: true} });

        // Generate Random id to step
        const anotherUserId = Random.id();

        // Isolate delete method
        const deleteTask = Meteor.server.method_handlers['tasks.remove'];

        // Set up a fake method fakeUserObject that looks like what the method expects
        const fakeUserObject = { 'userId' : anotherUserId };

        // Run test
        assert.throws(function() {
          deleteTask.apply(fakeUserObject, [taskId]);
        }, Meteor.Error, 'not-authorized')

        // Verify that task is not deleted
        assert.equal(Tasks.find().count(), 1);
      });

      // Remove Public test
      it('can delete someone esle\'s public task', () => {
        // Set existing task private
        Tasks.update(taskId, { $set: {private: false} });

        // Generate Random id to step
        const anotherUserId = Random.id();

        // Isolate delete method
        const deleteTask = Meteor.server.method_handlers['tasks.remove'];

        // Set up a fake method fakeUserObject that looks like what the method expects
        const fakeUserObject = { 'userId' : anotherUserId };

        // Run test
        deleteTask.apply(fakeUserObject, [taskId]);

        // Verify that task is not deleted
        assert.equal(Tasks.find().count(), 0);
      });

      it('can set task checked', () => {
        // Isolate setchecked method
        const setChecked = Meteor.server.method_handlers['tasks.setChecked'];

        // Set up fakeUserObject
        const fakeUserObject = { userId };

        // Run test
        setChecked.apply(fakeUserObject, [taskId, true]);

        // Verify that task is not deleted
        assert.equal(Tasks.find().count(), 1);
      });

      it('cannot set someone else\'s task checked', () => {
        // Set task to private
        Tasks.update(taskId, { $set: {private: true}});
        // Generate Random id to step
        const anotherUserId = Random.id();
        
        // Isolate setchecked method
        const setChecked = Meteor.server.method_handlers['tasks.setChecked'];

        // Set up a fake method fakeUserObject
        const fakeUserObject = { 'userId' : anotherUserId };

        // Run test
        assert.throws(function() {
          setChecked.apply(fakeUserObject, [taskId, true]);
        }, Meteor.Error, 'not-authorized')

        // Verify that task is not deleted
        assert.equal(Tasks.find().count(), 1);
      });
      
      it('can set task private', () => {
        // Isolate setPrivate method
        const setPrivate = Meteor.server.method_handlers['tasks.setPrivate'];

        // Set up fakeUserObject
        const fakeUserObject = { userId };

        // Run test
        setPrivate.apply(fakeUserObject, [taskId, true]);

        // Verify that task is not deleted
        assert.equal(Tasks.find().count(), 1);
      });

      it('cannot set someone else\'s task private', () => {
        // Set task to private
        Tasks.update(taskId, { $set: {private: true}});
        // Generate Random id to step
        const anotherUserId = Random.id();
        
        // Isolate setPrivate method
        const setPrivate = Meteor.server.method_handlers['tasks.setPrivate'];

        // Set up a fake method fakeUserObject
        const fakeUserObject = { 'userId' : anotherUserId };

        // Run test
        assert.throws(function() {
          setPrivate.apply(fakeUserObject, [taskId, true]);
        }, Meteor.Error, 'not-authorized')

        // Verify that task is not deleted
        assert.equal(Tasks.find().count(), 1);
      });

    });
  });
}