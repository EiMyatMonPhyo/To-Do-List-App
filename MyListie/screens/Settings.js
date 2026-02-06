import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import React, { useState, useContext } from 'react';
import { StyleSheet, Text, View, ScrollView, Switch, TouchableOpacity } from 'react-native'; 
import { SafeAreaView } from 'react-native-safe-area-context';    //importing safe area view
import { globalContext } from '../globalContext';


export default function Settings() {

  const { handleThemeChange, primC, compleC, themes, globalNotiEnabled, toggleGlobalNotiChange, globalVibrateEnabled, toggleGlobalVibrationChange } = useContext(globalContext);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={[]}>
      <ScrollView contentContainerStyle={{flexGrow: 1}}>
        <View style={{ flex: 1, alignItems: 'center', backgroundColor: primC}}>
          <Text style={{ color: compleC, fontSize: 35, alignSelf:'flex-start', marginTop: '5%',marginBottom: '2%', marginHorizontal: '6%'}}>Settings</Text>

          {/* one setting container - Theme */}
          <View style={styles.themeSettingViewStyle}>
            
            {/* setting title */}
            <Text style={styles.settingTitleStyle}>Theme</Text>
            
            {/* color palette*/}
            <View style={styles.colorPaletteStyle}>
              {/* one color */}
              {themes.map((color) => {
                return(
                  <TouchableOpacity key={color.id} style={{marginVertical: '2%'}} onPress={() =>{handleThemeChange(color.id)}}>
                    <View style={[{backgroundColor: color.primary, borderColor: color.complementary},styles.colorStyle]}></View>
                  </TouchableOpacity>
                )
              })}
            </View>
          </View>

          {/* Notification setting */}
          <View style={styles.settingViewStyle}>
            
            {/* setting title */}
            <Text style={[styles.settingTitleStyle, {alignSelf:'center'}]}>Notifications</Text>
            
            <Switch
              trackColor={{false: compleC, true: primC}}
              thumbColor={globalNotiEnabled ? compleC : primC}
              ios_backgroundColor="#3e3e3e"
              onValueChange={(value)=>{toggleGlobalNotiChange(value)}}
              value={globalNotiEnabled}
            />
            
          </View>


          {/* Notification setting */}
          <View style={styles.settingViewStyle}>
            
            {/* setting title */}
            <Text style={[styles.settingTitleStyle, {alignSelf:'center'}]}>Vibrations</Text>
            
            <Switch
              trackColor={{false: compleC, true: primC}}
              thumbColor={globalVibrateEnabled ? compleC : primC}
              ios_backgroundColor="#3e3e3e"
              onValueChange={(value)=>{toggleGlobalVibrationChange(value)}}
              value={globalVibrateEnabled}
            />
            
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeSettingViewStyle: {
    backgroundColor: '#FFFFFF', 
    width: '90%', 
    padding: '2%', 
    alignItems: 'center', 
    borderRadius: 10, 
    marginVertical: '3%'
  },
  settingViewStyle: {
    backgroundColor: '#FFFFFF', 
    width: '90%', 
    padding: '2%',  
    borderRadius: 10, 
    marginVertical: '3%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  settingTitleStyle: {
    alignSelf:'flex-start', 
    paddingHorizontal: '5%', 
    paddingVertical: '2%', 
    fontSize: 16, 
    fontWeight: 'bold',
  },
  colorPaletteStyle: {
    flexDirection: 'row', 
    flexWrap:'wrap', 
    width: '80%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: '2%'
  },
  colorStyle: {
    width: '50', 
    height: '50', 
    margin: '2%', 
    borderRadius: 15,
    borderWidth: 3
  },

});
