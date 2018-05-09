import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Switch, Linking, WebView, ScrollView, Slider } from 'react-native';
import { partial } from 'lodash';
import { ActionButton, Icon } from 'react-native-material-ui';

export default class HarmonySong extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      soprano: false,
      alto: false,
      tenor: false,
      bass: false,
      playing: false
    }
  }

  componentWillMount() {
    const { song } = this.props;

    const self = this;

    async function play() {
      if (song.s) {
        self.sopranoSound = new Expo.Audio.Sound();
      }
      if (song.a) {
        self.altoSound = new Expo.Audio.Sound();
      }
      if (song.t) {
        self.tenorSound = new Expo.Audio.Sound();
      }
      if (song.b) {
        self.bassSound = new Expo.Audio.Sound();
      }

      try {
        if (song.s) {
          await self.sopranoSound.loadAsync(song.s);
        }

        if (song.a) {
          await self.altoSound.loadAsync(song.a);
        }

        if (song.t) {
          await self.tenorSound.loadAsync(song.t);
        }

        if (song.b) {
          await self.bassSound.loadAsync(song.b);
        }
      } catch (error) {
        console.log(error)
      }
    };

    play();
  }

  onSpeedChange = value => {
    const { song } = this.props;

    const self = this;

    async function set() {
      if (song.s) {
        await self.sopranoSound.setRateAsync(value, true);
      }
      if (song.a) {
        await self.altoSound.setRateAsync(value, true);
      }
      if (song.t) {
        await self.tenorSound.setRateAsync(value, true);
      }
      if (song.b) {
        await self.bassSound.setRateAsync(value, true);
      }
    }

    set();
  };

  onBack = () => {
    this.stop();
    setTimeout(() => {
      this.props.setParentState({ song: null });
    }, 500);
  };

  togglePart = part => {
    this.setState({
      [part]: !this.state[part],
      playing: false
    });
    this.stop();
  };

  playSong(repeat) {
    const { song } = this.props;
    const { soprano, alto, tenor, bass } = this.state;

    const self = this;
    const timeoutAmount = repeat === 1 ? 0 : song.length;

    this.playTimeout = setTimeout(async function() {
      self.stop();
      self.setState({ playing: true });

      if (soprano && song.s) {
        await self.sopranoSound.playAsync();
      }
      
      if (alto && song.a) {
        await self.altoSound.playAsync();
      }

      if (tenor && song.t) {
        await self.tenorSound.playAsync();
      }

      if (bass && song.b) {
        await self.bassSound.playAsync();
      }

      if (repeat < song.repeat) {
        self.playSong(repeat + 1);
      } else {
        this.playTimeout = setTimeout(() => {
          self.stop();
        }, song.length);
      }
    }, timeoutAmount);
  }

  play = () => {
    this.setState({ playing: true });

    this.playSong(1);
  };

  stop = () => {
    if (this.sopranoSound) {
      this.sopranoSound.stopAsync();
    }

    if (this.altoSound) {
      this.altoSound.stopAsync();
    }

    if (this.tenorSound) {
      this.tenorSound.stopAsync();
    }

    if (this.bassSound) {
      this.bassSound.stopAsync();
    }

    this.setState({ playing: false });
    clearTimeout(this.playTimeout);
  };

  renderPlay() {
    const { soprano, alto, tenor, bass, playing } = this.state;

    if (!soprano && !alto && !tenor && !bass) {
      return (
        <Text style={styles.selectPart}>Select at least one part</Text>
      );
    }

    if (playing) {
      return (
        <TouchableOpacity onPress={this.stop}>
          <Icon name="stop" style={{
            color: '#F44336',
            fontSize: 100,
            marginTop: 10
          }} />
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity onPress={this.play}>
        <Icon name="play-arrow" style={{
          color: '#43A047',
          fontSize: 100,
          marginTop: 10
        }} />
      </TouchableOpacity>
    );
  }

  renderSheetMusic() {
    const { song } = this.props;

    if (song.url) {
      return (
        <TouchableOpacity style={styles.link} onPress={() => Linking.openURL(song.url)}>
          <Text style={styles.linkText}>Online printable sheet music</Text>
          <Icon name="arrow-forward" style={{ color: '#039BE5', fontSize: 20 }} />
        </TouchableOpacity>
      );
    }

    return null; 
  }

  renderLyrics() {
    const { song } = this.props;

    if (song.lyrics) {
      return (
        <TouchableOpacity style={styles.link} onPress={() => Linking.openURL(song.lyrics)}>
          <Text style={styles.linkText}>Online printable lyrics</Text>
          <Icon name="arrow-forward" style={{ color: '#039BE5', fontSize: 20 }} />
        </TouchableOpacity>
      );
    }

    return null; 
  }

  renderBookLink() {
    const { song } = this.props;

    if (song.trinityBaptist) {
      return (
        <TouchableOpacity style={styles.link} onPress={() => Linking.openURL('http://new.girbc.org/node/48')}>
          <Text style={styles.linkText}>Buy the Trinity Hymnal (Baptist Edition)</Text>
          <Icon name="arrow-forward" style={{ color: '#039BE5', fontSize: 20 }} />
        </TouchableOpacity>
      );
    }

    return null;
  }

  render() {
    const { renderTitle, song } = this.props;
    const { soprano, alto, tenor, bass } = this.state;

    return (
      <View style={styles.container}>
        <ScrollView>
          <View style={{ position: 'relative', height: 100, width: 100 }}>
            <ActionButton icon="arrow-back" onPress={this.onBack} />
          </View>
          <Text style={styles.songTitle}>{renderTitle(song)}</Text>
          <View style={styles.sliderContainer}>
            <Text style={styles.sliderText}>Speed</Text>
            <Slider style={{ flexGrow: 1 }} value={1} minimumValue={.5} maximumValue={1.5} onValueChange={this.onSpeedChange} />
          </View>
          {
            song.s
              ? (
                <View>
                  <View style={styles.partContainer}>
                    <Switch value={soprano} onValueChange={partial(this.togglePart, 'soprano')} />
                    <TouchableOpacity onPress={partial(this.togglePart, 'soprano')}>
                      <Text style={styles.partName}>Soprano</Text>
                    </TouchableOpacity>
                  </View>
                  {
                    soprano
                      ? (
                        <View style={styles.sliderContainer}>
                          <Text style={styles.sliderText}>Volume</Text>
                          <Slider style={{ flexGrow: 1 }} value={100} />
                        </View>
                      )
                      : null
                  }
                </View>
              )
              : null
          }
          {
            song.a
              ? (
                <View style={styles.partContainer}>
                  <Switch value={alto} onValueChange={partial(this.togglePart, 'alto')} />
                  <TouchableOpacity onPress={partial(this.togglePart, 'alto')}>
                    <Text style={styles.partName}>Alto</Text>
                  </TouchableOpacity>
                </View>
              )
              : null
          }
          {
            song.t
              ? (
                <View style={styles.partContainer}>
                  <Switch value={tenor} onValueChange={partial(this.togglePart, 'tenor')} />
                  <TouchableOpacity onPress={partial(this.togglePart, 'tenor')}>
                    <Text style={styles.partName}>Tenor</Text>
                  </TouchableOpacity>
                </View>
              )
              : null
          }
          {
            song.b
              ? (
                <View style={styles.partContainer}>
                  <Switch value={bass} onValueChange={partial(this.togglePart, 'bass')} />
                  <TouchableOpacity onPress={partial(this.togglePart, 'bass')}>
                    <Text style={styles.partName}>Bass</Text>
                  </TouchableOpacity>
                </View>
              )
              : null
          }
          {this.renderPlay()}
          <View style={styles.linksContainer}>
            <Text style={{ fontSize: 20 }}>Sheet music/lyrics/hymnal:</Text>
            {this.renderSheetMusic()}
            {this.renderLyrics()}
            {this.renderBookLink()}
          </View>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    flex: 1,
    paddingLeft: 20,
    paddingRight: 20
  },
  songTitle: {
    backgroundColor: '#FFF',
    fontSize: 30,
    marginBottom: 20,
    marginTop: 20,
    width: '100%'
  },
  partContainer: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 10
  },
  partName: {
    fontSize: 20,
    marginLeft: 10
  },
  selectPart: {
    color: '#F44336',
    fontSize: 20,
    marginTop: 10
  },
  linksContainer: {
    borderColor: '#333',
    borderWidth: 1,
    marginTop: 20,
    padding: 10
  },
  link: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    marginTop: 15,
  },
  linkText: {
    color: '#039BE5',
    fontSize: 20,
    marginRight: 5
  },
  sliderContainer: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row'
  },
  sliderText: {
    fontSize: 20,
    marginRight: 10
  }
});
