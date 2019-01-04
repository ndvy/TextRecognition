import React, { Component } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Alert,
  Image, TouchableOpacity, NativeModules, Dimensions, Button
} from 'react-native';

import ActionButton from 'react-native-action-button';
import IconIon from 'react-native-vector-icons/Ionicons';
import IconMaterial from 'react-native-vector-icons/MaterialIcons';
import Video from 'react-native-video';
import DialogInput from 'react-native-dialog-input';

import RNFetchBlob from 'rn-fetch-blob';

var ImagePicker = NativeModules.ImageCropPicker;

const styles = StyleSheet.create({
  actionButtonIcon: {
    fontSize: 24,
    height: 25,
    color: 'white',
  },
  container: {
    flex: 1,
    margin: 5,
    justifyContent: 'center',
    alignItems: 'center'
  },
  text: {
    color: 'black',
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 5
  }
});

export default class App extends Component {
  constructor() {
    super();
    this.state = {
      image: null,
      images: null,
      apiIp: '10.10.65.105',
      showApiIpDialog: false
    };
  }

  pickSingleWithCamera(cropping) {
    ImagePicker.openCamera({
      cropping: cropping,
      width: 500,
      height: 100,
      includeExif: true,
    }).then(image => {
      console.log('received image', image);
      this.setState({
        image: { uri: image.path, width: image.width, height: image.height },
        images: null
      });
    }).catch(e => alert(e));
  }

  cleanupImages() {
    ImagePicker.clean().then(() => {
      console.log('removed tmp images from tmp directory');
      this.setState({
        image: null,
        images: null
      });
    }).catch(e => {
      alert(e);
    });
  }

  cropLast() {
    if (!this.state.image) {
      return Alert.alert('No image', 'Before open cropping only, please select image');
    }

    ImagePicker.openCropper({
      path: this.state.image.uri,
      width: 500,
      height: 100
    }).then(image => {
      console.log('received cropped image', image);
      this.setState({
        image: { uri: image.path, width: image.width, height: image.height, mime: image.mime },
        images: null
      });
    }).catch(e => {
      console.log(e);
      Alert.alert(e.message ? e.message : e);
    });
  }

  pickSingle(cropit, circular = false) {
    ImagePicker.openPicker({
      width: 500,
      height: 100,
      cropping: cropit,
      cropperCircleOverlay: circular,
      compressImageMaxWidth: 640,
      compressImageMaxHeight: 480,
      compressImageQuality: 0.5,
      compressVideoPreset: 'MediumQuality',
      includeExif: true,
    }).then(image => {
      console.log('received image', image);
      this.setState({
        image: { uri: image.path, width: image.width, height: image.height, mime: image.mime },
        images: null
      });
    }).catch(e => {
      console.log(e);
      Alert.alert(e.message ? e.message : e);
    });
  }

  pickMultiple() {
    ImagePicker.openPicker({
      multiple: true,
      waitAnimationEnd: false,
      includeExif: true,
      forceJpg: true,
    }).then(images => {
      this.setState({
        image: null,
        images: images.map(i => {
          console.log('received image', i);
          return { uri: i.path, width: i.width, height: i.height, mime: i.mime };
        })
      });
    }).catch(e => alert(e));
  }

  scaledHeight(oldW, oldH, newW) {
    return (oldH / oldW) * newW;
  }

  selectApiIp() {
    this.setState({ showApiIpDialog: true });
  }

  renderVideo(video) {
    return (<View style={{ height: 300, width: 300 }}>
      <Video source={{ uri: video.uri, type: video.mime }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          right: 0
        }}
        rate={1}
        paused={false}
        volume={1}
        muted={false}
        resizeMode={'cover'}
        onError={e => console.log(e)}
        onLoad={load => console.log(load)}
        repeat={true} />
    </View>);
  }

  renderImage(image) {
    return <Image style={{ width: 300, height: 300, resizeMode: 'contain' }} source={image} />
  }

  renderAsset(image) {
    if (image.mime && image.mime.toLowerCase().indexOf('video/') !== -1) {
      return this.renderVideo(image);
    }

    return this.renderImage(image);
  }

  render() {
    return (<View style={styles.container}>
      <ScrollView>
        {this.state.image ? this.renderAsset(this.state.image) : null}
        {this.state.images ? this.state.images.map(i => <View key={i.uri}>{this.renderAsset(i)}</View>) : null}
      </ScrollView>
      <DialogInput isDialogVisible={this.state.showApiIpDialog}
        title={'API IP Config'}
        message={"Input the API's IP address:"}
        hintInput={'xxx.xxx.xxx.xxx'}
        initValueTextInput={this.state.apiIp}
        submitInput={(inputText) => { this.setState({ apiIp: inputText, showApiIpDialog: false }) }}
        closeDialog={() => { this.setState({ showApiIpDialog: false }) }}>
      </DialogInput>
      <ActionButton buttonColor="rgba(231,76,60,1)" offsetY={50} offsetX={25}>
        <ActionButton.Item buttonColor='#9b59b6' title='From camera' onPress={() => this.pickSingleWithCamera(true)}>
          <IconIon name='md-camera' style={styles.actionButtonIcon} />
        </ActionButton.Item>
        <ActionButton.Item buttonColor='#1abc9c' title='From file' onPress={() => this.pickSingle(false)}>
          <IconIon name='md-image' style={styles.actionButtonIcon} />
        </ActionButton.Item>
        <ActionButton.Item buttonColor='#3498db' title='From multiple files' onPress={() => this.pickMultiple()}>
          <IconIon name='md-images' style={styles.actionButtonIcon} />
        </ActionButton.Item>
        <ActionButton.Item buttonColor='#ef6c00' title='Crop last selected' onPress={() => this.cropLast()}>
          <IconIon name='md-crop' style={styles.actionButtonIcon} />
        </ActionButton.Item>
        <ActionButton.Item buttonColor='#546e7a' title='Clean all' onPress={() => this.cleanupImages()}>
          <IconMaterial name='delete' style={styles.actionButtonIcon} />
        </ActionButton.Item>
        <ActionButton.Item buttonColor='#007c91' title="Set API's IP" onPress={() => this.selectApiIp()}>
          <IconIon name='md-build' style={styles.actionButtonIcon} />
        </ActionButton.Item>
      </ActionButton>
      <Button
        onPress={() => {
          RNFetchBlob.config({
            trusty: true
          })
            .fetch('POST', 'https://' + this.state.apiIp + '/api/ocr', {
              'Content-Type': 'multipart/form-data'
            }, [
                { name: 'image', filename: 'data.jpg', type: 'image/foo', data: RNFetchBlob.wrap(this.state.image.uri) }
              ]).then((resp) => {
                Alert.alert('Response', resp.data);
              }).catch((err) => {
              })
			  
        }}
        title="Perform Recognition"
      />
      <Text
        style={styles.text}>
        {"Current API's IP: "}{this.state.apiIp}
      </Text>
    </View>);
  }
}