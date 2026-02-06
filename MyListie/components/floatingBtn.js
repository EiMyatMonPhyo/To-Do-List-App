import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'; 
import {useContext} from 'react';
import { globalContext } from '../globalContext';   // import globalcontext to access global variables across different screens


export default function FloatingBtn({navigation}){
    const { compleC } = useContext(globalContext);     // get data needed from globalContext
    
    return(
        // floating button + for task creation form 
        <TouchableOpacity
            style={styles.floatingBtnStyle}
            onPress={() => navigation.navigate('TaskCreation')}
        >
            <Text style={[styles.floatingBtnTextStyle, {color: compleC}]}>+</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    floatingBtnStyle: {
        backgroundColor: '#FFFFFF',
        width: '70',
        height: '70',
        borderRadius: 35,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,   //shadow
        // iOS Shadow properties
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        position: 'absolute',
        right: '7%',
        bottom: '5%'
    },
    floatingBtnTextStyle: {
        fontWeight: 'bold',
        fontSize: 35
    }
});