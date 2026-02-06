import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';


export const globalContext = createContext();

// for theme  settings
const themes = [
    {id: '1', primary: '#ADE8F4', complementary:'#456D75'},    // light baby blue
    {id: '2', primary: '#FAC3AA', complementary:'#7A5B4C'},    // peachy pink
    {id: '3', primary: '#B9FBC0', complementary:'#457A4A'},    // mint green
    {id: '4', primary: '#FFE999', complementary:'#807759'},    // light yellow
    {id: '5', primary: '#E7C6FF', complementary:'#664280'},    // soft purple
    {id: '6', primary: '#F5BE8E', complementary:'#756454'},    // Macaroni And Cheese
    {id: '7', primary: '#A3AAD4', complementary:'#2D3354'},    // Echo Blue
    {id: '8', primary: '#D18D7D', complementary:'#57403B'},     // warm pink
    {id: '9', primary: '#80D291', complementary:'#3C5741'},    // light green
    {id: '10', primary: '#D1BD80', complementary:'#5C5644'},     // Verona Gold
]

export function GlobalContextProvider ({children}){
    // ABOUT TASK DATA AND FUNCTION 
    // variable to store the stored tasks
    const [tasks, setTasks] = useState([]); 

    // notification permission enabled or disabled variable     //os level permission for notification
    const [notiPermission, setNotiPermission] = useState(null);


    // function which fetches stored data
    const getTasksData = async ()=>{
        try{
            // fetch the stored tasks
            const existingTasks = await AsyncStorage.getItem('tasksData');
            // no tasks yet
            if (existingTasks == null){
                setTasks([])    //store empty array 
            }else{    // stored tasks exist
                setTasks(JSON.parse(existingTasks));    //store tasks in tasks
            }
        } catch(err){
            console.log(`Something bad happened -> ${err}`);
        }
    };
    
    // call this function when the task's checkbox is checked or unchecked (gets called in Task.js)(pass it as props to Task component)
    const changeCompleted = async (taskId) =>{   //taskKey is a unique key representing a specific task
        const updatedTasks = tasks.map(task=>   //looping through all the tasks 
            task.id == taskId                 // if the current task of the array is the task being checked
            ? {...task, onGoing: false, completed: !task.completed,}     //change the completed from false to true or true to false
            : task                                 // if the current task of array is not the task being checked, do nothing, just return the original task object
        );
        setTasks(updatedTasks)
        await AsyncStorage.setItem('tasksData', JSON.stringify(updatedTasks));
    };


    // call this function when the task's checkbox is checked or unchecked (gets called in Task.js)(pass it as props to Task component)
    const changeOngoing = async (taskId) =>{   //taskKey is a unique key representing a specific task
        const updatedTasks = tasks.map(task=>   //looping through all the tasks 
            task.id == taskId                 // if the current task of the array is the task being checked
            ? {...task, onGoing: true}     //change the completed from false to true or true to false
            : task                                 // if the current task of array is not the task being checked, do nothing, just return the original task object
        );
        setTasks(updatedTasks)
        await AsyncStorage.setItem('tasksData', JSON.stringify(updatedTasks));
    };

    
    // deleting a task with taskId (gets called in Task.js)(pass it as props to Task component)
    const deleteTask = async (taskId) => {
        const updatedTasks = tasks.filter(task => task.id !== taskId);
        setTasks(updatedTasks);
        await AsyncStorage.setItem("tasksData", JSON.stringify(updatedTasks));
    };



    // ABOUT SETTINGS PAGE'S THEME DATA, NOTIFICATION, VIBRATION AND FUNCTION
    // theme color change based on TouchOpacity press
    const [themeColorId, setThemeColorId] = useState(1);    //set 1 (my app's default color)
    const [globalNotiEnabled, setGlobalNotiEnabled] = useState(true)        // default - noti on
    const [globalVibrateEnabled, setGlobalVibrateEnabled] = useState(true)        // default - vibration on


    // use selected theme if already selected when app load
    useEffect(() => {

        
        // notification permission
        const notiPermissionReq = async() => {
            const {status} = await Notifications.requestPermissionsAsync();
            if (status === "granted") {
                setNotiPermission(true); 
            } else {
                setNotiPermission(false);
            }
        };

        // settings choice memory
        const loadSettings = async () => {
            // get theme id from memory
            const storedThemeColorId = await AsyncStorage.getItem('themeColorId');
            // if any selected id is there, use that to set the color 
            if (storedThemeColorId){
                setThemeColorId(storedThemeColorId);
            }

            // get notification on/off setting from memory
            const storedNotiState = await AsyncStorage.getItem('notiEnabled');
            // if something is stored there,
            if (storedNotiState){
                setGlobalNotiEnabled(JSON.parse(storedNotiState));
            }

            // get vibration on/off setting from memory
            const storedVibrateState = await AsyncStorage.getItem('vibrationEnabled');
            // if something is stored there,
            if (storedVibrateState){
                setGlobalVibrateEnabled(JSON.parse(storedVibrateState));
            }
        };

        //request noti permission when app starts
        notiPermissionReq();
        
        // load setting choice from memory
        loadSettings();

        
    }, []);

    // default primary and complementary color
    var primC = '#ADE8F4';  
    var compleC = '#456D75';

    // setting colors based on themeColor State
    for (let i=0; i < themes.length; i++){
        if (themes[i].id == themeColorId){
            primC = themes[i].primary;        //selected primary color
            compleC = themes[i].complementary;    //selected complementary color
        }
    }

    // set handler that will cause notification
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowBanner: true,
            shouldShowList: true,
            shouldPlaySound: false,
            shouldSetBadge: false,
        }),
    });
    
    // called from Settings Page's ThemeColor settings
    const handleThemeChange = async (themeColorId) => {
        setThemeColorId(themeColorId);    // change themeColor 
        await AsyncStorage.setItem('themeColorId', themeColorId);   // store themeColorId in memory (to access from other screens)
    }   
    
    // called from Settings Page's Notification settings
    const toggleGlobalNotiChange = async (value) => {
        setGlobalNotiEnabled(value);    // set value of toggle
        await AsyncStorage.setItem('notiEnabled', JSON.stringify(value));           //save in memory
        if (!value){        // if notification is off, turn off all scheduled noti
            await Notifications.cancelAllScheduledNotificationsAsync();
        }
    };

    // called from Settings Page's Vibration settings
    const toggleGlobalVibrationChange = async(value) =>{
        setGlobalVibrateEnabled(value);     //set value of toggle
        await AsyncStorage.setItem('vibrationEnabled', JSON.stringify(value));      //save in memory
    }


    return(
        <globalContext.Provider value={{ tasks, getTasksData, changeCompleted, changeOngoing, deleteTask, 
                                         handleThemeChange, primC, compleC, themes, globalNotiEnabled, toggleGlobalNotiChange, globalVibrateEnabled, toggleGlobalVibrationChange}}>
            {children}
        </globalContext.Provider>
    )
}