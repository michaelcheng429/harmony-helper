import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Switch, Linking, WebView, ScrollView, Slider } from 'react-native';
import { debounce, partial } from 'lodash';
import { ActionButton, Icon } from 'react-native-material-ui';

export default class HarmonySong extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      sopranoStatus: '',
      altoStatus: '',
      tenorStatus: '',
      bassStatus: '',
      soprano: true,
      alto: true,
      tenor: true,
      bass: true,
      sopranoVolume: 1,
      altoVolume: 1,
      tenorVolume: 1,
      bassVolume: 1,
      playing: false,
      rate: 1,
      length: 0,
      currentTime: 0
    }

    this.onTimeChange = debounce(this.onTimeChange, 250);
  }

  componentWillMount() {
    const { song } = this.props;
    const { length } = this.state;

      if (song.s) {
        this.setState({ sopranoStatus: 'loading' })

        this.sopranoSound = new Expo.Audio.Sound();

        this.sopranoSound.loadAsync(song.s).then(status => {
          this.setState({ sopranoStatus: 'loaded', length: status.durationMillis });
        });
      }
      if (song.a) {
        this.setState({ altoStatus: 'loading' })

        this.altoSound = new Expo.Audio.Sound();

        this.altoSound.loadAsync(song.a).then(status => {
          this.setState({ altoStatus: 'loaded', length: status.durationMillis });
        });
      }
      if (song.t) {
        this.setState({ tenorStatus: 'loading' })

        this.tenorSound = new Expo.Audio.Sound();

        this.tenorSound.loadAsync(song.t).then(status => {
          this.setState({ tenorStatus: 'loaded', length: status.durationMillis });
        });
      }
      if (song.b) {
        this.setState({ bassStatus: 'loading' })

        this.bassSound = new Expo.Audio.Sound();

        this.bassSound.loadAsync(song.b).then(status => {
          this.setState({ bassStatus: 'loaded', length: status.durationMillis });
        });
      }
  }

  getTime(time) {
    time = Number(time) / 1000;

    const min = Math.floor(time / 60);
    let sec = Math.floor(time % 60);

    if (String(sec).length === 1) {
      sec = `0${sec}`;
    } else if (String(sec).length === 1) {
      sec = '00';
    }

    return `${min}:${sec}`;
  }

  onSpeedChange = value => {
    const { song } = this.props;

    this.setState({ rate: value });

    if (song.s) {
      this.sopranoSound.setRateAsync(value, true);
    }
    if (song.a) {
      this.altoSound.setRateAsync(value, true);
    }
    if (song.t) {
      this.tenorSound.setRateAsync(value, true);
    }
    if (song.b) {
      this.bassSound.setRateAsync(value, true);
    }
  };

  onVolumeChange = (part, value) => {
    this.setState({ [`${part}Volume`]: value });

    if (part === 'soprano') {
      this.sopranoSound.setVolumeAsync(value);
    }
    if (part === 'alto') {
      this.altoSound.setVolumeAsync(value);
    }
    if (part === 'tenor') {
      this.tenorSound.setVolumeAsync(value);
    }
    if (part === 'bass') {
      this.bassSound.setVolumeAsync(value);
    }
  };

  onTimeChange = value => {
    const { song } = this.props;

    this.setState({ currentTime: value });

    if (song.s) {
      this.sopranoSound.setPositionAsync(value);
    }
    
    if (song.a) {
      this.altoSound.setPositionAsync(value);
    }

    if (song.t) {
      this.tenorSound.setPositionAsync(value);
    }

    if (song.b) {
      this.bassSound.setPositionAsync(value);
    }
  }

  onBack = () => {
    this.stop();
    setTimeout(() => {
      this.props.setParentState({ song: null });
    }, 500);
  };

  togglePart = part => {
    this.pause();
    this.setState({
      [part]: !this.state[part],
      playing: false
    });
  };

  play = () => {
    const { song } = this.props;
    const { soprano, alto, tenor, bass, rate, length, currentTime } = this.state;

    this.setState({ playing: true });

    if (soprano && song.s) {
      this.sopranoSound.playAsync();
    }
    
    if (alto && song.a) {
      this.altoSound.playAsync();
    }

    if (tenor && song.t) {
      this.tenorSound.playAsync();
    }

    if (bass && song.b) {
      this.bassSound.playAsync();
    }

    let soundObject;

    if (soprano && song.s) {
      soundObject = this.sopranoSound;
    } else if (alto && song.a) {
      soundObject = this.altoSound;
    } else if (tenor && song.t) {
      soundObject = this.tenorSound;
    } else if (bass && song.b) {
      soundObject = this.bassSound;
    }

    if (soundObject) {
      soundObject.getStatusAsync().then(status => {
        this.statusInterval = setInterval(() => {
          soundObject.getStatusAsync().then(status1 => {
            if (status1.isPlaying) {
              this.setState({ currentTime: status1.positionMillis });
            } else {
              setTimeout(() => {
                this.stop();
              }, 250);
            }
          })
        }, 1000);
      });
    }
  };

  pause = () => {
    clearInterval(this.statusInterval);

    if (this.sopranoSound) {
      this.sopranoSound.pauseAsync();
    }

    if (this.altoSound) {
      this.altoSound.pauseAsync();
    }

    if (this.tenorSound) {
      this.tenorSound.pauseAsync();
    }

    if (this.bassSound) {
      this.bassSound.pauseAsync();
    }

    this.setState({ playing: false });
  }

  stop = () => {
    clearInterval(this.statusInterval);

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

    this.setState({ playing: false, currentTime: 0 });
  };

  renderPart(part, name) {
    if (this.state[`${part}Status`] === 'loading') {
      return <Text style={styles.partLoading}>Loading {part}...</Text>;
    }

    if (this.state[`${part}Status`] === 'loaded') {
      return (
        <View>
          <View style={styles.partContainer}>
            <Switch value={this.state[part]} onValueChange={partial(this.togglePart, part)} />
            <TouchableOpacity onPress={partial(this.togglePart, part)}>
              <Text style={styles.partName}>{name}</Text>
            </TouchableOpacity>
          </View>
          {
            this.state[part]
              ? (
                <View style={styles.sliderContainer}>
                  <Text style={styles.sliderText}>Volume</Text>
                  <Slider style={{ flexGrow: 1 }} value={this.state[`${part}Volume`]} minimumValue={0} maximumValue={1} onValueChange={partial(this.onVolumeChange, part)} />
                </View>
              )
              : null
          }
        </View>
      );
    }

    return null;
  }

  renderPlay() {
    const { soprano, alto, tenor, bass, playing } = this.state;

    if (!soprano && !alto && !tenor && !bass) {
      return (
        <Text style={styles.selectPart}>Select at least one part</Text>
      );
    }

    if (playing) {
      return (
        <View style={styles.playContainer}>
          <TouchableOpacity onPress={this.pause}>
            <Icon name="pause" style={{
              color: '#EF6C00',
              fontSize: 100,
              marginTop: 10
            }} />
          </TouchableOpacity>
          <TouchableOpacity onPress={this.stop}>
            <Icon name="stop" style={{
              color: '#F44336',
              fontSize: 100,
              marginTop: 10
            }} />
          </TouchableOpacity>
        </View>
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
    const {
      sopranoStatus,
      altoStatus,
      tenorStatus,
      bassStatus,
      soprano,
      alto,
      tenor,
      bass,
      playing,
      rate,
      length,
      sopranoVolume,
      altoVolume,
      tenorVolume,
      bassVolume,
      currentTime
    } = this.state;

    return (
      <View style={styles.container}>
        <ScrollView>
          <View style={{ position: 'relative', height: 100, width: 100 }}>
            <ActionButton icon="arrow-back" onPress={this.onBack} />
          </View>
          <Text style={styles.songTitle}>{renderTitle(song)}</Text>
          {this.renderPlay()}
          <View style={[styles.sliderContainer, styles.sliderContainerTime]}>
            <Text style={styles.sliderText}>{this.getTime(currentTime)}</Text>
            <Slider style={styles.sliderBar} value={currentTime} minimumValue={0} maximumValue={length} onValueChange={this.onTimeChange} />
            <Text style={styles.sliderTextRight}>{this.getTime(length)}</Text>
          </View>
          <View style={styles.partsContainer}>
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderText}>Speed</Text>
              <Slider style={{ flexGrow: 1 }} value={rate} minimumValue={.01} maximumValue={2} onValueChange={this.onSpeedChange} />
            </View>
            {this.renderPart('soprano', 'Soprano')}
            {this.renderPart('alto', 'Alto')}
            {this.renderPart('tenor', 'Tenor')}
            {this.renderPart('bass', 'Bass')}
          </View>
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
    flexDirection: 'row',
    marginBottom: 10,
  },
  sliderContainerTime: {
    marginBottom: 10,
  },
  sliderText: {
    fontSize: 20,
    marginRight: 10
  },
  sliderTextRight: {
    fontSize: 20,
    marginLeft: 10
  },
  sliderBar: {
    flexGrow: 1
  },
  partsContainer: {
    borderColor: '#333',
    borderRadius: 10,
    borderWidth: 1,
    padding: 10
  },
  playContainer: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row'
  }
});
