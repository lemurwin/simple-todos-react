import React, { useState, Fragment } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { TasksCollection } from '/imports/db/TasksCollection';
import { Task } from './Task';
import { TaskForm } from './TaskForm';
import { LoginForm } from './LoginForm';

const toggleChecked = ({ _id, isChecked }) => {
  Meteor.call('tasks.setIsChecked', _id, !isChecked);
};

const deleteTask = ({ _id })=> Meteor.call('tasks.remove', _id);


export const App = () => {
  const user = useTracker(() => Meteor.user());

  const [hideCompleted, setHideCompleted] = useState(false);
  const hideCompletedFilter = { isChecked: { $ne: true } };
  const userFilter = user ? { userId: user._id } : {};
  const pendingOnlyFilter = { ...hideCompletedFilter, ...userFilter };


  // const tasks = useTracker(() => {
  //   if (!user) {
  //     return [];
  //   }

  //   return TasksCollection.find(
  //     hideCompleted ? pendingOnlyFilter : userFilter,
  //     {
  //       sort: { createdAt: -1 },
  //     }
  //   ).fetch();
  // });
  
  // const pendingTasksCount = useTracker(() => {
  //   if (!user) {
  //     return 0;
  //   }

  //   return TasksCollection.find(pendingOnlyFilter).count();
  // });

  const { tasks, pendingTasksCount, isLoading } = useTracker(() => {
    const noDataAvailable = { tasks: [], pendingTasksCount: 0 };
    if (!Meteor.user()){
      return noDataAvailable;
    }
    const handler = Meteor.subscribe('tasks');
    
    if (!handler.ready()) {
      return { ...noDataAvailable, isLoading:true };
    }

    const tasks = TasksCollection.find(
      hideCompleted ? pendingOnlyFilter : userFilter,
      {
        sort: { createdAt:-1 },
      }
    ).fetch();
    const pendingTasksCount = TasksCollection.find(pendingOnlyFilter).count();

    return { tasks, pendingTasksCount };

  });

  const pendingTasksTitle = `${
    pendingTasksCount ? ` (${pendingTasksCount})` : ''
  }`;
  const logout = () => Meteor.logout();
  return (
    <div className="app">
      <header>
        <div className="app-bar">
          <div className="app-header">
            <h1>📝️ To Do List {pendingTasksTitle}</h1>

          </div>
        </div>
      </header>

      <div className="main">
        {user ? (
          <Fragment>
              <div className="user" onClick={logout}>
                <a href="#">{user.username} 🚪</a>
              </div>
              <TaskForm  />

              <div className="filter">
              <button onClick={() => setHideCompleted(!hideCompleted)}>
                {hideCompleted ? 'Show All' : 'Hide Completed'}
              </button>
            </div>

              {isLoading && <div className="loading">loading...</div> }
              <ul className="tasks">
                { tasks.map(task => <Task 
                key={ task._id } 
                task={ task } 
                onCheckboxClick={toggleChecked}
                onDeleteClick={deleteTask}
                />) }
              </ul>
        </Fragment>
        ) : (
          <LoginForm />
        )}
      </div>
    </div>
  );
  
};



// const tasks = [
//   {_id: 1, text: 'Engage the Current Meeting'},
//   {_id: 2, text: '2Degrees Platform choice'},
//   {_id: 3, text: '360 Plugin'},meteo
//   {_id: 4, text: 'Landing Page for 2Degrees'},
//   {_id: 5, text: 'Fixing Philippe V'}

// ]