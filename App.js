import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import {
  ThemeProvider,
  Toolbar,
  Icon
} from 'react-native-material-ui';

import Harmony from './src/components/Harmony';

export default class App extends React.Component {
  constructor() {
    super();

    this.state = {
      loaded: false
    };
  }

  componentWillMount() {
    this._loadAssetsAsync();
  }

  _loadAssetsAsync = async () => {
    await Expo.Font.loadAsync({
      Roboto: require('./src/assets/fonts/Roboto-Medium.ttf'),
    });
    this.setState({ loaded: true });
  };

  render() {
    return this.state.loaded
      ? (
        <ThemeProvider>
          <View style={styles.container}>
            <Toolbar
              centerElement="The Harmony App"
              style={{
                container: {
                  backgroundColor: '#F06292'
                }
              }}
            />
            <Harmony />
          </View>
        </ThemeProvider>
      )
      : (
        <Text>Loading...</Text>
      )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECEFF1',
    height: '100%'
  }
});
