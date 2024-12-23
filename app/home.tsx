import { Link, Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Text, View, Image, StyleSheet, TouchableOpacity, Alert, FlatList } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dropdown } from 'react-native-element-dropdown';
import AntDesign from '@expo/vector-icons/AntDesign';
import { Bill, Filter, ListEntry, PaymentInfo, Vendor } from './model';

function Home() {

    const [vendorList, setVendorList] = useState<Vendor[]>([]);
    const [billList, setBillList] = useState<Bill[]>([]);
    const [filterTypeList,setFilterTypeList] = useState<Filter[]>([
        { filterType: 'vendorId', value: '66pvlwJK7KfkmKOochxAZrKAtN22' },
    ]);

    useEffect(() => {
        const initialVendorList: Promise<Vendor[]> = Promise.all([
            { _id: "66pvlwJK7KfkmKOochxAZrKAtN22" },
        ].map(vendor => Vendor.getVendor(vendor._id)));

        initialVendorList.then(setVendorList);
        
    }, []);

    useEffect(() => {
        const tempBillList: Promise<Bill[]> = Bill.getAllBills(filterTypeList);
        tempBillList.then(setBillList); 
    }, [filterTypeList]);


    const [filterType, setFilterType] = useState<string | null>(null);
    const [filterTypeFocus, setFilterTypeFocus] = useState(false);
    const [value, setValue] = useState<string | null>(null);
    const [valueFocus, setValueFocus] = useState(false);
    const [filterList, setFilterList] = useState<Filter[]>([]);
    const [valueList, setValueList] = useState<ListEntry[]>([]);

    const addfilter = () => {
        if (filterType && value) {
            setFilterList((prev) => [...prev, { filterType, value }]);
            setValue(null);
            setFilterType(null);
        } else {
            console.log("Both filter type and value are required");
            Alert.alert(
                "Empty Filter",
                "Both filter type and value are required",
                [{ text: "OK", onPress: () => {}}]
            );
        }
    };
/*
    useEffect(() => {
        let valueListTemp: ListEntry[] = [];
        if (filterType === '1') {
            valueListTemp = vendorList.map(vendor => ({ label: vendor.name, value: vendor.id }));
        } else if (filterType === '2') {
            valueListTemp = billList.map(bill => ({ label: bill., value: bill.BillTo._id }));
        } else if (filterType === '3') {
            valueListTemp = billList.map(bill => ({ label: bill.BillTo.doctorName, value: bill.BillTo._id }));
        }
        setValueList(valueListTemp);
    }, [filterType, billList, vendorList]);
*/
    const renderBill = ({ item }: { item: Bill }) => (
        <View style={styles.billItem}>
            <Image source={require('../assets/images/default_avatar.png')} style={styles.billAvatar} />
            <View style={styles.billDetails}>
                <Text style={styles.billVendor}>{item.vendorId}</Text>
               
            </View>
        </View>
    );
    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerText}>Easy Operations</Text>
                <View style={styles.headerContent}>
                    <TouchableOpacity activeOpacity={0.2}>
                        <Link href={'/addBill'}>
                            <Image 
                                source={require("../assets/images/add_icon.png")} 
                                style={styles.iconImage}
                            />
                        </Link>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Body */}
            <View style={styles.body}>
                <View style={styles.bodyHeader}>
                    <Text style={styles.bodyTitle}>Bills</Text>
                    <TouchableOpacity activeOpacity={0.8} onPress={addfilter}>
                        <Image 
                            source={require("../assets/images/arrow_icon.png")} 
                            style={styles.arrowIcon}
                        />
                    </TouchableOpacity>
                </View>
        
                {/* Dropdowns */}
                <View style={styles.dropdownContainer}>
                    <Dropdown
                        style={[styles.dropdown, filterTypeFocus && { borderColor: 'blue' }]}
                        placeholderStyle={styles.placeholderStyle}
                        selectedTextStyle={styles.selectedTextStyle}
                        inputSearchStyle={styles.inputSearchStyle}
                        iconStyle={styles.iconStyle}
                        data={filterTypeList}
                        search
                        maxHeight={300}
                        labelField="filterType"
                        valueField="value"
                        placeholder={!filterTypeFocus ? 'Select Filter Type' : '...'}
                        searchPlaceholder="Search..."
                        value={filterType}
                        onFocus={() => setFilterTypeFocus(true)}
                        onBlur={() => setFilterTypeFocus(false)}
                        onChange={(item) => {
                            setFilterType(item.value);
                            setFilterTypeFocus(false);
                        }}
                        renderLeftIcon={() => (
                            <AntDesign
                                style={styles.icon}
                                color={filterTypeFocus ? 'blue' : 'black'}
                                name="Safety"
                                size={20}
                            />
                        )}
                    />
                    <Dropdown
                        style={[styles.dropdown, valueFocus && { borderColor: 'blue' }]}
                        placeholderStyle={styles.placeholderStyle}
                        selectedTextStyle={styles.selectedTextStyle}
                        inputSearchStyle={styles.inputSearchStyle}
                        iconStyle={styles.iconStyle}
                        data={valueList}
                        search
                        maxHeight={300}
                        labelField="label"
                        valueField="value"
                        placeholder={!valueFocus ? 'Select Value' : '...'}
                        searchPlaceholder="Search..."
                        value={value}
                        onFocus={() => setValueFocus(true)}
                        onBlur={() => setValueFocus(false)}
                        onChange={(item) => {
                            setValue(item.value);
                            setValueFocus(false);
                        }}
                        renderLeftIcon={() => (
                            <AntDesign
                                style={styles.icon}
                                color={valueFocus ? 'blue' : 'black'}
                                name="Safety"
                                size={20}
                            />
                        )}
                    />
                    <TouchableOpacity activeOpacity={0.2} onPress={addfilter}>
                        <Image 
                            source={require('../assets/images/add_icon.png')} 
                            style={styles.addIcon} 
                        />
                    </TouchableOpacity>
                </View>

                {/* Filter List Display */}
                <View style={styles.filterListContainer}>
                    {filterList.map((filter, index) => {
                        return (
                            <View key={index} style={styles.filterItem}>
                                <Text style={styles.filterText}>{filter.filterType} - {filter.value}</Text>
                                
                            </View>
                        );
                    })}
                </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <FlatList
                    data={billList}
                    renderItem={renderBill}
                    keyExtractor={(item) => item.invoiceNumber}
                    style={styles.billList}
                />
            </View>
        </SafeAreaView>
    );
}

export default Home;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        height: '15%',
        padding: 10,
    },
    headerText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4a4a4a',
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    iconImage: {
        height: 48,
        width: 48,
        borderRadius: 8,
    },
    iconText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4a4a4a',
        marginLeft: 8,
    },
    body: {
        height: '25%',
        backgroundColor: '#2f855a',
        padding: 10,
    },
    bodyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    bodyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    arrowIcon: {
        width: 16,
        height: 16,
        tintColor: '#fff',
    },
    dropdownContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginTop: 10,
    },
    dropdown: {
        height: 50,
        width: '40%',
        borderColor: 'gray',
        borderWidth: 0.5,
        borderRadius: 8,
        paddingHorizontal: 8,
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
    addIcon: {
        width: 40,
        height: 40,
    },
    footer: {
        flex: 1,
        backgroundColor: '#ecc94b',
    },
    filterListContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 10,
        paddingHorizontal: 5,
    },
    filterItem: {
        backgroundColor: '#f1f1f1',
        margin: 5,
        padding: 10,
        borderRadius: 8,
        width: '45%',
    },
    filterText: {
        fontSize: 14,
        color: '#333',
    },
    billList: {
        padding: 16,
    },
    billItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        padding: 16,
        backgroundColor: '#F9F9F9',
        borderRadius: 8,
    },
    billAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 16,
    },
    billDetails: {
        flex: 1,
    },
    billVendor: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    billLocation: {
        fontSize: 14,
        color: 'gray',
    },
    billDate: {
        fontSize: 12,
        color: 'gray',
    },
    billAmount: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    pending: {
        color: 'orange',
    },
    completed: {
        color: 'green',
    },
});