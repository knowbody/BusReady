'use strict'

import React, {
  AppRegistry,
  Component,
  Image,
  StyleSheet,
  Text,
  View
} from 'react-native'

const TIME_TO_BUS_STOP = 180
const MAX_WAIT_TIME = 120

const APP_ID = 'YOUR_APP_ID'
const APP_KEY = 'YOUR_APP_KEY'
const STOP_ID = '490011297S'
const API_URL = 'https://api.tfl.gov.uk/StopPoint/'
const PARAMS = `?app_id=${APP_ID}&app_key=${APP_KEY}`
const REQUEST_URL = `${API_URL}${STOP_ID}/Arrivals${PARAMS}`

const PULLDOWN_DISTANCE = 40

class BusReady extends Component {
  constructor() {
    super()
    this.state = {
      ready: false,
      loaded: false,
      nextBuses: null,
      reloading: false,
      readyBuses: null
    }
  }

  componentDidMount() {
    this.fetchData()
  }

  fetchData() {
    fetch(REQUEST_URL)
      .then((response) => response.json())
      .then((responseData) => {
        this.checkBusReady(responseData)
      })
      .done()
  }

  checkBusReady(responseData) {
    let busData = responseData.filter(bus =>
      bus.lineId === '297' || bus.lineId === '302'
    )

    let readyBuses = busData.filter(bus =>
      bus.timeToStation > TIME_TO_BUS_STOP && bus.timeToStation < (TIME_TO_BUS_STOP + MAX_WAIT_TIME)
    )

    let nextBuses = busData.filter(bus =>
      bus.timeToStation > TIME_TO_BUS_STOP
    )

    nextBuses = nextBuses.sort((a, b) =>
      a.timeToStation - b.timeToStation
    )

    if (readyBuses.length > 0) {
      this.setState({
        ready: true,
        loaded: true,
        readyBuses: readyBuses
      })
    } else {
      this.setState({
        ready: false,
        loaded: true,
        nextBuses: nextBuses
      })
    }
  }

  render() {
    const { ready, loaded, nextBuses, readyBuses } = this.state
    let busInfo = null

    if (!loaded) {
      return (
        <View style={styles.container}>
          <Text>
            Loading...
          </Text>
        </View>
      )
    }

    if (nextBuses) {
      busInfo = nextBuses.slice(0, 4).map((bus, i) =>
        <View key={i} style={styles.busInfo}>
          <Text style={styles.busInfoLine}>{ bus.lineId }</Text>
          <Text style={styles.busInfoTime}>
            in {Math.round(bus.timeToStation / 60)} mins
          </Text>
        </View>
      )
    }

    if (readyBuses) {
      busInfo = readyBuses.map((bus, i) =>
        <View key={i} style={styles.busInfo}>
          <Text style={styles.busInfoLine}>{ bus.lineId }</Text>
          <Text style={styles.busInfoTime}>
            in {Math.round(bus.timeToStation / 60)} mins
          </Text>
        </View>
      )
    }

    return (
      <View style={ready ? styles.ready : styles.notReady}>
        <Text
          style={styles.busInfoTitle}
          onPress={() => this.fetchData()}
        >
          Next buses:
        </Text>
        { busInfo }
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(5, 165, 209, 0.05)',
  },
  ready: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#27ae60'
  },
  notReady: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e74c3c'
  },
  busInfoTitle: {
    fontSize: 46,
    color: '#fff'
  },
  busInfoLine: {
    fontSize: 32,
    color: '#fff'
  },
  busInfoTime: {
    fontSize: 26,
    left: 20,
    color: '#fff'
  },
  busInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  }
})

AppRegistry.registerComponent('BusReady', () => BusReady)
