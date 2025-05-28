// Utility for storing and retrieving nurse data across the app
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NurseType } from '../types/nurse';

const NURSE_DATA_KEY = '@arogith_nurse_data';

export const storeNurseData = async (nurseData: NurseType): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(NURSE_DATA_KEY, JSON.stringify(nurseData));
    return true;
  } catch (error) {
    console.error('Error storing nurse data:', error);
    return false;
  }
};

export const getNurseData = async (): Promise<NurseType | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(NURSE_DATA_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error('Error getting nurse data:', error);
    return null;
  }
};

export const clearNurseData = async (): Promise<boolean> => {
  try {
    await AsyncStorage.removeItem(NURSE_DATA_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing nurse data:', error);
    return false;
  }
}; 