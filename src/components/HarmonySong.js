import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Switch, Linking, WebView, ScrollView } from 'react-native';
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

  onBack = () => {
    this.stop();
    this.props.setParentState({ song: null });
  };

  togglePart = part => {
    this.setState({ [part]: !this.state[part] });
    this.stop();
  };

  playSong(repeat) {
    const { song } = this.props;
    const { soprano, alto, tenor, bass } = this.state;

    const self = this;
    const timeoutAmount = repeat === 1 ? 750 : song.length;

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
    const { song } = this.props;
    const { soprano, alto, tenor, bass } = this.state;

    this.setState({ playing: true });

    const self = this;

    async function play() {
      if (soprano && song.s) {
        self.sopranoSound = new Expo.Audio.Sound();
      }
      if (alto && song.a) {
        self.altoSound = new Expo.Audio.Sound();
      }
      if (tenor && song.t) {
        self.tenorSound = new Expo.Audio.Sound();
      }
      if (bass && song.b) {
        self.bassSound = new Expo.Audio.Sound();
      }

      try {
        if (soprano && song.s) {
          await self.sopranoSound.loadAsync(song.s);
        }

        if (alto && song.a) {
          await self.altoSound.loadAsync(song.a);
        }

        if (tenor && song.t) {
          await self.tenorSound.loadAsync(song.t);
        }

        if (bass && song.b) {
          await self.bassSound.loadAsync(song.b);
        }

        self.playSong(1);
      } catch (error) {
        console.log(error)
      }
    };

    play();
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
        </TouchableOpacity>
      );
    }

    return null;
  }

  renderWebViewToggle() {
    const { showWebView } = this.state;
    const { song } = this.props;

    if (!song.url) { return null; }

    return (
      <TouchableOpacity onPress={() => this.setState({ showWebView: !showWebView })}>
        <Text style={styles.webViewToggle}>
          {showWebView ? 'Hide sheet music' : 'Show sheet music'}
        </Text>
      </TouchableOpacity>
    );
  }

  renderWebView() {
    const { song } = this.props;

    if (!song.url || !this.state.showWebView) { return null; }

    return (
      <WebView source={{ uri: song.url }} />
    );
  }

  render() {
    const { renderTitle, song } = this.props;
    const { soprano, alto, tenor, bass, showWebView } = this.state;

    if (showWebView) {
      return (
        <View style={styles.container}>
          {this.renderPlay()}
          {this.renderWebViewToggle()}
          {this.renderWebView()}
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <ScrollView>
          <ActionButton icon="arrow-back" style={{ marginTop: 20 }} onPress={this.onBack} />
          <Text style={styles.songTitle}>{renderTitle(song)}</Text>
          {
            song.s
              ? (
                <View style={styles.partContainer}>
                  <Switch value={soprano} onValueChange={partial(this.togglePart, 'soprano')} />
                  <TouchableOpacity onPress={partial(this.togglePart, 'soprano')}>
                    <Text style={styles.partName}>Soprano</Text>
                  </TouchableOpacity>
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
          {this.renderWebViewToggle()}
          {this.renderSheetMusic()}
          {this.renderBookLink()}
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
  link: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: 20,
    width: '85%'
  },
  linkText: {
    color: '#039BE5',
    fontSize: 20,
    marginRight: 10
  },
  webViewToggle: {
    color: '#689F38',
    fontSize: 20,
    marginTop: 20
  }
});
