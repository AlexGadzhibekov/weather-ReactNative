import {
  View,
  Text,
  StyleSheet,
  Image,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { MagnifyingGlassIcon } from "react-native-heroicons/outline";
import { MapPinIcon } from "react-native-heroicons/solid";
import { CalendarDaysIcon } from "react-native-heroicons/solid";
import { debounce } from "lodash";
import { fetchLocations, fetchWeatherForecast } from "../api/weather";
import { weatherImages } from "../const";
import * as Progress from 'react-native-progress';
import { getData, storeData } from "../utils/asyncStorage";

// import SafeAreaView from "../SafeAreaView/SafeAreaView";

export default function HomeScreen() {
  const [showSearch, toggleSearch] = useState(false);
  const [locations, setLocations] = useState([]);
  const [weather, setWeather] = useState({});
  const [loading, setLoading] = useState(true)

  const handleSearch = (value) => {
    //console.log("value: ", value);
    if (value.length > 2) {
      fetchLocations({ cityName: value }).then((data) => {
        //console.log('got locations: ', data)
        setLocations(data);
      });
    }
  };

  const handleLocation = (loc) => {
    //console.log("location: ", loc);
    setLoading(true);
    toggleSearch(false);
    setLocations([]);
    fetchWeatherForecast({
      cityName: loc.name,
      days: '7'
    }).then((data) => {
      setLoading(false);
      setWeather(data);
      storeData('city',loc.name);
      //console.log("got forecast: ", data);
    });
  };



  useEffect(() => {
    fetchMyWeatherData();
  }, []);

  const fetchMyWeatherData = async () => {
    let myCity = await getData('city');
    let cityName = 'Islamabad';
    if(myCity) cityName = myCity;
    fetchWeatherForecast({
      cityName,
      days: "7",
    }).then((data) => {
      setWeather(data);
      setLoading(false)
    });
  };
  const handleTextDebounce = useCallback(debounce(handleSearch, 1200), []);

  const { current, location } = weather;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Image
        blurRadius={70}
        source={require("../assets/images/bg.png")}
        style={styles.backg}
      />

{loading?(
<View style={styles.loading}>
  {/* <Text style={styles.loadingTxt}>Loading...</Text> */}
  <Progress.CircleSnail thickness={10} size={140} color="#0bb3b2"  />
</View>
):(
  <SafeAreaView style={{ flex: 1 }}>
  {/* search section */}
  <View style={styles.seach}>
    <View style={styles.inputSearch}>
      {showSearch ? (
        <TextInput
          onChangeText={handleTextDebounce}
          placeholder="Search city"
          placeholderTextColor={"lightgray"}
          style={styles.input}
        />
      ) : null}

      <TouchableOpacity
        style={styles.searchBtn}
        onPress={() => toggleSearch(!showSearch)}
      >
        <MagnifyingGlassIcon size="25" color="white" />
      </TouchableOpacity>
    </View>
    {locations.length > 0 && showSearch ? (
      <View style={styles.showSearch}>
        {locations.map((loc, index) => {
          let showBorder = index + 1 != locations.length;
          let borderStyle = showBorder
            ? { borderBottomWidth: 2, borderBottomColor: "gray" }
            : {};
          return (
            <TouchableOpacity
              onPress={() => handleLocation(loc)}
              key={index}
              style={[styles.showSearchTxt, borderStyle]}
            >
              <MapPinIcon size={20} color="gray" />
              <Text style={styles.showTxt}>
                {loc?.name}, {loc.country}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    ) : null}
  </View>
  {/* forcast section */}
  <View style={styles.forecast}>
    <Text style={styles.locationTxt}>
      {location?.name},
      <Text style={styles.locationTxt2}>{" " + location?.country}</Text>
    </Text>
    {/* weather image */}
    <View style={styles.weatherImg}>
      <Image
        source={weatherImages[current?.condition?.text]}
        //source={{uri:'https:'+current?.condition?.icon}}
        //source={require("../assets/images/partlycloudy.png")}
        style={styles.img}
      />
    </View>
    {/* degree  celcius*/}
    <View style={styles.degreeCelcius}>
      <Text style={styles.celcius}>{current?.temp_c}&#176;</Text>
      <Text style={styles.cloudy}>{current?.condition?.text}</Text>
    </View>
    {/* other status */}
    <View style={styles.otherStatus}>
      <View style={styles.statusRow}>
        <Image
          source={require("../assets/icons/wind.png")}
          style={styles.statusIcon}
        />
        <Text style={styles.statusTxt}>{current?.wind_kph}km</Text>
      </View>
      <View style={styles.statusRow}>
        <Image
          source={require("../assets/icons/drop.png")}
          style={styles.statusIcon}
        />
        <Text style={styles.statusTxt}>{current?.humidity}%</Text>
      </View>
      <View style={styles.statusRow}>
        <Image
          source={require("../assets/icons/sun.png")}
          style={styles.statusIcon}
        />
        <Text style={styles.statusTxt}>{ weather?.forecast?.forecastday[0]?.astro?.sunrise }</Text>
      </View>
    </View>
  </View>

  {/* forecast for next day */}
  <View style={styles.nextDay}>
    <View style={styles.calendar}>
      <CalendarDaysIcon size={22} color={"white"} />
      <Text style={styles.calendarTxt}>Daily forecast</Text>
    </View>
    <ScrollView
      horizontal
      contentContainerStyle={{ paddingHorizontal: 15 }}
      showsHorizontalScrollIndicator={false}
    >
      {weather?.forecast?.forecastday?.map((item, index) => {
        const date = new Date(item.date);
        const options = { weekday: "long" };
        let dayName = date.toLocaleDateString("en-US", options);
        dayName = dayName.split(",")[0];
        return (
          <View key={index} style={styles.week}>
            <Image
              source={weatherImages[item?.day?.condition?.text]}
              //source={require("../assets/images/heavyrain.png")}
              style={styles.weerkImg}
            />
            <Text style={styles.weekTxt}>{dayName}</Text>
            <Text style={styles.weekCelcium}>
              {item?.day?.avgtemp_c}&#176;
            </Text>
          </View>
        );
      })}
    </ScrollView>
  </View>
</SafeAreaView>
) }

    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  backg: {
    position: "absolute",
    height: "100%",
    width: "100%",
  },
  seach: {
    height: "7%",
    marginTop: 20,
    marginLeft: 16,
    marginRight: 16,
    position: "relative",
    zIndex: 50,
  },
  inputSearch: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    borderRadius: 99,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  input: {
    flex: 1,
    padding: 12,
    paddingBottom: 9,
  },
  searchBtn: {
    borderRadius: 99,
    padding: 6,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  showSearch: {
    position: "absolute",
    width: "100%",
    backgroundColor: "darkgray",
    top: 50,
    borderRadius: 20,
  },
  showSearchTxt: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 0,
    padding: 8,
    paddingHorizontal: 8,
    marginBottom: 4,
  },
  showTxt: {
    color: "black",
    marginLeft: 4,
  },
  // forecast section
  forecast: {
    flexDirection: "column",
    justifyContent: "space-around",
    alignItems: "center",
    margin: 16,
    gap: 40,
    marginBottom: 40,
  },
  locationTxt: {
    color: "white",
    textAlign: "center",
    fontSize:36, //text-2xl
    fontWeight: "bold",
  },
  locationTxt2: {
    fontSize: 24, //text*lg
    fontWeight: "600", //font-semibold
    color: "gray",
  },
  // weher img
  weatherImg: {
    flexDirection: "row",
    justifyContent: "center",
  },
  img: {
    width: 150,
    height: 150,
  },
  // degree celcius
  degreeCelcius: {
    //flex:1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    margin: 5,
    paddingTop: 2,
  },
  celcius: {
    fontSize: 48, //  "text-6xl"
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
  cloudy: {
    fontSize: 15, // "text-xl"
    fontWeight:'600',
    color: "white", // "text-white"
    letterSpacing: 2, // "tracking-widest"
    textAlign: "center",
    //marginBottom: 10,
  },
  // other status
  otherStatus: {
    flexDirection: "row",
    gap: 40,
    justifyContent: "space-between",
    marginHorizontal: 4,
  },
  statusRow: {
    flexDirection: "row",
    gap: 5,
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusIcon: {
    width: 24,
    height: 24,
  },
  statusTxt: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  // next day
  calendarTxt: {
    color: "white",
    fontSize: 16,
  },
  nextDay: {
    marginBottom: 9,
    marginVertical: 3,
  },
  calendar: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 16,
    marginRight: 16,
    marginBottom: 20,
  },
  week: {
    flex: 1,
    justifyContent: "center",
    gap: 8,
    alignItems: "center",
    width: 100,
    height: 120,
    borderRadius: 25,
    paddingVertical: 12,
    marginRight: 12,
    //padding:6,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  weerkImg: {
    height: 50,
    width: 50,
  },
  weekTxt: {
    color: "white",
    fontSize: 14,
  },
  weekCelcium: {
    color: "white",
    fontSize: 20,
    fontWeight: "600",
  },
  loading:{
    flex:1,
    flexDirection:'row',
    justifyContent:'center',
    alignItems:'center'
  },
  loadingTxt:{
    color:'white',
    fontSize:36
  }
});
