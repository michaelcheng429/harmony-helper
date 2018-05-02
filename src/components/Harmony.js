import React from 'react';
import { StyleSheet, Text, TextInput, View, TouchableOpacity, ScrollView } from 'react-native';
import { Icon } from 'react-native-material-ui';

import HARMONIES_LIST from '../constants';
import HarmonySong from './HarmonySong';

export default class Harmony extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      song: null,
      songs: HARMONIES_LIST
    };
  }

  setParentState = state => {
    this.setState(state);
  };

  filterSongs = text => {
    this.setState({
      songs: HARMONIES_LIST.filter(item => {
        const matchesTitle = item.title.toLowerCase().indexOf(text.toLowerCase()) !== -1;

        if (item.trinityBaptist) {
          return String(item.number).indexOf(text) !== -1 ||
            matchesTitle;
        }

        return matchesTitle;
      })
    });
  };

  renderTitle(item) {
    if (item.number) {
      return `${item.title} (#${item.number})`;
    }

    return item.title;
  }

  render() {
    if (this.state.song) {
      return (
        <View style={{ backgroundColor: '#FFF', flexGrow: 1 }}>
          <HarmonySong
            renderTitle={this.renderTitle}
            setParentState={this.setParentState}
            song={this.state.song}
          />
        </View>
      );
    }

    return (
      <View>
        <View style={styles.searchContainer}>
          <Icon name="search" />
          <TextInput
            onChangeText={this.filterSongs}
            placeholder="Search"
            style={styles.searchInput}
          />
        </View>
        {
          this.state.songs.map((item, index) => {
            return (
              <TouchableOpacity key={index} onPress={() => this.setState({ song: item })} style={{ borderBottomColor: '#757575', borderBottomWidth: 1 }}>
                <Text style={styles.songTitle}>{this.renderTitle(item)}</Text>
              </TouchableOpacity>
            );
          })
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  songTitle: {
    backgroundColor: '#FFF',
    fontSize: 16,
    padding: 10,
    width: '100%'
  },
  searchContainer: {
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderBottomColor: '#757575',
    borderBottomWidth: 1,
    display: 'flex',
    flexDirection: 'row',
    padding: 10
  },
  searchInput: {
    flexGrow: 1
  }
});
