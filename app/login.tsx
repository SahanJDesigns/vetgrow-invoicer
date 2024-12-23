import {View, Text, useColorScheme, TextInput, Button, TouchableOpacity, ActivityIndicator} from 'react-native';
import {useEffect, useState} from "react";
import {firebase_auth} from "@/FirebaseConfig";
import { signInWithEmailAndPassword } from 'firebase/auth';

function Login({navigation}:any) {
    const [loading, setLoading] = useState(false)
    const scheme = useColorScheme();
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    function LoginProcess(){
        setLoading(true)
        signInWithEmailAndPassword(firebase_auth,email,password).then((userCredential) => {
            const user = userCredential.user;
            setLoading(false)
        }).catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorMessage)
            setLoading(false)
        });
    }

    return (
        <View className='h-full'>
            <View className="flex-1 justify-center items-center w-full px-4">
                <Text className={`text-4xl font-bold mb-6 ${scheme === 'dark' ? 'text-white' : 'text-black'}`}>
                    Login
                </Text>
                <TextInput
                    className={`w-full h-12 border rounded px-3 mb-4 ${scheme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-black'}`}
                    placeholder="Email"
                    onChangeText={(text) => setEmail(text)}
                    placeholderTextColor={scheme === 'dark' ? 'gray' : 'darkgray'}
                />
                <TextInput
                    className={`w-full h-12 border rounded px-3 mb-4 ${scheme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-black'}`}
                    placeholder="Password"
                    onChangeText={(text) => setPassword(text)}
                    placeholderTextColor={scheme === 'dark' ? 'gray' : 'darkgray'}
                    secureTextEntry
                />

                <TouchableOpacity
                    disabled={loading}
                    onPress={LoginProcess}
                    className={`w-full h-12 bg-blue-500 rounded justify-center items-center ${loading ? 'bg-gray-300' : 'bg-blue-500'}`}
                >
                    {loading?
                    <ActivityIndicator size={"large"}/>:
                    <Text className="text-white font-bold">Login</Text>
                    }
                </TouchableOpacity>
            </View>
        </View>
    );
}

export default Login;
