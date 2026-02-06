import { StatusBar } from 'expo-status-bar';
import React, { useState, useCallback, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage'; //importing async storage
import { useFocusEffect } from '@react-navigation/native';      //importing useFocusEffect for getting data whenever the screen is active

import { StyleSheet, Text, View, ScrollView } from 'react-native'; 
import { SafeAreaView } from 'react-native-safe-area-context';    //importing safe area view

import TaskItem from "../components/Task";    // importing custom component for tasks
import FloatingBtn from '../components/floatingBtn';     //importing custom component for floating buttons
import { globalContext } from '../globalContext';   // import globalcontext to access global variables across different screens

import { Dimensions } from 'react-native';

import {Calendar, CalendarList, Agenda} from 'react-native-calendars'; //for calendar by react native calendars
export default function Today({navigation}) {

  const { tasks, getTasksData, changeCompleted, changeOngoing, deleteTask, primC, compleC } = useContext(globalContext);     // get data needed from globalContext


  // function to change the task's Date format(8/22/2025) to this format (22-08-2025) (used to compare the returned date with 'selected' in view) 
  // gets called for rendering inside view  inside tasks.filter()
  const changeLocaleToDateObj = (dateToChange) =>{
    const splitDate = dateToChange.split("/");
    var mm;
    if (splitDate[0].length  == 1){
      mm = "0" + splitDate[0];
    }else{
      mm = splitDate[0];
    }
    var dd;
    if (splitDate[1].length == 1){
      dd = "0" + splitDate[1];
    }else{
      dd = splitDate[1];
    }
    return splitDate[2] + "-" + mm + "-" + dd;
  }

  // function to get the current date time, get the current date, and change to format (2025-08-22)
  const getTodayLocalString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  // selected is set default as today
  const [selected, setSelected] = useState(getTodayLocalString());
  
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
        <View style={[styles.fullView, {backgroundColor: primC}]}>  

          {/* calendar */}
          <Calendar
            style = {{ width: Dimensions.get('window').width, height: '350',}}
            theme={{
              todayTextColor: compleC,   
              textDayFontWeight: 'bold',
            }}
            onDayPress={day => {
              setSelected(day.dateString);    // return format > 2025-08-22
            }}
            markedDates={{
              [selected]: {selected: true, disableTouchEvent: true, selectedColor: primC}
            }}
          />
      
          
          {/* one category of tasks - Ongoing tasks*/}
          <View style={styles.taskSectionViewStyle}>
            {/* category title */}
            <Text style={[styles.categoryTitleStyle, {color: compleC}]}>Ongoing Task</Text>

            {/* list of tasks */}
            {tasks.filter(task => task.onGoing === true && task.completed === false  && task.Date && selected == changeLocaleToDateObj(task.Date)).length == 0 ? (
              <Text style={[styles.noTaskStyle, {color: compleC}]}>No ongoing tasks yet.</Text>
            ) : (
              tasks.filter(task => task.onGoing === true && task.completed === false  && task.Date && selected == changeLocaleToDateObj(task.Date)).map(task=>(
                <TaskItem key={task.id} taskObj={task} changeOngoing={()=>changeOngoing(task.id)} changeCheck={()=>changeCompleted(task.id)} deleteTask={() => deleteTask(task.id)}/>
              ))
            )}
          </View>


          {/* one category of tasks - Your tasks*/}
          <View style={styles.taskSectionViewStyle}>
            {/* category title */}
            <Text style={[styles.categoryTitleStyle, {color: compleC}]}>Your Tasks</Text>

            {/* list of tasks */}
            {tasks.filter(task => task.onGoing === false && task.completed === false && task.Date && selected == changeLocaleToDateObj(task.Date)).length == 0 ? (
              <Text style={[styles.noTaskStyle, {color: compleC}]}>No tasks yet.</Text>
            ) : (
              tasks.filter(task => task.onGoing === false && task.completed === false && task.Date && selected == changeLocaleToDateObj(task.Date)).map(task=>(
                <TaskItem key={task.id} taskObj={task} changeOngoing={()=>changeOngoing(task.id)} changeCheck={()=>changeCompleted(task.id)} deleteTask={() => deleteTask(task.id)}/>
              ))
            )}
          </View>


          {/* one category of tasks - Completed tasks*/}
          <View style={[styles.taskSectionViewStyle, {marginBottom: "5%"}]}>
            {/* category title */}
            <Text style={[styles.categoryTitleStyle, {color: compleC}]}>Completed Tasks</Text>

            {/* list of tasks */}
            {tasks.filter(task => task.onGoing === false && task.completed === true && task.Date && selected == changeLocaleToDateObj(task.Date)).length == 0 ? (
              <Text style={[styles.noTaskStyle, {color: compleC}]}>No completed tasks yet.</Text>
            ) : (
              tasks.filter(task => task.onGoing === false && task.completed === true && task.Date && selected == changeLocaleToDateObj(task.Date)).map(task =>(
                <TaskItem key={task.id} taskObj={task} changeOngoing={()=>changeOngoing(task.id)} changeCheck={()=>changeCompleted(task.id)} deleteTask={() => deleteTask(task.id)}/>              
              ))
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
