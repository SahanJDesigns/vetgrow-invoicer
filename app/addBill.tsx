import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TextInput,
  Button,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import AntDesign from '@expo/vector-icons/AntDesign';
import { firebase_auth } from '@/FirebaseConfig';
import { Bill, PaymentInfo, PaymentMethod, PetClinic } from './model';
import { useRouter } from 'expo-router';

const AddBill = () => {
  const router = useRouter();
  const [petClinic, setPetClinic] = useState<PetClinic | null>(null);
  const [dropDownFocus, setDropDownFocus] = useState(false);
  const [petClinicList, setPetClinicList] = useState<PetClinic[]>([]);
  const [amount, setAmount] = useState<number | null>(null);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newClinicName, setNewClinicName] = useState('');
  const [newDoctorName, setNewDoctorName] = useState('');
  const [newPetClinicAddress, setNewPetClinicAddress] = useState('');

  const user = firebase_auth.currentUser?.uid || '';

  useEffect(() => {
    const fetchPetClinics = async () => {
      try {
        const petClinicListTemp = await PetClinic.getAllPetClinics();
        setPetClinicList(petClinicListTemp);
      } catch (error) {
        console.error('Error fetching pet clinics:', error);
      }
    };
    fetchPetClinics();
  }, []);

  const handleAddNewClinic = async () => {
    if (!newClinicName.trim() || !newDoctorName.trim() || !newPetClinicAddress.trim()) {
      alert('Please fill in all fields!');
      return;
    }
    try {
      const newClinic = await PetClinic.createPetClinic(
        newClinicName,
        newDoctorName,
        newPetClinicAddress
      );
      setPetClinicList((prev) => [...prev, newClinic]);
      setPetClinic(newClinic);
      setIsModalVisible(false);
      alert('New pet clinic added!');
    } catch (error) {
      console.error('Error adding new clinic:', error);
    }
  };

  const handleSubmit = async () => {
    if (!petClinic) {
      alert('Please select a pet clinic!');
      return;
    }
    if (amount === null || amount <= 0) {
      alert('Please enter a valid amount!');
      return;
    }
    try {
      const bill = await Bill.createBill(new Date(), new Date(), user, petClinic,amount,[]);
      alert('Bill added successfully!');
      router.push(`/previewBill?billId=${bill.invoiceNumber}`);
    } catch (error) {
      console.error('Error adding bill:', error);
    }
  };

  const dropdownData = [
    ...petClinicList.map((clinic) => ({
      label: clinic.clinicName,
      value: clinic,
    })),
    { label: 'Add New Pet Clinic', value: 'add_new' },
  ];

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.title}>Enter the following</Text>
        <Dropdown
          style={[styles.dropdown, dropDownFocus && { borderColor: 'blue' }]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          iconStyle={styles.iconStyle}
          data={dropdownData}
          search
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder={!dropDownFocus ? 'Select Pet Clinic' : '...'}
          searchPlaceholder="Search pet clinics..."
          value={petClinic?.clinicName}
          onFocus={() => setDropDownFocus(true)}
          onBlur={() => setDropDownFocus(false)}
          onChange={(item) => {
            if (item.value === 'add_new') {
              setIsModalVisible(true);
            } else {
              setPetClinic(item.value as PetClinic);
            }
            setDropDownFocus(false);
          }}
          renderLeftIcon={() => (
            <AntDesign
              style={styles.icon}
              color={dropDownFocus ? 'blue' : 'black'}
              name="Safety"
              size={20}
            />
          )}
        />
        <TextInput
          placeholder="Enter amount"
          style={styles.textInput}
          keyboardType="numeric"
          onChangeText={(text) => setAmount(Number(text))}
        />
        <Button title="Submit" onPress={handleSubmit} />

        <Modal
          animationType="slide"
          transparent={true}
          visible={isModalVisible}
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add New Pet Clinic</Text>
              <TextInput
                placeholder="Enter clinic name"
                style={styles.textInput}
                onChangeText={setNewClinicName}
                value={newClinicName}
              />
              <TextInput
                placeholder="Enter doctor name"
                style={styles.textInput}
                onChangeText={setNewDoctorName}
                value={newDoctorName}
              />
              <TextInput
                placeholder="Enter clinic address"
                style={styles.textInput}
                onChangeText={setNewPetClinicAddress}
                value={newPetClinicAddress}
              />
              <View style={styles.modalButtonContainer}>
                <Button title="Cancel" onPress={() => setIsModalVisible(false)} />
                <Button title="Add" onPress={handleAddNewClinic} />
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
  },
  icon: {
    marginRight: 5,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  dropdown: {
    height: 50,
    width: '100%',
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 15,
  },
  textInput: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 15,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    width: '100%',
  },
});

export default AddBill;
