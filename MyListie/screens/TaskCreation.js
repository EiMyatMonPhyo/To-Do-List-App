import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Image, Alert } from 'react-native'; 
import { SafeAreaView } from 'react-native-safe-area-context';    //importing safe area view
import { Dropdown } from 'react-native-element-dropdown';   //importing drop down
import AsyncStorage from '@react-native-async-storage/async-storage'; //importing async storage
import DateTimePicker from '@react-native-community/datetimepicker';    // importing date time picker
import * as ImagePicker from 'expo-image-picker';   // importing image picker
import * as Notifications from 'expo-notifications';  //importing notification

import { globalContext } from '../globalContext';   // import globalcontext to access global variables across different screens

export default function TaskCreation({navigation, route}) {
  
  const { primC, compleC, globalNotiEnabled, globalVibrateEnabled } = useContext(globalContext);     // get data needed from globalContext
  
  // function to change date format (8/22/2025) to usable date format(js Date()) in calendar
  const changeLocaleToDateObj = (dateToChange) =>{
    if (dateToChange == null){
      return null;
    }
    const splitDate = dateToChange.split("/");
    let mm;
    if (splitDate[0].length  == 1){
      mm = "0" + splitDate[0];
    }else{
      mm = splitDate[0];
    }
    let dd;
    if (splitDate[1].length == 1){
      dd = "0" + splitDate[1];
    }else{
      dd = splitDate[1];
    }
    const changedDate = new Date(splitDate[2] + "-" + mm + "-" + dd);
    return changedDate;
  }

  // function to change time format (5:50 PM) to usable date format (js Date()) in calendar
  const changeLocaleTimeToDateObj = (timeToChange) =>{
    if (timeToChange == null){
      return null;
    }
    // have to remove no break space (toLocaleTimeString returns a string with no break space, I replace that with space(blank) then, split again the first part to get hh and mm)
    const removeNoBreakSpace = timeToChange.replace(/\u202F/g, " ");     //ref : https://stackoverflow.com/questions/75406192/javascript-tolocaletimestring-returning-ascii-226-instead-of-space-in-latest-v
    const timeSplit = removeNoBreakSpace.split(" "); // ["5:50", "PM"]
    const hhmm = timeSplit[0].split(":");   //["5","50"]
    let hh = parseInt(hhmm[0]);   //change from string to number
    let mm = parseInt(hhmm[1]);   //change from string to number

    if (timeSplit[1] == "PM" && hh < 12) {    // if it is 1PM to 11PM, then we add 12 hours to it to change to 24 hours format.
      hh += 12;
    }
    if (timeSplit[1] == "AM" && hh == 12) {     // if it is 12:00 AM , change to 00:00
      hh = 0;
    }

    const now = new Date();   //current date
    const changedDate = new Date(
      now.getFullYear(),    //today date's year
      now.getMonth(),     //today date's month
      now.getDate(),    //today date's date
      hh,    // task's time hour
      mm,    //task's time minute
      0     // use 0 as second
    );
    return changedDate;
  }
 
  var task = null;     //variable representing whether it is visiting existing task or creating a new one
  // var convertedDate = null;
  if (route.params){    //param exists. It is viewing existing task. Details are needed
    task = route.params.task;     // we passed an object as an object in this format-> {task : {the object we need to use}}
  }else{    //param does not exist. It is creating a new task. blank fields.
    task = null;
  }

  
  const [title, setTitle] = useState(task? task.Title : '');
  const [description, setDescription] = useState(task? task.Description : '');   
  const [date, setDate] = useState(task && task.Date? changeLocaleToDateObj(task.Date) : new Date());     //set it current time (to show current date in the form by default)
  const [startsAt, setStartsAt] = useState(task && task.StartsAt? changeLocaleTimeToDateObj(task.StartsAt) : null);
  const [endsAt, setEndsAt] = useState(task && task.EndsAt? changeLocaleTimeToDateObj(task.EndsAt) : null);
  const [remindsAt, setRemindsAt] = useState(task? task.RemindsAt : null);   //Reminds at dropdown value
  const [repeatsAt, setRepeatsAt] = useState(task? task.RepeatsAt : null);   //Repeats at dropdown value
  const [images, setImages] = useState(task? task.images : []);     //to store images
  const [showCalendar, setShowCalendar] = useState(false);    //calendar show or not
  const [showStartPicker, setShowStartPicker] = useState(false);    // time picker show or not
  const [showEndPicker, setShowEndPicker] = useState(false);    //time picker show or not


  // value for remindsAt drop down list
  const remindsTimeData = [
    { label: 'None', value: null },
    { label: '10 minutes before', value: '10 min' },
    { label: '30 minutes before', value: '30 min' },
    { label: '1 hour before', value: '1 hour' },
    { label: '2 hours before', value: '2 hour' },
    { label: '3 hours before', value: '3 hour' },
    { label: '1 day before', value: '1 day' },
  ];
  
  // value for repeatsAt drop down list
  const repeatsTimeData = [
    { label: 'None', value: null },
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'monthly', value: 'monthly' },
  ];

  // used for calendar onChange event
  const calendarDateChange =(event, selectedDate)=>{
    if (event.type == "set" && selectedDate){     //if a date is selected
      setDate(selectedDate);      //store date
    }
    setShowCalendar(false);   //hide calendar date picker
  }

  // usef for Starts At onChange event
  const startsAtChange = (event, selectedTime)=>{   
    if (event.type == "set" && selectedTime){   //if time is selected
      setStartsAt(selectedTime);    //store startsAt
    }
    setShowStartPicker(false);    //hide time picker
  }

  // usef for ends At onChange event
  const endsAtChange = (event, selectedTime)=>{
    if (event.type == "set" && selectedTime){     // if time is selected
      setEndsAt(selectedTime);    //store endsAt
    }
    setShowEndPicker(false);    //hide time picker
  }

  // image picker : selecting image from phone
  const pickImage = async () => {
    // launch image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes:['images'],    //image only
      quality: 1,   //highest quality
    });

    // if image is selected
    if (!result.canceled) {
      setImages([...images, result.assets[0].uri]);   // result.assets is an array of selected images. Store image uri in images
    }
  };

  // REMINDER LOGIC //
  const setNotiAtRemindDateTime = async(title, date, startsAt, remindsAt) => {
    // input : scheduled date & time for the task
        let remindDateTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), startsAt.getHours(), startsAt.getMinutes(), 0);   

        
        // calculate time to notify based on date, startsAt and remindsAt values
        if (remindsAt == '10 min'){
          remindDateTime.setMinutes(remindDateTime.getMinutes() - 10);
        }else if (remindsAt == '30 min'){
          remindDateTime.setMinutes(remindDateTime.getMinutes() - 30);
        }else if (remindsAt == '1 hour'){
          remindDateTime.setHours(remindDateTime.getHours() - 1);
        }else if (remindsAt == '2 hour'){
          remindDateTime.setHours(remindDateTime.getHours() - 2);
        }else if (remindsAt == '3 hour'){
          remindDateTime.setHours(remindDateTime.getHours() - 3);
        }else if (remindsAt == '1 day'){
          remindDateTime.setDate(remindDateTime.getDate() - 1);
        }

        // set noti 
        // https://stackoverflow.com/questions/56117858/no-sound-or-vibration-in-android-push-notifications-in-expo-client
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Task Reminder',
            body: ` ${title} - You have a task in ${remindsAt}`,
            sound: true,
            vibrate: globalVibrateEnabled? true : undefined,    //vibrate based on settings' vibration
          },
          trigger: {
            type: 'date',
            date: remindDateTime,   // your Date object
          },
           
        });
  };

  // when save task button is pressed, call this.
  const saveTask = async () => {
    const now = new Date();   //current date time
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());     //today at 00:00:00
    
    // only task title is required to create the task. no task is created without task title.
    if (title === ""){
      Alert.alert("Task title field is required.");   // alert user about the requirement
      return;     //will not accept the task input
    }

    // valid date check
    if (date && date < today) {   // if the date (input) is not null and it is earlier than today
      Alert.alert("Date cannot be earlier than today.");    //alert user about the invalid date
      return;   //will not accept the task input 
    } 

    // valid start time check
    // if the date and startsAt are both not null and 
    // selected date is today (today.toLocaleDateString()'s format : 8/20/2025) and 
    // selected startsAt is earlier than current time (now's format : Wed Aug 20 2025 01:36:17 GMT+0630)
    if (date && startsAt && date.toLocaleDateString() == today.toLocaleDateString() && startsAt < now){
      Alert.alert("Start time cannot be earlier than current time.");   //alert user about the invlid start time
      return;   //will not accept the task input
    }

    // valid end time check
    // if startsAt and endsAt are both not null and 
    // endsAt is earlier than startsAt
    if (startsAt && endsAt && endsAt < startsAt){
      Alert.alert("End time cannot be earlier than start time");    //alert user about the invalid end time
      return;     //will not accept the task input
    }


    try{

      // get existing tasks data
      const existingTasks = await AsyncStorage.getItem('tasksData');

      let tasks = []; 
      // if there is existing data 
      if (existingTasks != null){
        // get the existing tasks
        tasks = JSON.parse(existingTasks);    //parsing to get back [], not string
      }else{
        // no existing task, create a new array
        tasks = []
      }


      if (task){
        // if it is viewing/updating existing task's data, update current task with updated data
        for (let i=0; i < tasks.length; i++){
          if (tasks[i].id == task.id){    // update the task of the same id in the array
            tasks[i].Title = title;
            tasks[i].Description = description;
            tasks[i].Date = date ? date.toLocaleDateString() : null;  // save it in m/d/yyyy format (8/20/2025)
            tasks[i].StartsAt = startsAt ? startsAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit"}) : null;    //save it in format 12:20AM
            tasks[i].EndsAt = endsAt ? endsAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit"}) : null;    //save it in format 12:20AM
            tasks[i].RemindsAt = remindsAt;
            tasks[i].RepeatsAt = repeatsAt;
            tasks[i].images = images;
            // onGoing and completed - no need to update (they are not in the form.)
          }
        }
        
        // to use in repeatsAt code logic below ( in this block -->> if (repeatsAt && date){...})
        var taskFormData = {
          id: task.id,
          Title : title,
          Description : description,
          Date : date ? date.toLocaleDateString() : null,   // save it in m/d/yyyy format (8/20/2025)
          StartsAt : startsAt ? startsAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit"}) : null,    //save it in format 12:20AM
          EndsAt : endsAt ? endsAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit"}) : null,    //save it in format 12:20AM
          RemindsAt : remindsAt,
          RepeatsAt : repeatsAt,
          images: images,
          onGoing: task.onGoing,
          completed: task.completed 
        };
        
      }else{
        // new task creating

        // a task's data from the form + onGoing and Completed states
        var taskFormData = {    //new task
          id: Date.now().toString(),
          Title : title,
          Description : description,
          Date : date ? date.toLocaleDateString() : null,   // save it in m/d/yyyy format (8/20/2025)
          StartsAt : startsAt ? startsAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit"}) : null,    //save it in format 12:20AM
          EndsAt : endsAt ? endsAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit"}) : null,    //save it in format 12:20AM
          RemindsAt : remindsAt,
          RepeatsAt : repeatsAt,
          images: images,
          onGoing: false,
          completed: false
        };
      
        // add new task data to tasks (existing data)
        tasks.push(taskFormData);
      }


      // REMINDER LOGIC //
      // reminder notification
      if (globalNotiEnabled && remindsAt && startsAt && date){   //if there is date, startsAt and remindsAt selected 
        setNotiAtRemindDateTime(title, date, startsAt, remindsAt);
      }
      // END OF REMINDER LOGIC //

      
      // REPEATS LOGIC //
      // handle repeating tasks
      // if there is a value for repeatsAt and date
      if (repeatsAt && date){
        // produce new date based on user's input of repeatsAt
        let repeatedDate = new Date(date);    //get input date by user (to be used to create new tasks with repeatedDate later)
        for (let i=0; i < 4; i++){    //wanna do 5 task for each repeating task, (1 is already saved above, so only four left)
          if (repeatsAt == "daily"){      //date + 1
            repeatedDate.setDate(repeatedDate.getDate() + 1);
          }else if (repeatsAt == "weekly"){   //date + 7
            repeatedDate.setDate(repeatedDate.getDate() + 7);
          }else if (repeatsAt == "monthly"){    //month + 1
            repeatedDate.setMonth(repeatedDate.getMonth() + 1);
          }

          // creating new task with different date and id
          let newRepeatingTask = {
            ...taskFormData,
            id : Date.now().toString() + '_' + i,
            Date : repeatedDate.toLocaleDateString()
          };

          // add to tasks array
          tasks.push(newRepeatingTask);
          if (globalNotiEnabled && remindsAt && startsAt && repeatedDate){
            setNotiAtRemindDateTime(title, repeatedDate, startsAt, remindsAt);
          }
          
        }
      }
      // END OF REPEAT LOGIC //




      // save all tasks + created task
      await AsyncStorage.setItem('tasksData', JSON.stringify(tasks));   // must change to string representation (if not, it become object)
      if (task){
        Alert.alert("Task successfully updated");
      }else{
        Alert.alert("Task successfully created");
      }

      // set to initial state for next input
      setTitle("");
      setDescription("");
      setDate(new Date());
      setStartsAt(null);
      setEndsAt(null);
      setRemindsAt(null);
      setRepeatsAt(null);
      setImages([]);

      navigation.goBack()
    }catch(err){
      console.log(`Something bad happened -> ${err}`);
    };
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={[]}>
        <ScrollView contentContainerStyle={{flexGrow: 1, backgroundColor: primC, paddingVertical: 20 }}>  

            <View style={{ alignItems: 'center', width: '100%'}}>
              <Text style={ [styles.titleStyle, {color: compleC}] }>What is your task?</Text>
              
              {/* one row of input form */}
              <View style={styles.inputRow}>
                  <Text style={ styles.inputTitleStyle }>Task title</Text>
                  <View style={ styles.inputFieldContainerStyle}>
                    <TextInput
                        style={styles.inputStyle}
                        placeholder="Your task name"
                        placeholderTextColor="#999999"
                        onChangeText={value => setTitle(value)}
                        value ={title}
                    /> 
                  </View> 
              </View>

              {/* one row of input form */}
              <View style={styles.inputRow}>
                  <Text style={ styles.inputTitleStyle }>Description</Text>
                  <View style={ styles.inputFieldContainerStyle}>
                    <TextInput
                        style={styles.inputStyle}
                        placeholder="Task description (Optional)"
                        placeholderTextColor="#999999"
                        onChangeText={value => setDescription(value)}
                        value ={description}
                    /> 
                  </View> 
              </View>

              {/* one row of input form */}
              <View style={styles.inputRow}>
                  <Text style={ styles.inputTitleStyle }>Date</Text>
                  {/*  */}
                  <View flexDirection='row' style={styles.dateTimeInputStyle}>
                    {/* button to show the calendar date picker */}
                    <TouchableOpacity onPress={()=>setShowCalendar(true)}>
                      {/* show Select a date if nothing is selected, show date if a date is selected */}
                      <Text style={{fontSize: 14}}>{ date ? date.toLocaleDateString() : "Select a date (Optional)"}</Text>
                    </TouchableOpacity>
                    {/* button to clear the date (set null) in form */}
                    <TouchableOpacity onPress={()=>setDate(null)}>
                      <Text style={{fontSize: 14, color: 'red'}}>clear</Text>
                    </TouchableOpacity>
                  
                  </View>
                  {/* Calendat date picker */}
                  {showCalendar && (
                    <DateTimePicker
                      value={date}
                      mode='date'
                      display='default'
                      onChange={calendarDateChange}
                    />
                  )}
              </View>

              {/* starts at - time picker */}
              <View style={styles.inputRow}>
                  <Text style={ styles.inputTitleStyle }>Starts at</Text>
                  <View flexDirection='row' style={styles.dateTimeInputStyle}>
                    {/* button to show the time picker */}
                    <TouchableOpacity onPress={()=>setShowStartPicker(true)}>
                      <Text style={{fontSize: 14}}>
                        {/* show time (12:00 AM) if time is not null(selected), show "select start time" if nothing is inputted*/}
                        { startsAt ? startsAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit"}) : "Select Start time (Optional)" }
                      </Text>
                    </TouchableOpacity>
                    {/* show clear button to set the startsAt null when time is already inputted. */}
                    { startsAt && (
                      <TouchableOpacity onPress={()=>setStartsAt(null)}>
                        <Text style={{fontSize: 14, color: 'red'}}>clear</Text>
                      </TouchableOpacity> 
                    )}
                  </View>
                  {/* time picker */}
                  {showStartPicker && (
                    <DateTimePicker
                      value={startsAt|| new Date()}
                      mode='time'
                      display='default'
                      onChange={startsAtChange}
                    />
                  )}
              </View>

              {/* Ends at -time picker */}
              <View style={styles.inputRow}>
                  <Text style={ styles.inputTitleStyle }>Ends at</Text>
                  <View flexDirection='row' style={styles.dateTimeInputStyle}>
                    {/* button to show the time picker */}
                    <TouchableOpacity onPress={()=>setShowEndPicker(true)}>
                      <Text style={{fontSize: 14}}>
                        {/* show time (12:00 AM) if time is not null(selected), show "select end time" if nothing is inputted*/}
                        { endsAt ? endsAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit"}) : "Select End time (Optional)" }
                      </Text>
                    </TouchableOpacity>
                    {/* show clear button to set the endsAt null when time is already inputted. */}
                    { endsAt && (
                    <TouchableOpacity onPress={()=>setEndsAt(null)}>
                      <Text style={{fontSize: 14, color: 'red'}}>clear</Text>
                    </TouchableOpacity> 
                    )}
                  </View>
                  {/* time picker */}
                  {showEndPicker && (
                    <DateTimePicker
                      value={endsAt|| new Date()}
                      mode='time'
                      display='default'
                      onChange={endsAtChange}
                    />
                  )}
              </View>

              {/* Reminds at - drop down input */}
              <View style={styles.inputRow}>
                <Text style={ styles.inputTitleStyle }>Reminds at</Text>
                <Dropdown
                style={styles.dropdownStyle}
                placeholderStyle={styles.dropDownPlaceholderStyle}
                selectedTextStyle={styles.dropDownSelectedTextStyle}
                data={remindsTimeData}
                maxHeight={150}
                labelField="label"
                valueField="value"
                placeholder="Select item (Optional)"
                value={remindsAt}
                onChange={item => setRemindsAt(item.value)}
                />
              </View>


              {/* Repeats at - drop down input */}
              <View style={styles.inputRow}>
                <Text style={ styles.inputTitleStyle }>Repeats at</Text>
                <Dropdown
                style={styles.dropdownStyle}
                placeholderStyle={styles.dropDownPlaceholderStyle}
                selectedTextStyle={styles.dropDownSelectedTextStyle}
                data={repeatsTimeData}
                maxHeight={150}
                labelField="label"
                valueField="value"
                placeholder="Select item (Optional)"
                value={repeatsAt}
                onChange={item => setRepeatsAt(item.value)}
                />
              </View>
              
              {/* add image */}
              <View style={{ width: '80%',  marginVertical: 10 }}>
                {/* add image from Gallery */}
                <TouchableOpacity onPress={pickImage} style={{margin: '2%'}}>
                  {/* leads to camera to add image */}
                  <Text style={{color: compleC, fontWeight: 'bold', textAlign: 'center'}}>Add Image from Gallery</Text>   
                </TouchableOpacity>
                
                {/* show scroll view if there is image */}
                {images.length > 0 && (
                  // {/* horizontal scrollview to display the images */}
                  <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                    {/* images already added */}
                    {images.map((img, index) => (
                      <Image
                        key={index}
                        source={{ uri: img }}
                        style={styles.imageStyle}
                      />
                    ))}
                  </ScrollView>
                )}
              </View>


              {/* Save button */}
              <View style={{ marginVertical: '5%' }}>
                  <TouchableOpacity style={[styles.btnStyle, {backgroundColor: compleC}]} onPress={saveTask}>
                      <Text style={styles.btnTextStyle}>Save Task!</Text>
                  </TouchableOpacity>
              </View>
          </View>
        </ScrollView>
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
  titleStyle:{
    fontSize : 35,
    marginBottom: '7%'
  },
  inputRow: {
    width: '80%',
    flexDirection: 'row',
    alignItems: 'center',   //vertically center label and field
    justifyContent: 'flex-end',
    marginVertical: 5,
  },
  inputTitleStyle: {
    fontSize: 16,
    textAlign: 'right',
    marginRight: '1%',
  },
  inputFieldContainerStyle: {
    width: '65%',
    height:'100%',
    alignContent: 'flex-end',
    marginLeft: 5,
  },
  inputStyle: {
    backgroundColor: '#FFFFFF',
    borderRadius: 11,
    fontSize: 14,
    paddingHorizontal: '4%',
  },
  dateTimeInputStyle: {
    backgroundColor: '#FFFFFF',
    borderRadius: 11,
    width: '65%',
    height:'100%',
    marginLeft: 5,
    marginVertical: '3%',
    fontSize: 14,
    paddingHorizontal: '4%',
    flexDirection: "row",    //to make vertically center (because I cannot do that with justifyContent)
    alignItems: "center", 
    justifyContent: "space-between"
  },
  btnStyle: {
    paddingHorizontal: '5%',
    paddingVertical: '3%',
    borderRadius: 50,
    alignItems: 'center'
  },
  btnTextStyle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: 'bold'
  },
  dropdownStyle: {
    height: '40',
    width: '65%',
    marginLeft: '3%',
    backgroundColor: '#FFFFFF',
    borderRadius: 11,
  },
  dropDownPlaceholderStyle:{
    color: '#999999',
    paddingLeft: '4%',
    fontSize: 14,
  },
  dropDownSelectedTextStyle: {
    color: '#000000',
    paddingLeft : '4%',
    fontSize: 14
  },
  imageStyle:{
    width: 50, 
    height: 50, 
    marginHorizontal:'2%'
  }
});
