import { StatusBar } from 'expo-status-bar';

import { StyleSheet, Text, View, ScrollView, Button, TouchableOpacity } from 'react-native'; 
import { SafeAreaView } from 'react-native-safe-area-context';    //importing safe area view
import { useFocusEffect } from '@react-navigation/native';      //importing useFocusEffect for getting data whenever the screen is active
import React, { useState, useCallback, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage'; //importing async storage

import TaskItem from "../components/Task";    // importing custom component for tasks
import FloatingBtn from '../components/floatingBtn';     //importing custom component for floating buttons
import { globalContext } from '../globalContext';   // import globalcontext to access global variables across different screens

export default function Home({navigation}) {

  const { tasks, getTasksData, changeCompleted, changeOngoing, deleteTask, primC, compleC } = useContext(globalContext);     // get data needed from globalContext
  useFocusEffect(
    useCallback(()=>{
      // get data
      getTasksData();
    },[])
  )

  return (
    <SafeAreaView style={{ flex: 1 }} edges={[]}>
      <ScrollView contentContainerStyle={{flexGrow: 1}}>
        {/* full screen */}
        <View style={[styles.fullView, { backgroundColor: primC }]}>  

          {/* one category of tasks - Ongoing tasks*/}
          <View style={styles.taskSectionViewStyle}>
            {/* category title */}
            <Text style={[styles.categoryTitleStyle, {color: compleC}]}>Ongoing Tasks</Text>

            {/* list of tasks */}
            {tasks.filter(task => task.onGoing === true && task.completed === false).length == 0 ? (
              <Text style={[styles.noTaskStyle, {color: compleC}]}>No ongoing tasks yet.</Text>
            ) : (
              tasks.filter(task => task.onGoing === true && task.completed === false).map(task=>(
                <TaskItem key={task.id} taskObj={task} changeOngoing={()=>changeOngoing(task.id)} changeCheck={()=>changeCompleted(task.id)} deleteTask={() => deleteTask(task.id)}/>                    ))
            )}
          </View>

          {/* one category of tasks - Your tasks*/}
          <View style={styles.taskSectionViewStyle}>
            {/* category title */}
            <Text style={[styles.categoryTitleStyle, {color: compleC}]}>Your Tasks</Text>

            {/* list of tasks */}
            {tasks.filter(task => task.onGoing === false && task.completed === false).length == 0 ? (
              <Text style={[styles.noTaskStyle, {color: compleC}]}>No tasks yet.</Text>
            ) : (
              tasks.filter(task => task.onGoing === false && task.completed === false).map(task=>(
                <TaskItem key={task.id} taskObj={task} changeOngoing={()=>changeOngoing(task.id)} changeCheck={()=>changeCompleted(task.id)} deleteTask={() => deleteTask(task.id)}/>                    ))
            )}
          </View>


          {/* one category of tasks - Completed tasks*/}
          <View style={[styles.taskSectionViewStyle, {marginBottom: "5%"}]}>
            {/* category title */}
            <Text style={[styles.categoryTitleStyle, {color : compleC}]}>Completed Tasks</Text>

            {/* list of tasks */}
            {tasks.filter(task => task.onGoing === false && task.completed === true).length == 0 ? (
              <Text style={[styles.noTaskStyle, {color: compleC}]}>No completed tasks yet.</Text>
            ) : (
              tasks.filter(task => task.onGoing === false && task.completed === true).map(task =>(
                <TaskItem key={task.id} taskObj={task} changeOngoing={()=>changeOngoing(task.id)} changeCheck={()=>changeCompleted(task.id)} deleteTask={() => deleteTask(task.id)}/>                    ))
            )}
          </View>


        </View>
      </ScrollView>

      {/* floating button + for task creation form */}
      <FloatingBtn navigation={navigation}/>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullView: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal : '5%',
  },
  categoryTitleStyle: {
    fontSize: 35, 
    paddingBottom: 5,
    fontWeight: 'bold'
  },
  taskSectionViewStyle: {
    width: '100%', 
    marginTop: '5%',
  },
  noTaskStyle: {
    fontSize: 20,
    paddingHorizontal: '5%'
  }
});
