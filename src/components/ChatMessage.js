import React, { Component } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { Avatar, Image } from 'react-native-elements';
import Store from '../Stores';
import Appearences from '../config/Appearences';
import styles from '../drawerscreens/inbox/chat/Styles';
import * as Progress from 'react-native-progress';
import Sound from 'react-native-sound';

const SOUND_STATE = {
  DEFAULT: 0,
  INIT_SUCCESS: 1,
  INIT_FAILED: 2,
  PLAYING: 3,
  PAUSING: 4
}

export default class ChatMessage extends Component {
  constructor(props) {
    super(props);
    const { messageItem } = props;
    this.state = {
      message: messageItem.item,
      isAudioPlaying: false,
      soundStatus: SOUND_STATE.DEFAULT,
      timeSeek: 0,
      duration: 0,
      loading: false
    }
    this.soundInstance = null;
  }

  componentDidMount() {
    const { orderStore } = Store;
    let messageWithAudio = this.state.message.text.split(orderStore.chat_audio_split);
    if (messageWithAudio.length > 1) {
      Sound.setCategory("Record");
      this.soundInstance = new Sound(messageWithAudio[1], Sound.MAIN_BUNDLE, async (error) => {
        if (error)
          this.setState({ soundStatus: SOUND_STATE.INIT_FAILED });
        else {
          const duration = await this.soundInstance.getDuration();
          this.setState({ soundStatus: SOUND_STATE.INIT_SUCCESS, duration: Math.floor(duration) });
        }
      });
    }
  }

  componentWillUnmount() {
    if (this.state.soundStatus != SOUND_STATE.DEFAULT)
      this.soundInstance && this.soundInstance.stop();
    clearInterval(this.soundAudioTimer);
  }

  getTimeFromSec(sec) {
    let time = '00:00';
    if (!sec) return time;
    sec = parseInt(sec);
    if (sec < 10) time = `00:0${sec}`;
    else if (sec < 60) time = `00:${sec}`;
    else time = `${parseInt(sec / 60)}:${parseInt(sec % 60)}`;
    return time;
  }

  playAudio = () => {
    try {
      if (this.state.soundStatus == SOUND_STATE.PAUSING) {
        this.soundInstance.play((success) =>
          this.setState({ soundStatus: SOUND_STATE.PLAYING, isAudioPlaying: true }, () => {
            console.log("resume play")
            this.soundAudioTimer = setInterval(() => {
              let time = this.state.timeSeek;
              if (time == this.state.duration) {
                clearInterval(this.soundAudioTimer);
                this.setState({ timeSeek: 0, isAudioPlaying: false, soundStatus: SOUND_STATE.INIT_SUCCESS })
                return;
              }
              if (!time) time = 0;
              time++;
              this.setState({ timeSeek: time })
            }, 1000);
          })
        );
      }
      else {
        this.setState({ loading: true }, () => {
          this.soundInstance.stop(() => {
            this.soundInstance.play((success) =>
              this.setState({ soundStatus: SOUND_STATE.PLAYING, isAudioPlaying: true, loading: false }, () => {
                console.log("success play")

                clearInterval(this.soundAudioTimer);
                this.soundAudioTimer = setInterval(() => {
                  let time = this.state.timeSeek;
                  if (time == this.state.duration) {
                    clearInterval(this.soundAudioTimer);
                    console.log('finish play')
                    this.setState({ timeSeek: 0, isAudioPlaying: false, soundStatus: SOUND_STATE.INIT_SUCCESS })
                    return;
                  }
                  if (!time) time = 0;
                  time++;
                  this.setState({ timeSeek: time })
                }, 1000);
              })
            );
          });
        })

      }
    } catch (error) {
      console.log("sound play error", error);
    }
  }

  pauseAudio = () => {
    this.soundInstance.pause(() => {
      this.setState({ isAudioPlaying: false, soundStatus: SOUND_STATE.PAUSING });
      console.log("pause play")
      clearInterval(this.soundAudioTimer);
    });
  }

  render = () => {
    const { orderStore } = Store;
    let messageWithImage = this.state.message.text.split(orderStore.chat_image_split);
    let messageWithAudio = this.state.message.text.split(orderStore.chat_audio_split);
    let duration = this.state.timeSeek != 0 ? this.state.timeSeek : this.state.duration;

    if (this.state.message.type === 'reply') {
      return (
        <View
          style={styles.commentRowContainer}>
          <View>
            <View style={styles.listImageContainer}>

              <Avatar
                size='medium'
                rounded
                source={{ uri: this.state.message.img }}
                onPress={() => console.log("Works!")}
                activeOpacity={0.7}
                placeholderStyle={{ backgroundColor: "transparent" }}
                containerStyle={{ alignSelf: 'center', marginVertical: 20, marginHorizontal: 10 }}
              />

            </View>
            <Text style={[styles.timeText, { color: orderStore.color }]}>
              {this.state.message.date}
            </Text>
          </View>

          <View style={styles.triangle} />
          <View style={styles.talkBubble}>
            {messageWithImage.length > 1 &&
              <>
                <Image source={{ uri: messageWithImage[1] }} style={{ width: "50%", height: 100 }} placeholderStyle={{ backgroundColor: "transparent" }} PlaceholderContent={<ActivityIndicator color={orderStore.color} size="small" />} ></Image>
                {messageWithImage[0] != '' &&
                  <View style={styles.talkBubbleSquare}>
                    <Text style={styles.comment}>{messageWithImage[0]}</Text>
                  </View>
                }
              </>
            }
            {messageWithAudio.length > 1 &&
              <>
                {!this.state.isAudioPlaying ?
                  <View style={{ backgroundColor: "white", padding: 15, flexDirection: "row" }}>
                    <TouchableOpacity onPress={() => this.playAudio()}>
                      <Icon name={"play"} size={18} color={orderStore.color}></Icon>
                    </TouchableOpacity>
                    <Text style={{ textAlignVertical: "center", fontSize: 15, color: orderStore.color, paddingLeft: 20 }}>{this.getTimeFromSec(duration)}</Text>
                  </View>
                  :
                  <View style={{ backgroundColor: "white", padding: 15, flexDirection: "row" }}>
                    <TouchableOpacity onPress={() => this.pauseAudio()} >
                      <Icon name={"pause"} size={18} color={orderStore.color}></Icon>
                    </TouchableOpacity>
                    <Text style={{ textAlignVertical: "center", fontSize: 15, color: orderStore.color, paddingLeft: 20 }}>{this.getTimeFromSec(duration)}</Text>
                  </View>
                }
                {messageWithAudio[0] != '' &&
                  <View style={styles.talkBubbleSquare}>
                    <Text style={styles.comment}>{messageWithAudio[0]}</Text>
                  </View>
                }
              </>
            }
            {/* <Visibility
              hide={this.state.loading}
              style={{ height: '100%', width: '10%', }}>
              <TouchableOpacity

                style={styles.searchButton}>
                <Progress.Circle
                  size={Appearences.Fonts.headingFontSize}
                  indeterminate={true}
                  color={orderStore.color}
                />
              </TouchableOpacity>
            </Visibility> */}
            {messageWithAudio.length < 2 && messageWithImage.length < 2 &&
              <View style={styles.talkBubbleSquare}>
                <Text style={styles.comment}>{this.state.message.text}</Text>
              </View>
            }

          </View>

        </View>);
    }

    else {
      return (
        <View
          style={styles.replyRowContainer}>

          <View style={styles.talkBubble}>
            {messageWithImage.length > 1 &&
              <>
                <Image source={{ uri: messageWithImage[1] }} style={{ width: "50%", height: 100 }} placeholderStyle={{ backgroundColor: "transparent" }} PlaceholderContent={<ActivityIndicator color={orderStore.color} size="small" />} ></Image>
                {messageWithImage[0] != '' &&
                  <View style={styles.replyTalkBubbleSquare}>
                    <Text style={styles.comment}>{messageWithImage[0]}</Text>
                  </View>
                }
              </>
            }
            {messageWithAudio.length > 1 &&
              <>
                {!this.state.isAudioPlaying ?
                  <View style={{ backgroundColor: "white", padding: 15, flexDirection: "row" }}>
                    {!this.state.loading ?
                      <TouchableOpacity onPress={() => this.playAudio()}>
                        <Icon name={"play"} size={18} color={orderStore.color}></Icon>
                      </TouchableOpacity>
                      :
                      <TouchableOpacity>
                        <Progress.Circle
                          size={Appearences.Fonts.headingFontSize}
                          indeterminate={true}
                          color={orderStore.color}
                        />
                      </TouchableOpacity>
                    }

                    <Text style={{ textAlignVertical: "center", fontSize: 15, color: orderStore.color, paddingLeft: 20 }}>{this.getTimeFromSec(duration)}</Text>
                  </View>
                  :
                  <View style={{ backgroundColor: "white", padding: 15, flexDirection: "row" }}>
                    {!this.state.loading ?
                      <TouchableOpacity onPress={() => this.pauseAudio()} >
                        <Icon name={"pause"} size={18} color={orderStore.color}></Icon>
                      </TouchableOpacity>
                      :
                      <TouchableOpacity>
                        <Progress.Circle
                          size={Appearences.Fonts.headingFontSize}
                          indeterminate={true}
                          color={orderStore.color}
                        />
                      </TouchableOpacity>
                    }

                    <Text style={{ textAlignVertical: "center", fontSize: 15, color: orderStore.color, paddingLeft: 20 }}>{this.getTimeFromSec(duration)}</Text>
                  </View>
                }
                {messageWithAudio[0] != '' &&
                  <View style={styles.talkBubbleSquare}>
                    <Text style={styles.comment}>{messageWithAudio[0]}</Text>
                  </View>
                }
              </>
            }

            {messageWithAudio.length < 2 && messageWithImage.length < 2 &&
              <View style={styles.replyTalkBubbleSquare}>
                <Text style={styles.comment}>{this.state.message.text}</Text>
              </View>
            }

          </View>
          <View style={styles.triangleReply} />

          <View>
            <View style={styles.listImageContainer}>
              <Avatar
                size='medium'
                rounded
                source={{ uri: this.state.message.img }}
                onPress={() => console.log("Works!")}
                activeOpacity={0.7}
                placeholderStyle={{ backgroundColor: "transparent" }}
                containerStyle={{ alignSelf: 'center', marginVertical: 20, marginHorizontal: 10 }}
              />

            </View>
            <Text style={[styles.timeText, { color: orderStore.color }]}>
              {this.state.message.date}
            </Text>
          </View>
        </View>
      );
    }
  }
}