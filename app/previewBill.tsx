import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Bill, PaymentInfo, PaymentMethod, PetClinic } from "./model";
import { useLocalSearchParams, useRouter } from "expo-router";

const PreviewBill = () => {
  const { billId } = useLocalSearchParams();
  const router = useRouter();

  const [bill, setBill] = useState<Bill | null>(null);
  const [petClinic, setPetClinic] = useState<PetClinic | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo[] | null>(null);

  const [totalPayment, setTotalPayment] = useState(0);
  const [remainingPayment, setRemainingPayment] = useState(0);

  const [modalVisible, setModalVisible] = useState(false);
  const [newPaymentAmount, setNewPaymentAmount] = useState<number>();
  const [newPaymentMethod, setNewPaymentMethod] = useState("");

  useEffect(() => {
    const fetchPetClinic = async () => {
      try {
        const billTemp = await Bill.getBill(billId as string);
        const petClinicTemp = await PetClinic.getPetClinic(billTemp.petClinicId);
        const paymentInfoTemp = await billTemp.getPaymentInfo();
        setBill(billTemp);
        setPetClinic(petClinicTemp);
        setPaymentInfo(paymentInfoTemp);
        const total = paymentInfoTemp.reduce((acc, curr) => acc + curr.amount, 0);
        setTotalPayment(total);
        setRemainingPayment(billTemp.amount - total);
      } catch (error) {
        console.error("Error fetching pet clinic:", error);
      }
    };
    fetchPetClinic();
  }, [billId]);

  const handleAddPayment = async () => {
    if (!newPaymentAmount || !newPaymentMethod) {
      Alert.alert("Error", "Please enter all payment details.");
      return;
    }

    try {
      const newPayment: PaymentInfo = await PaymentInfo.createPaymentInfo(new Date(), PaymentMethod.cash,newPaymentAmount);

      await bill?.addPaymentInfo(newPayment);

      setPaymentInfo((prev) => (prev ? [...prev, newPayment] : [newPayment]));
      setTotalPayment((prev) => prev + newPayment.amount);
      setRemainingPayment((prev) => prev - newPayment.amount);

      Alert.alert("Success", "Payment added successfully!");
      setModalVisible(false);
      setNewPaymentAmount(0);
      setNewPaymentMethod("");
    } catch (error) {
      console.error("Error adding payment:", error);
      Alert.alert("Error", "Failed to add payment.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="bg-white p-4 flex-1">
        {/* Header Section */}
        <View className="mb-4">
          <View className="justify-between flex-row">
            <Text className="text-lg font-bold">Invoice No:</Text>
            <Text className="text-red-500 font-bold">{bill?.invoiceNumber}</Text>
          </View>
          <View className="justify-between flex-row">
            <Text className="text-lg font-bold">Invoice Date:</Text>
            <Text className="text-red-500 font-bold">{bill?.invoiceDate.toDateString()}</Text>
          </View>
          <View className="justify-between flex-row">
            <Text className="text-lg font-bold">Due Date:</Text>
            <Text className="text-red-500 font-bold">{bill?.dueDate.toDateString()}</Text>
          </View>
        </View>

        <View className="mb-4">
          <View className="justify-between flex-row">
            <Text className="text-lg font-bold">Bill To:</Text>
            <Text className="text-red-500 font-bold">{petClinic?.clinicName}</Text>
          </View>
          <View className="justify-between flex-row">
            <Text className="text-lg font-bold">Doctor Name:</Text>
            <Text className="text-red-500 font-bold">{petClinic?.doctorName}</Text>
          </View>
        </View>

        {/* Total Bill */}
        <View className="mb-4">
          <Text className="text-lg font-bold">
            Total Bill: <Text className="text-red-500">Rs: {bill?.amount}</Text>
          </Text>
        </View>

        {/* Payment Info */}
        <View>
          <Text className="text-lg font-bold mb-2">Payment Info:</Text>
          <View className="border border-gray-400 rounded">
            <View className="flex-row justify-between p-2 border-b border-gray-400">
              <Text className="text-sm font-bold">Date</Text>
              <Text className="text-sm font-bold">Payment Method</Text>
              <Text className="text-sm font-bold">Payment</Text>
            </View>
            {/* Render Payment Rows Dynamically */}
            {paymentInfo?.map((payment, index) => (
              <View
                key={index}
                className="flex-row justify-between p-2 border-b border-gray-300"
              >
                <Text className="text-sm">{payment.amount}</Text>
                <Text className="text-sm">{payment.paymentMethod}</Text>
                <Text className="text-sm">Rs: {payment.amount}</Text>
              </View>
            ))}
          </View>

          {/* Total and Remaining */}
          <View className="mt-4">
            <Text className="text-lg font-bold">
              Total: <Text className="text-green-500">{totalPayment}</Text>
            </Text>
            <Text className="text-lg font-bold">
              Remaining: <Text className="text-red-500">{remainingPayment}</Text>
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Buttons */}
      <View className="flex-row justify-between p-4 bg-gray-100">
        <TouchableOpacity
          className="flex-1 bg-blue-500 rounded mr-2 p-4 items-center"
          onPress={() => router.push("/home")}
        >
          <Text className="text-white font-bold">Back to Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 bg-green-500 rounded p-4 items-center"
          onPress={() => setModalVisible(true)}
        >
          <Text className="text-white font-bold">Add Payment</Text>
        </TouchableOpacity>
      </View>

      {/* Payment Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="bg-white rounded-lg p-6 w-4/5">
            <Text className="text-lg font-bold mb-4">Add Payment</Text>
            <TextInput
              placeholder="Payment Amount"
              keyboardType="numeric"
              className="border rounded px-3 py-2 mb-4"
              value={newPaymentAmount ? newPaymentAmount.toString() : ""}
              onChangeText={(text) => setNewPaymentAmount(parseFloat(text))}
            />
            <TextInput
              placeholder="Payment Method"
              className="border rounded px-3 py-2 mb-4"
              value={newPaymentMethod}
              onChangeText={setNewPaymentMethod}
            />
            <View className="flex-row justify-end">
              <TouchableOpacity
                className="bg-gray-300 rounded px-4 py-2 mr-2"
                onPress={() => setModalVisible(false)}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-green-500 rounded px-4 py-2"
                onPress={handleAddPayment}
              >
                <Text className="text-white">Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default PreviewBill;
