import React, { useState, useRef, useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity, PanResponder, Animated  } from 'react-native';
import Checkbox from 'expo-checkbox';
import { useNavigation } from '@react-navigation/native';       //to navigate to taskCreation page

import { globalContext } from '../globalContext';   // import globalcontext to access global variables across different screens

const TaskItem = (props) => {

    const navigation = useNavigation();

    const { primC, compleC } = useContext(globalContext);     // get data needed from globalContext

    // animated value
    const panX = useRef(new Animated.Value(0)).current;

    // pan responder
    // ref : https://youtu.be/vn12NQ1uFFU?si=EvQ8sY1OgFELaEWx
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder:()=> true,

            // when there is movement detected 
            onPanResponderMove: (event, gestureState)=>{
                if (gestureState.dx < 0){
                    panX.setValue(gestureState.dx);
                }
            },

            onPanResponderRelease: (event, gestureState) => {
                if (gestureState.dx < -50){                    
                    Animated.spring (panX, {
                        toValue: -135 ,
                        useNativeDriver: true,
                    }).start();
                }else{
                    Animated.spring(panX, {
                        toValue: 0,
                        useNativeDriver: true,
                    }).start();
                }
            },
        }),
        
    ).current;

    let dateInfo, startTimeInfo, endTimeInfo = false;
    let checkboxColor = null;
    // checking if the date, start time and end time has values
    if (props.taskObj.Date){
        dateInfo = true;
    }
    if (props.taskObj.StartsAt){
        startTimeInfo = true;
    }
    if (props.taskObj.EndsAt){
        endTimeInfo = true;
    }
    // for checkbox color (completed -> '#999696' else -> compleC )
    if (props.taskObj.completed){
        checkboxColor = '#999696';
    }else{
        checkboxColor = compleC;
    }
    
    return(
        
        <View style={styles.taskContainer} {...panResponder.panHandlers}>
            {/* // task item container which display checkbox, task info and start btn
            // if a task is pressed, it will lead to taskCreation page (for user to view full details of the task or update the task details)
            // So, onPress should lead to TaskCreation page and give task object (passed from Home or Today when they use TaskItem) as a parameter to the TaskCreation screen
            // so that we can display the task's data in the form if the existing task is being viewed. ref : https://reactnavigation.org/docs/params/ */}
            <TouchableOpacity style={[styles.taskItemContainer, {backgroundColor: props.taskObj.completed ? '#DBDBDB' : 'white' }]} onPress={()=> navigation.navigate('TaskCreation', {task: props.taskObj})}>    
                
                <Checkbox
                    value={props.taskObj.completed}
                    onValueChange={props.changeCheck}
                    style={styles.checkboxStyle}    
                    color= {checkboxColor}
                />
                <View>
                    
                    {/* task title */}
                    <View>
                        <Text style={[styles.taskTitleSyle, {color: props.taskObj.completed ? '#999696' : compleC}]}>{props.taskObj.Title}</Text> 
                    </View>
                
                
                    {/* only show the task details when the task is in either onGoing section or Your tasks section */}
                    { !props.taskObj.completed && (
                        // task details info container
                        <View style={styles.taskDetailsContainer}>
                            { dateInfo && (
                            // date
                            <Text style={styles.taskDetailsText}>{props.taskObj.Date}</Text> 
                            )}
                            { (startTimeInfo || endTimeInfo) && (
                                // start time - end time container
                                <View style={styles.taskTimeContainer}>
                                { startTimeInfo && (
                                    // start time
                                    <Text style={styles.taskDetailsText}>{props.taskObj.StartsAt}</Text>
                                )}
                                { startTimeInfo && endTimeInfo && (
                                    // -
                                    <Text style={styles.taskDetailsText}> - </Text>
                                )}
                                { endTimeInfo && (
                                    // end time
                                    <Text style={styles.taskDetailsText}>{props.taskObj.EndsAt}</Text>
                                )}
                                </View>
                            )}
                        </View>
                    )}
                    
                </View>  
                {/* only show the Start button in Your Tasks section */}
                {(!props.taskObj.onGoing && !props.taskObj.completed) && (
                    <TouchableOpacity style={styles.startBtnStyle}
                                    onPress={props.changeOngoing}>
                        <Text style={[styles.startBtnTextStyle, {color: compleC}]}>Start</Text>
                    </TouchableOpacity>
                )} 
            </TouchableOpacity>
            
            <Animated.View style={[styles.deleteBtnStyle, {transform: [{translateX: panX}]}]}>
                {/* delete button */}
                <TouchableOpacity onPress={props.deleteTask}>
                    <Text style={styles.deleteBtnTextStyle}>Delete</Text>
                </TouchableOpacity>
            </Animated.View>
        </View>


        
    )
}

const styles = StyleSheet.create({
    taskContainer: {
        flexDirection: 'row',
        width: '100%',
        margin: 5,
    },
    taskItemContainer : {
        backgroundColor: 'white', 
        borderRadius: 10, 
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        height: '100%'
    },
    taskTitleSyle: {
        fontSize: 16, 
        fontWeight: 'bold', 
    },
    checkboxStyle: {
        marginRight: '2%',
    },
    taskDetailsContainer: {
        flexDirection: 'row', 
        marginLeft: '3'
    },
    taskTimeContainer: {
        flexDirection: 'row', 
        marginLeft: '10'
    },
    taskDetailsText: {
        color: '#737373'
    },
    startBtnStyle: {
        marginLeft: 'auto', 
        marginRight: '2%'
    },
    startBtnTextStyle: { 
        fontWeight: 'bold'
    },
    deleteBtnStyle: {
        backgroundColor: 'red',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        height: '100%',
        width: '25%',
        right: '-35%',
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
        padding: 10,
    },
    deleteBtnTextStyle: {
        color: 'white',
        fontWeight: 'bold',
    }
});

export default TaskItem;