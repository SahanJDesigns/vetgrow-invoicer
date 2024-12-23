import { View, Text } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Home from './home';
import Login from './login';
import { onAuthStateChanged } from 'firebase/auth';
import { firebase_auth } from '@/FirebaseConfig';
import { useRouter } from 'expo-router';



const index = () => {
    const [isLogged, setIsLogged] = useState<boolean | null>(null);  // Initially null to avoid redirecting before auth state is checked
    const router = useRouter();
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(firebase_auth, (user) => {
            if (user) {
                setIsLogged(true);
            } else {
                setIsLogged(false);
            }
        });

        return () => unsubscribe();
    }, []);

    if (isLogged === null) {
        return null;
    } else {
        console.log(isLogged);
    }

    return (
      isLogged? <Home/>:<Login/>
    );
};

export default index;