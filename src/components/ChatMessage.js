import React, { Component } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { Avatar, Image } from 'react-native-elements';
import Store from '../Stores';
import styles from '../drawerscreens/inbox/chat/Styles';
import SoundPlayer from 'react-native-sound-player';

export default class ChatMessage extends Component {
  constructor(props) {
    super(props);
    const { messageItem } = props;
    this.state = {
      message: messageItem.item,
      isAudioPlaying: false,
    }
  }

  playAudio = (url) => {
    this.setState({ isAudioPlaying: true });
    try {
      SoundPlayer.playUrl(url)
    } catch (e) {
      console.log(`cannot play the sound file`, e);
    }
  }

  pauseAudio = () => {
    this.setState({ isAudioPlaying: false });
    SoundPlayer.pause();
  }

  resumeAudio = () => {
    SoundPlayer.resume();
  }

  render = () => {
    const { orderStore } = Store;
    let messageWithImage = this.state.message.text.split(orderStore.chat_image_split);
    let messageWithAudio = this.state.message.text.split(orderStore.chat_audio_split);
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
                <Text style={styles.comment}>{messageWithAudio[1]}</Text>
                {messageWithAudio[0] != '' &&
                  <View style={styles.talkBubbleSquare}>
                    <Text style={styles.comment}>{messageWithAudio[0]}</Text>
                  </View>
                }
              </>
            }
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
                    <TouchableOpacity onPress={() => this.playAudio(messageWithAudio[1])}>
                      <Icon name={"play"} size={18} color={orderStore.color}></Icon>
                    </TouchableOpacity>
                    <Text style={{ textAlignVertical: "center", fontSize: 15, color: orderStore.color, paddingLeft: 20 }}>20:30</Text>
                  </View>
                  :
                  <View style={{ backgroundColor: "white", padding: 15, flexDirection: "row" }}>
                    <TouchableOpacity onPress={() => this.pauseAudio()} >
                      <Icon name={"pause"} size={18} color={orderStore.color}></Icon>
                    </TouchableOpacity>
                    <Text style={{ textAlignVertical: "center", fontSize: 15, color: orderStore.color, paddingLeft: 20 }}>20:30</Text>
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